package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"

	"github.com/sirupsen/logrus"

	"github.com/jmespath/go-jmespath"
	litmuschaosv1 "github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/api/v1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/pkg/k8s"
	v1 "k8s.io/api/apps/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"net/http"
	"os"
	"strings"
	"time"

	"k8s.io/client-go/dynamic"
)

var (
	InfraNamespace = os.Getenv("INFRA_NAMESPACE")
	Version        = os.Getenv("VERSION")
)

const (
	AgentConfigName = "subscriber-config"
	AgentSecretName = "subscriber-secret"

	ConditionPassed = "ConditionPassed"
	//ConditionFailed       = "ConditionFailed"
)

const (
	StateFulSet = "statefulset"
	Deployment  = "deployment"
	DaemonSet   = "daemonset"
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

func conditionChecker(etp litmuschaosv1.EventTrackerPolicy, newData interface{}, oldData interface{}) bool {
	final_result := false
	if etp.Spec.ConditionType == "and" {
		for _, condition := range etp.Spec.Conditions {
			newDataResult, err := jmespath.Search(condition.Key, newData)
			if err != nil {
				logrus.Error(err)
				return false
			}

			oldDataResult, err := jmespath.Search(condition.Key, oldData)
			if err != nil {
				logrus.Error(err)
				return false
			}

			if newDataResult != oldDataResult {
				if condition.Operator == "Change" {
					final_result = true
				} else {
					str := fmt.Sprintf("%v", newDataResult)
					if val := cases(str, *condition.Value, condition.Operator); !val {
						final_result = val
						break
					} else if val {
						final_result = true
					}
				}
			} else {
				logrus.Println("no changes in the resource")
			}
		}
	} else if etp.Spec.ConditionType == "or" {
		for _, condition := range etp.Spec.Conditions {
			newDataResult, err := jmespath.Search(condition.Key, newData)
			if err != nil {
				logrus.Error(err)
			}

			oldDataResult, err := jmespath.Search(condition.Key, oldData)
			if err != nil {
				logrus.Error(err)
				return false
			}

			if newDataResult != oldDataResult {
				if condition.Operator == "Change" {
					final_result = true
				} else {
					str := fmt.Sprintf("%v", newDataResult)
					if val := cases(str, *condition.Value, condition.Operator); val {
						final_result = val
					}
				}
			} else {
				logrus.Println("no changes in the resource")
			}
		}
	}

	return final_result
}

func PolicyAuditor(resourceType string, newObj interface{}, oldObj interface{}, workflowid string) error {
	restConfig, err := k8s.GetKubeConfig()
	if err != nil {
		return err
	}

	clientSet, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		return err
	}

	deploymentRes := schema.GroupVersionResource{Group: "eventtracker.litmuschaos.io", Version: "v1", Resource: "eventtrackerpolicies"}
	deploymentConfigList, err := clientSet.Resource(deploymentRes).Namespace(InfraNamespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return err
	}

	if len(deploymentConfigList.Items) == 0 {
		logrus.Print("No event-tracker policy(s) found in " + InfraNamespace + " namespace")
		return nil
	}

	for _, ep := range deploymentConfigList.Items {

		eventTrackerPolicy, err := clientSet.Resource(deploymentRes).Namespace(InfraNamespace).Get(context.TODO(), ep.GetName(), metav1.GetOptions{})
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

		var (
			newDataInterface interface{}
			resourceName     string
			oldDataInterface interface{}
		)

		expr := strings.ToLower(resourceType)
		switch expr {
		case Deployment:
			newDeploy := newObj.(*v1.Deployment)
			resourceName = newDeploy.GetName()

			newMar, err := json.Marshal(newDeploy)
			if err != nil {
				return err
			}

			err = json.Unmarshal(newMar, &newDataInterface)
			if err != nil {
				return err
			}

			oldDeploy := oldObj.(*v1.Deployment)
			oldMar, err := json.Marshal(oldDeploy)
			if err != nil {
				return err
			}

			err = json.Unmarshal(oldMar, &oldDataInterface)
			if err != nil {
				return err
			}

		case StateFulSet:
			newSts := newObj.(*v1.StatefulSet)
			resourceName = newSts.GetName()

			newMar, err := json.Marshal(newSts)
			if err != nil {
				return err
			}

			err = json.Unmarshal(newMar, &newDataInterface)
			if err != nil {
				return err
			}

			oldSts := oldObj.(*v1.StatefulSet)
			oldMar, err := json.Marshal(oldSts)
			if err != nil {
				return err
			}

			err = json.Unmarshal(oldMar, &oldDataInterface)
			if err != nil {
				return err
			}

		case DaemonSet:
			newDs := newObj.(*v1.DaemonSet)
			resourceName = newDs.GetName()
			newMar, err := json.Marshal(newDs)
			if err != nil {
				return err
			}

			err = json.Unmarshal(newMar, &newDataInterface)
			if err != nil {
				return err
			}

			oldDs := oldObj.(*v1.DaemonSet)
			oldMar, err := json.Marshal(oldDs)
			if err != nil {
				return err
			}

			err = json.Unmarshal(oldMar, &oldDataInterface)
			if err != nil {
				return err
			}

		default:
			return errors.New("resource not supported")
		}

		check := conditionChecker(etp, newDataInterface, oldDataInterface)

		if check == true {
			etp.Statuses = append(etp.Statuses, litmuschaosv1.EventTrackerPolicyStatus{
				TimeStamp:    time.Now().Format(time.RFC850),
				Resource:     resourceType,
				ResourceName: resourceName,
				Result:       ConditionPassed,
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

			_, err = clientSet.Resource(deploymentRes).Namespace(InfraNamespace).Update(context.TODO(), &unstruc, metav1.UpdateOptions{})
			if err != nil {
				return err
			}

			logrus.Print("EventTrackerPolicy updated")
		} else {
			logrus.Println("Condition failed for resource name:", resourceName, " resource type:", resourceType)
		}
	}

	return nil
}

func getAgentConfigMapData() (string, string, string, error) {
	clientSet, err := k8s.K8sClient()
	if err != nil {
		return "", "", "", err
	}

	getCM, err := clientSet.CoreV1().ConfigMaps(InfraNamespace).Get(context.TODO(), AgentConfigName, metav1.GetOptions{})
	if k8sErrors.IsNotFound(err) {
		return "", "", "", errors.New(AgentConfigName + " configmap not found")
	} else if getCM.Data["IS_CLUSTER_CONFIRMED"] == "true" {
		getSecret, err := clientSet.CoreV1().Secrets(InfraNamespace).Get(context.TODO(), AgentSecretName, metav1.GetOptions{})
		if err != nil {
			return "", "", "", err
		}
		if k8sErrors.IsNotFound(err) {
			return "", "", "", errors.New(AgentSecretName + " secret not found")
		}

		return string(getSecret.Data["ACCESS_KEY"]), string(getSecret.Data["CLUSTER_ID"]), getCM.Data["SERVER_ADDR"], nil
	} else if err != nil {
		return "", "", "", err
	}

	return "", "", "", nil
}

// SendRequest Function to send request to litmus graphql server
func SendRequest(workflowID string) (string, error) {
	accessKey, clusterID, serverAddr, err := getAgentConfigMapData()
	if err != nil {
		return "", err
	}

	payload := `{"query": "mutation { gitopsNotifier(clusterInfo: { infraID: \"` + clusterID + `\", version: \"` + Version + `\", accessKey: \"` + accessKey + `\"}, experimentID: \"` + workflowID + `\")\n}"}`
	req, err := http.NewRequest("POST", serverAddr, bytes.NewBuffer([]byte(payload)))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
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
