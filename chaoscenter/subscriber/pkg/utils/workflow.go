package utils

import (
	"context"
	"subscriber/pkg/events"

	wfclientset "github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned"
	"github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

var subscriberEventOperations events.SubscriberEvents = events.NewChaosEngine()

func WorkflowRequest(agentData map[string]string, requestType string, externalData string, uuid string) error {
	if requestType == "workflow_delete" {
		wfOb, err := subscriberEventOperations.ListWorkflowObject(externalData)
		if err != nil {
			return err
		}
		for _, wfs := range wfOb.Items {
			uid := string(wfs.UID)
			err = subscriberEventOperations.StopChaosEngineState(agentData["AGENT_NAMESPACE"], &uid)
			if err != nil {
				logrus.Info("failed to stop chaosEngine for : ", wfs.Name, " namespace: ", wfs.Namespace)
			}
			err = DeleteWorkflow(wfs.Name, agentData)
			if err != nil {
				logrus.Info("failed to delete workflow: ", wfs.Name, " namespace: ", wfs.Namespace)
			}
			logrus.Info("events delete name: ", wfs.Name, " namespace: ", wfs.Namespace)
		}
	} else if requestType == "workflow_run_delete" {
		wfOb, err := subscriberEventOperations.GetWorkflowObj(externalData)
		if err != nil {
			return err
		}

		err = DeleteWorkflow(wfOb.Name, agentData)
		if err != nil {
			return err
		}

		logrus.Info("events delete name: ", wfOb.Name, "namespace: ", wfOb.Namespace)
	}

	return nil
}

func DeleteWorkflow(wfname string, agentData map[string]string) error {
	ctx := context.TODO()
	conf, err := subscriberK8s.GetKubeConfig()
	if err != nil {
		return err
	}

	// create the events client
	wfClient := wfclientset.NewForConfigOrDie(conf).ArgoprojV1alpha1().Workflows(agentData["INFRA_NAMESPACE"])
	return wfClient.Delete(ctx, wfname, metav1.DeleteOptions{})
}
