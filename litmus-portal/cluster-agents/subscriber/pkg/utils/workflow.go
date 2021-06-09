package utils

import (
	"encoding/json"
	"strconv"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"

	wfclientset "github.com/argoproj/argo/pkg/client/clientset/versioned"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/events"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func WorkflowRequest(clusterData map[string]string, requestType string, externalData string) error {
	if requestType == "workflow_delete" {
		wfOb, err := events.GetWorkflowObj(externalData)
		if err != nil {
			return err
		}

		err = DeleteWorflow(wfOb.Name, clusterData)
		if err != nil {
			return err
		}

		logrus.Info("events delete name: ", wfOb.Name, "namespace: ", wfOb.Namespace)
	} else if requestType == "workflow_sync" {

		var extData types.WorkflowSyncExternalData
		err := json.Unmarshal([]byte(externalData), &extData)
		if err != nil {
			return err
		}

		wfOb, err := events.GetWorkflowObj(extData.WorkflowRunID)
		if err != nil {
			return err
		}

		// If Workflow is delete/not present in the cluster
		if wfOb == nil {
			logrus.Info("workflow not available for workflowid:" + extData.WorkflowID + ", workflow_run_id:" + extData.WorkflowRunID)
			var evt = types.WorkflowEvent{
				Namespace:    clusterData["AGENT_NAMESPACE"],
				WorkflowType: "events",
				WorkflowID:   extData.WorkflowID,
				EventType:    "DELETE",
				UID:          extData.WorkflowRunID,
				Phase:        "NotAvailable",
			}

			response, err := events.SendWorkflowUpdates(clusterData, evt)
			if err != nil {
				return err
			}

			logrus.Print("response from sync workflow:", response)

			return nil
		}

		startTime, err := strconv.Atoi(clusterData["START_TIME"])
		if err != nil {
			return err
		}

		evts, err := events.WorkflowEventHandler(wfOb, "UPDATE", int64(startTime))
		if err != nil {
			logrus.Info(err)
			return err
		}

		response, err := events.SendWorkflowUpdates(clusterData, evts)
		if err != nil {
			return err
		}

		logrus.Print("response from sync workflow: ", response)
	}

	return nil
}

func DeleteWorflow(wfname string, clusterData map[string]string) error {
	conf, err := k8s.GetKubeConfig()
	if err != nil {
		return err
	}

	// create the events client
	wfClient := wfclientset.NewForConfigOrDie(conf).ArgoprojV1alpha1().Workflows(clusterData["AGENT_NAMESPACE"])
	return wfClient.Delete(wfname, &metav1.DeleteOptions{})
}
