package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"

	"github.com/jmespath/go-jmespath"
	litmuschaosv1 "github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/api/v1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/pkg/k8s"
	v1 "k8s.io/api/apps/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"k8s.io/client-go/dynamic"
)

var (
	AgentNamespace = os.Getenv("AGENT_NAMESPACE")
)

const (
	ExternAgentConfigName = "agent-config"
	ConditionPassed       = "ConditionPassed"
	ConditionFailed       = "ConditionFailed"
)

func cases(key string, value string, operator string) bool {
	switch operator {
	case "EqualTo":
		return key == value
	case "NotEqualTo":
		return key != value
	case "LessThan":
		return key < value
	case "GreaterThan":
		return key > value
	case "GreaterThanEqualTo":
		return key >= value
	case "LessThanEqualTo":
		return key <= value
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
				final_result = val
			}
		}
	}

	return final_result
}

func PolicyAuditor(resourceType string, obj interface{}, workflowid string) error {
	restConfig, err := k8s.GetKubeConfig()
	if err != nil {
		return err
	}

	clientSet, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		return err
	}

	deploymentRes := schema.GroupVersionResource{Group: "eventtracker.litmuschaos.io", Version: "v1", Resource: "eventtrackerpolicies"}
	deploymentConfigList, err := clientSet.Resource(deploymentRes).Namespace(AgentNamespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return err
	}

	for _, ep := range deploymentConfigList.Items {

		eventTrackerPolicy, err := clientSet.Resource(deploymentRes).Namespace(AgentNamespace).Get(context.TODO(), ep.GetName(), metav1.GetOptions{})
		if err != nil {
			return err
		}

		var etp litmuschaosv1.EventTrackerPolicy
		data, err := json.Marshal(eventTrackerPolicy.Object)
		if err != nil {
			return err
		}

		err = json.Unmarshal(data, &etp)
		if err != nil {
			return err
		}

		var dataInterface interface{}
		var resourceName string
		expr := strings.ToLower(resourceType)
		switch expr {
		case "deployment":
			deps := obj.(*v1.Deployment)
			resourceName = deps.GetName()
			mar, err := json.Marshal(deps)
			if err != nil {
				return err
			}

			err = json.Unmarshal(mar, &dataInterface)
		case "statefulset":
			sts := obj.(*v1.StatefulSet)
			resourceName = sts.GetName()
			mar, err := json.Marshal(sts)
			if err != nil {
				return err
			}

			err = json.Unmarshal(mar, &dataInterface)
		case "daemonset":
			sts := obj.(*v1.DaemonSet)
			resourceName = sts.GetName()
			mar, err := json.Marshal(sts)
			if err != nil {
				return err
			}

			err = json.Unmarshal(mar, &dataInterface)
		default:
			return errors.New("Resource not supported")
		}

		check := conditionChecker(etp, dataInterface)
		var result string
		if check == true {
			result = ConditionPassed
		} else if check == false {
			result = ConditionFailed
		}

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

		_, err = clientSet.Resource(deploymentRes).Namespace(AgentNamespace).Update(context.TODO(), &unstruc, metav1.UpdateOptions{})
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

	getCM, err := clientset.CoreV1().ConfigMaps(AgentNamespace).Get(context.TODO(), ExternAgentConfigName, metav1.GetOptions{})
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