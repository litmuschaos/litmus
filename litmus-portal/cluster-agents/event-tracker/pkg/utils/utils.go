package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/jmespath/go-jmespath"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/pkg/k8s"
	v1 "k8s.io/api/apps/v1"
	litmuschaosv1 "github.com/litmuschaos/litmus/litmus-portal/cluster-agents/event-tracker/api/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"log"
	"strings"
	"time"
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
	log.Print(etp.Spec.ConditionType)
	if etp.Spec.ConditionType == "and" {
		for _, condition := range etp.Spec.Conditions{
			result, err := jmespath.Search(condition.Key, data)
			if err != nil {
				log.Print(err)
				return false
			}

			str := fmt.Sprintf("%v", result)
			log.Print("key", str)
			log.Print("val", condition.Value)

			if val := cases(str, condition.Value, condition.Operator); !val {
				final_result = val
				break;
			} else if val {
				final_result = true
			}
		}
	} else if etp.Spec.ConditionType == "or" {
		log.Print(etp.Spec.Conditions)
		for _, condition := range etp.Spec.Conditions{

			log.Print(condition)
			result, err := jmespath.Search(condition.Key, data)
			if err != nil {
				log.Print(err)
			}
			str := fmt.Sprintf("%v", result)

			log.Print("key", str)
			log.Print("val", condition.Value)


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
	if err != nil{
		log.Print(err)
	}

	clientSet, err := dynamic.NewForConfig(restConfig)
	if err != nil {
		log.Print(err)
	}

	deploymentRes := schema.GroupVersionResource{Group: "eventtracker.litmuschaos.io", Version: "v1", Resource: "eventtrackerpolicies"}
	deploymentConfigList, err := clientSet.Resource(deploymentRes).Namespace("default").List(metav1.ListOptions{})
	if err != nil {
		log.Print(err)
	}


	for _, ep := range deploymentConfigList.Items {

		eventTrackerPolicy, err := clientSet.Resource(deploymentRes).Namespace("default").Get(ep.GetName(),metav1.GetOptions{})
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


		result := conditionChecker(etp, dataInterface)
		log.Print(result)
		if result == true {
			etp.Statuses = append(etp.Statuses, litmuschaosv1.EventTrackerPolicyStatus{
				TimeStamp: time.Now().Format(time.RFC850),
				Resource: resourceType,
				ResourceName: resourceName,
				Result: "ConditionPass",
				WorkflowID: workflowid,
				IsTriggered: "false",
			})
		} else if result == false {
			etp.Statuses = append(etp.Statuses, litmuschaosv1.EventTrackerPolicyStatus{
				TimeStamp: time.Now().Format(time.RFC850),
				Resource: resourceType,
				ResourceName: resourceName,
				Result: "ConditionFailed",
				WorkflowID: workflowid,
				IsTriggered: "false",
			})
		}

		var unstruc unstructured.Unstructured
		data, err = json.Marshal(etp)
		if err != nil {
			return err
		}

		err = json.Unmarshal(data, &unstruc)
		if err != nil {
			return err
		}

		_, err = clientSet.Resource(deploymentRes).Namespace("default").Update(&unstruc ,metav1.UpdateOptions{})
		if err != nil {
			return err
		}

		//log.Print(eventTrackerPolicyUpdate)
		log.Print("EventTrackerPolicy CR updated")
	}

	return nil

}
