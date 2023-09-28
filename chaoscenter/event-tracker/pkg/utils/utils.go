package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/sirupsen/logrus"

	"github.com/jmespath/go-jmespath"
	litmuschaosv1 "github.com/litmuschaos/litmus/chaoscenter/event-tracker/api/v1"
	"github.com/litmuschaos/litmus/chaoscenter/event-tracker/pkg/k8s"
	v1 "k8s.io/api/apps/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"net/http"
	"strings"
	"time"

	"k8s.io/client-go/dynamic"
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
	finalResult := false
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
					finalResult = true
				} else {
					str := fmt.Sprintf("%v", newDataResult)
					if val := cases(str, *condition.Value, condition.Operator); !val {
						finalResult = val
						break
					} else if val {
						finalResult = true
					}
				}
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
					finalResult = true
				} else {
					str := fmt.Sprintf("%v", newDataResult)
					if val := cases(str, *condition.Value, condition.Operator); val {
						finalResult = val
					}
				}
			}
		}
	}

	return finalResult
}

func PolicyAuditor(resourceType string, newObj interface{}, oldObj interface{}, experimentId string) error {
	restConfig, err := k8s.GetKubeConfig()
	if err != nil {
		return err
	}

	clientSet, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		return err
	}

	deploymentRes := schema.GroupVersionResource{Group: "eventtracker.litmuschaos.io", Version: "v1", Resource: "eventtrackerpolicies"}
	deploymentConfigList, err := clientSet.Resource(deploymentRes).Namespace(Config.InfraNamespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return err
	}

	if len(deploymentConfigList.Items) == 0 {
		logrus.Infof("No event-tracker policy(s) found in %s namespace", Config.InfraNamespace)
		return nil
	}

	for _, ep := range deploymentConfigList.Items {

		eventTrackerPolicy, err := clientSet.Resource(deploymentRes).Namespace(Config.InfraNamespace).Get(context.TODO(), ep.GetName(), metav1.GetOptions{})
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

		logFields := logrus.Fields{
			"resourceType": resourceType,
			"resourceName": resourceName,
			"namespace":    Config.InfraNamespace,
			"experimentId": experimentId,
			"policyName":   etp.GetName(),
		}

		check := conditionChecker(etp, newDataInterface, oldDataInterface)

		if check {
			etp.Statuses = append(etp.Statuses, litmuschaosv1.EventTrackerPolicyStatus{
				TimeStamp:    time.Now().Format(time.RFC850),
				Resource:     resourceType,
				ResourceName: resourceName,
				Result:       ConditionPassed,
				ExperimentID: experimentId,
				IsTriggered:  "false",
			})

			// Updating EventTrackerPolicy
			var us unstructured.Unstructured
			data, err = json.Marshal(etp)
			if err != nil {
				return err
			}

			err = json.Unmarshal(data, &us)
			if err != nil {
				return err
			}

			_, err = clientSet.Resource(deploymentRes).Namespace(Config.InfraNamespace).Update(context.TODO(), &us, metav1.UpdateOptions{})
			if err != nil {
				return err
			}

			logrus.WithFields(logFields).Infof("Policy conditions are matched with the changes in %s", resourceType)
		} else {
			logrus.WithFields(logFields).Infof("Policy conditions are not matched with the changes in %s", resourceType)
		}
	}

	return nil
}

func getInfraData() (string, string, string, error) {
	clientSet, err := k8s.K8sClient()
	if err != nil {
		return "", "", "", fmt.Errorf("failed to get Kubernetes clientset: %v", err)
	}

	getCM, err := clientSet.CoreV1().ConfigMaps(Config.InfraNamespace).Get(context.TODO(), AgentConfigName, metav1.GetOptions{})
	if err != nil {
		return "", "", "", fmt.Errorf("failed to get ConfigMap: %v", err)
	}

	if k8sErrors.IsNotFound(err) {
		return "", "", "", fmt.Errorf("%s configmap not found", AgentConfigName)
	}

	if getCM.Data["IS_INFRA_CONFIRMED"] != "true" {
		return "", "", "", fmt.Errorf("infrastructure not confirmed")
	}

	getSecret, err := clientSet.CoreV1().Secrets(Config.InfraNamespace).Get(context.TODO(), AgentSecretName, metav1.GetOptions{})
	if err != nil {
		return "", "", "", fmt.Errorf("failed to get Secret: %v", err)
	}

	if k8sErrors.IsNotFound(err) {
		return "", "", "", fmt.Errorf("%s secret not found", AgentSecretName)
	}

	return string(getSecret.Data["ACCESS_KEY"]), string(getSecret.Data["INFRA_ID"]), getCM.Data["SERVER_ADDR"], nil
}

// SendRequest Function to send request to litmus graphql server
func SendRequest(experimentId string) (string, error) {
	accessKey, clusterID, serverAddr, err := getInfraData()
	if err != nil {
		return "", fmt.Errorf("failed to get infra data: %v", err)
	}

	payload := `{"query": "mutation { gitopsNotifier(clusterInfo: { infraID: \"` + clusterID + `\", version: \"` + Config.Version + `\", accessKey: \"` + accessKey + `\"}, experimentID: \"` + experimentId + `\")\n}"}`

	req, err := http.NewRequest(http.MethodPost, serverAddr, bytes.NewBuffer([]byte(payload)))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "URL is not reachable or Bad request", nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	return string(body), nil
}
