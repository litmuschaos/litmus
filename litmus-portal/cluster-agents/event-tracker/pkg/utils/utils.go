package utils

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/jmespath/go-jmespath"
	litmuschaosv1 "github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/api/v1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/pkg/k8s"
	"io/ioutil"
	v1 "k8s.io/api/apps/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"k8s.io/client-go/dynamic"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

var (
	AgentNamespace = os.Getenv("AGENT_NAMESPACE")
)

const (
	ExternAgentConfigName = "agent-config"
)

func cases(key string, value string, operator string) bool {
	if operator == "EqualTo" {
		return key == value
	} else if operator == "NotEqualTo" {
		return key != value
	} else if operator == "LessThan" {
		return key < value
	} else if operator == "GreaterThan" {
		return key > value
	} else if operator == "LessThanEqualTo" {
		return key <= value
	} else if operator == "GreaterThanEqualTo" {
		return key >= value
	}
	return false
}

func conditionChecker(etp litmuschaosv1.EventTrackerPolicy, data interface{}) bool {

	final_result := false
	if etp.Spec.ConditionType == "and" {
		for _, condition := range etp.Spec.Conditions {
			result, err := jmespath.Search(condition.Key, data)
			if err != nil {
				log.Print(err)
				return false
			}

			str := fmt.Sprintf("%v", result)
			if val := cases(str, condition.Value, condition.Operator); !val {
				final_result = val
				break
			} else if val {
				final_result = true
			}
		}
	} else if etp.Spec.ConditionType == "or" {
		for _, condition := range etp.Spec.Conditions {
			result, err := jmespath.Search(condition.Key, data)
			if err != nil {
				log.Print(err)
			}

			str := fmt.Sprintf("%v", result)
			if val := cases(str, condition.Value, condition.Operator); val {
				log.Print(val)
				final_result = val
			}
		}
	}

	return final_result
}

func PolicyAuditor(resourceType string, obj interface{}, workflowid string) error {
	restConfig, err := k8s.GetKubeConfig()
	if err != nil {
		log.Print(err)
	}

	clientSet, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		log.Print(err)
	}

	deploymentRes := schema.GroupVersionResource{Group: "eventtracker.litmuschaos.io", Version: "v1", Resource: "eventtrackerpolicies"}
	deploymentConfigList, err := clientSet.Resource(deploymentRes).Namespace(AgentNamespace).List(metav1.ListOptions{})
	if err != nil {
		log.Print(err)
	}

	for _, ep := range deploymentConfigList.Items {

		eventTrackerPolicy, err := clientSet.Resource(deploymentRes).Namespace(AgentNamespace).Get(ep.GetName(), metav1.GetOptions{})
		if err != nil {
			log.Print(err)
		}

		var etp litmuschaosv1.EventTrackerPolicy
		data, err := json.Marshal(eventTrackerPolicy.Object)
		if err != nil {
			log.Print(err)
		}

		err = json.Unmarshal(data, &etp)
		if err != nil {
			log.Print(err)
		}

		var dataInterface interface{}
		var resourceName string
		if strings.ToLower(resourceType) == "deployment" {
			deps := obj.(*v1.Deployment)
			resourceName = deps.GetName()
			mar, err := json.Marshal(deps)
			if err != nil {
				log.Print(err)
			}

			err = json.Unmarshal(mar, &dataInterface)
		} else if strings.ToLower(resourceType) == "statefulset" {
			sts := obj.(*v1.StatefulSet)
			resourceName = sts.GetName()
			mar, err := json.Marshal(sts)
			if err != nil {
				log.Print(err)
			}

			err = json.Unmarshal(mar, &dataInterface)
		} else if strings.ToLower(resourceType) == "daemonset" {
			sts := obj.(*v1.DaemonSet)
			resourceName = sts.GetName()
			mar, err := json.Marshal(sts)
			if err != nil {
				log.Print(err)
			}

			err = json.Unmarshal(mar, &dataInterface)
		} else {
			return errors.New("Resource not supported")
		}

		check := conditionChecker(etp, dataInterface)
		var result string
		if check == true {
			result = "ConditionPassed"
		} else if check == false {
			result = "ConditionFailed"
		}

		log.Print("$v for resourceName %v and resourceType %v",result,resourceName,resourceType)

		etp.Statuses = append(etp.Statuses, litmuschaosv1.EventTrackerPolicyStatus{
			TimeStamp:    time.Now().Format(time.RFC850),
			Resource:     resourceType,
			ResourceName: resourceName,
			Result:       result,
			WorkflowID:   workflowid,
			IsTriggered:  "false",
		})

		// Updating EventTrackerPolicy
		var unstruc unstructured.Unstructured
		data, err = json.Marshal(etp)
		if err != nil {
			return err
		}

		err = json.Unmarshal(data, &unstruc)
		if err != nil {
			return err
		}

		_, err = clientSet.Resource(deploymentRes).Namespace(AgentNamespace).Update(&unstruc, metav1.UpdateOptions{})
		if err != nil {
			return err
		}

		log.Print("EventTrackerPolicy updated")
	}

	return nil
}

func getAgentConfigMapData() (string, string, string, error) {
	clientset, err := k8s.K8sClient()
	if err != nil {
		return "", "", "", err
	}

	getCM, err := clientset.CoreV1().ConfigMaps(AgentNamespace).Get(ExternAgentConfigName, metav1.GetOptions{})
	if k8sErrors.IsNotFound(err) {
		return "", "", "", errors.New(ExternAgentConfigName + " configmap not found")
	} else if getCM.Data["IS_CLUSTER_CONFIRMED"] == "true" {
		return getCM.Data["ACCESS_KEY"], getCM.Data["CLUSTER_ID"], getCM.Data["SERVER_ADDR"], nil
	} else if err != nil {
		return "", "", "", err
	}

	return "", "", "", nil
}

// Function to send request to litmus graphql server
func SendRequest(workflowID string) (string, error) {
	accessKey, clusterID, serverAddr, err := getAgentConfigMapData()
	if err != nil {
		return "", err
	}

	payload := `{"query": "mutation { gitopsNotifer(clusterInfo: { cluster_id: \"` + clusterID + `\", access_key: \"` + accessKey + `\"}, workflow_id: \"` + workflowID + `\")\n}"}`
	req, err := http.NewRequest("POST", serverAddr, bytes.NewBuffer([]byte(payload)))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "URL is not reachable or Bad request", nil
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}
