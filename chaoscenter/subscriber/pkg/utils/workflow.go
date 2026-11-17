package utils

import (
	"context"

	wfclientset "github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned"
	"github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (utils *subscriberUtils) WorkflowRequest(agentData map[string]string, requestType string, externalData string, uuid string) error {
	if requestType == "workflow_delete" {
		wfOb, err := utils.subscriberEventOperations.ListWorkflowObject(externalData)
		if err != nil {
			return err
		}
		for _, wfs := range wfOb.Items {
			uid := string(wfs.UID)
			err = utils.subscriberEventOperations.StopChaosEngineState(agentData["INFRA_NAMESPACE"], &uid)
			if err != nil {
				logrus.Info("failed to stop chaosEngine for : ", wfs.Name, " namespace: ", wfs.Namespace)
			}
			err = utils.DeleteWorkflow(wfs.Name, agentData)
			if err != nil {
				logrus.Info("failed to delete workflow: ", wfs.Name, " namespace: ", wfs.Namespace)
			}
			logrus.Info("events delete name: ", wfs.Name, " namespace: ", wfs.Namespace)
		}
	} else if requestType == "workflow_run_delete" {
		wfOb, err := utils.subscriberEventOperations.GetWorkflowObj(externalData)
		if err != nil {
			return err
		}
		if wfOb == nil {
			// The workflow is already gone (deleted by hand or by its TTL), so
			// there is nothing left to delete.
			logrus.Info("workflow run ", externalData, " not found, nothing to delete")
			return nil
		}

		err = utils.DeleteWorkflow(wfOb.Name, agentData)
		if err != nil {
			return err
		}

		logrus.Info("events delete name: ", wfOb.Name, "namespace: ", wfOb.Namespace)
	} else if requestType == "workflow_run_stop" {
		wfOb, err := utils.subscriberEventOperations.GetWorkflowObj(externalData)
		if err != nil {
			return err
		}
		// Stop the run's ChaosEngines even when the workflow itself is gone:
		// they are found by the workflow_run_id label, not through the workflow.
		err = utils.subscriberEventOperations.StopChaosEngineState(agentData["INFRA_NAMESPACE"], &externalData)
		if err != nil {
			logrus.Info("failed to stop chaosEngine for workflow run: ", externalData, " : ", err)
		}
		if wfOb == nil {
			logrus.Info("workflow run ", externalData, " not found, nothing left to stop")
			return nil
		}
		err = utils.subscriberEventOperations.StopWorkflow(wfOb.Name, wfOb.Namespace)
		if err != nil {
			logrus.Info("failed to stop experiment: ", wfOb.Name, " namespace: ", wfOb.Namespace, " : ", err)
		}
		logrus.Info("events stop name: ", wfOb.Name, " namespace: ", wfOb.Namespace)

	}

	return nil
}

func (utils *subscriberUtils) DeleteWorkflow(wfname string, agentData map[string]string) error {
	ctx := context.TODO()
	conf, err := utils.subscriberK8s.GetKubeConfig()
	if err != nil {
		return err
	}

	// create the events client
	wfClient := wfclientset.NewForConfigOrDie(conf).ArgoprojV1alpha1().Workflows(agentData["INFRA_NAMESPACE"])
	return wfClient.Delete(ctx, wfname, metav1.DeleteOptions{})
}
