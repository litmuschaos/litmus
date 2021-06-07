package utils

import (
	"strconv"

	wfclientset "github.com/argoproj/argo/pkg/client/clientset/versioned"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/events"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func WorkflowRequest(clusterData map[string]string, requestType string, uid string) error {
	if requestType == "workflow_delete" {
		wfOb, err := events.GetWorkflowObj(uid)
		if err != nil {
			return err
		}

		err = DeleteWorflow(wfOb.Name, clusterData)
		if err != nil {
			return err
		}

		logrus.Info("events delete name: ", wfOb.Name, "namespace: ", wfOb.Namespace)
	} else if requestType == "workflow_sync" {
		wfOb, err := events.GetWorkflowObj(uid)
		if err != nil {
			return err
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
