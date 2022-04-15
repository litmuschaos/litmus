package events

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/graphql"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	"github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned"
	"github.com/argoproj/argo-workflows/v3/pkg/client/informers/externalversions"
	litmusV1alpha1 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/cache"
)

// 0 means no resync
const (
	resyncPeriod time.Duration = 0
)

var eventMap map[string]types.WorkflowEvent

func init() {
	eventMap = make(map[string]types.WorkflowEvent)
}

var (
	AgentScope     = os.Getenv("AGENT_SCOPE")
	AgentNamespace = os.Getenv("AGENT_NAMESPACE")
	ClusterID      = os.Getenv("CLUSTER_ID")
)

// initializes the Argo Workflow event watcher
func WorkflowEventWatcher(stopCh chan struct{}, stream chan types.WorkflowEvent, clusterData map[string]string) {
	startTime, err := strconv.Atoi(clusterData["START_TIME"])
	if err != nil {
		logrus.WithError(err).Fatal("Failed to parse START_TIME")
	}
	cfg, err := k8s.GetKubeConfig()
	if err != nil {
		logrus.WithError(err).Fatal("Could not get kube config")
	}
	// ClientSet to create Informer
	clientSet, err := versioned.NewForConfig(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("Could not generate dynamic client for config")
	}
	// Create a factory object to watch workflows depending on default scope
	f := externalversions.NewSharedInformerFactoryWithOptions(clientSet, resyncPeriod,
		externalversions.WithTweakListOptions(func(list *v1.ListOptions) {
			list.LabelSelector = fmt.Sprintf("cluster_id=%s,workflows.argoproj.io/controller-instanceid=%s", ClusterID, ClusterID)
		}))
	informer := f.Argoproj().V1alpha1().Workflows().Informer()
	if AgentScope == "namespace" {
		f = externalversions.NewSharedInformerFactoryWithOptions(clientSet, resyncPeriod, externalversions.WithNamespace(AgentNamespace),
			externalversions.WithTweakListOptions(func(list *v1.ListOptions) {
				list.LabelSelector = fmt.Sprintf("cluster_id=%s,workflows.argoproj.io/controller-instanceid=%s", ClusterID, ClusterID)
			}))
		informer = f.Argoproj().V1alpha1().Workflows().Informer()
		// Start Event Watch
	}
	go startWatchWorkflow(stopCh, informer, stream, int64(startTime))
}

// handles the different events events - add, update and delete
func startWatchWorkflow(stopCh <-chan struct{}, s cache.SharedIndexInformer, stream chan types.WorkflowEvent, startTime int64) {
	handlers := cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			workflowObj := obj.(*v1alpha1.Workflow)
			workflow, err := WorkflowEventHandler(workflowObj, "ADD", startTime)
			if err != nil {
				logrus.Error(err)
			}

			//stream
			stream <- workflow

		},
		UpdateFunc: func(oldObj, obj interface{}) {
			workflowObj := obj.(*v1alpha1.Workflow)
			workflow, err := WorkflowEventHandler(workflowObj, "UPDATE", startTime)
			if err != nil {
				logrus.Error(err)
			}
			//stream
			stream <- workflow

		},
	}
	s.AddEventHandler(handlers)
	s.Run(stopCh)
}

// responsible for extracting the required data from the event and streaming
func WorkflowEventHandler(workflowObj *v1alpha1.Workflow, eventType string, startTime int64) (types.WorkflowEvent, error) {
	if workflowObj.Labels["workflow_id"] == "" {
		logrus.WithFields(map[string]interface{}{
			"uid":         string(workflowObj.ObjectMeta.UID),
			"wf_id":       workflowObj.Labels["workflow_id"],
			"instance_id": workflowObj.Labels["workflows.argoproj.io/controller-instanceid"],
		}).Printf("WORKFLOW RUN IGNORED [INVALID METADATA]")
		return types.WorkflowEvent{}, nil
	}

	experimentFail := 0
	if workflowObj.ObjectMeta.CreationTimestamp.Unix() < startTime {
		return types.WorkflowEvent{}, nil
	}

	cfg, err := k8s.GetKubeConfig()
	if err != nil {
		logrus.WithError(err).Fatal("Could not get kube config")
	}

	chaosClient, err := litmusV1alpha1.NewForConfig(cfg)
	if err != nil {
		return types.WorkflowEvent{}, errors.New("could not get Chaos ClientSet: " + err.Error())
	}

	nodes := make(map[string]types.Node)
	logrus.Print("Workflow RUN_ID: ", workflowObj.UID, " and event type: ", eventType)

	for _, nodeStatus := range workflowObj.Status.Nodes {

		var (
			nodeType                  = string(nodeStatus.Type)
			cd       *types.ChaosData = nil
		)

		// considering chaos events has only 1 artifact with manifest as raw data
		if nodeStatus.Type == "Pod" && nodeStatus.Inputs != nil && len(nodeStatus.Inputs.Artifacts) == 1 && nodeStatus.Inputs.Artifacts[0].Raw != nil {
			//extracts chaos data
			nodeType, cd, err = CheckChaosData(nodeStatus, workflowObj.ObjectMeta.Namespace, chaosClient)
			if err != nil {
				logrus.WithError(err).Print("Failed to parse ChaosEngine CRD")
			}
		}

		details := types.Node{
			Name:       nodeStatus.DisplayName,
			Phase:      string(nodeStatus.Phase),
			Type:       nodeType,
			StartedAt:  StrConvTime(nodeStatus.StartedAt.Unix()),
			FinishedAt: StrConvTime(nodeStatus.FinishedAt.Unix()),
			Children:   nodeStatus.Children,
			ChaosExp:   cd,
			Message:    nodeStatus.Message,
		}
		if cd != nil && strings.ToLower(cd.ExperimentVerdict) == "fail" {
			experimentFail = 1
			details.Phase = "Failed"
			details.Message = "Chaos Experiment Failed"
			cd.ExperimentVerdict = "Fail"
		}
		nodes[nodeStatus.ID] = details
	}

	workflow := types.WorkflowEvent{
		WorkflowType:      "events",
		WorkflowID:        workflowObj.Labels["workflow_id"],
		EventType:         eventType,
		UID:               string(workflowObj.ObjectMeta.UID),
		Namespace:         workflowObj.ObjectMeta.Namespace,
		Name:              workflowObj.ObjectMeta.Name,
		CreationTimestamp: StrConvTime(workflowObj.ObjectMeta.CreationTimestamp.Unix()),
		Phase:             string(workflowObj.Status.Phase),
		Message:           workflowObj.Status.Message,
		StartedAt:         StrConvTime(workflowObj.Status.StartedAt.Unix()),
		FinishedAt:        StrConvTime(workflowObj.Status.FinishedAt.Unix()),
		Nodes:             nodes,
		ExecutedBy:        workflowObj.Labels["executed_by"],
	}

	if experimentFail == 1 {
		workflow.Phase = "Failed"
		workflow.Message = "Chaos Experiment Failed"
	}

	return workflow, nil
}

//SendWorkflowUpdates generates graphql mutation to send events updates to graphql server
func SendWorkflowUpdates(clusterData map[string]string, event types.WorkflowEvent) (string, error) {
	if wfEvent, ok := eventMap[event.UID]; ok {
		for key, node := range wfEvent.Nodes {
			if node.Type == "ChaosEngine" && node.ChaosExp != nil && event.Nodes[key].ChaosExp == nil {
				nodeData := event.Nodes[key]
				nodeData.ChaosExp = node.ChaosExp
				nodeData.Phase = node.Phase
				nodeData.Message = node.Message
				if node.Phase == "Failed" {
					event.Phase = "Failed"
					event.Message = "Chaos Experiment Failed"
				}
				event.Nodes[key] = nodeData
			}
		}
	}
	eventMap[event.UID] = event

	// generate graphql payload
	payload, err := GenerateWorkflowPayload(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], clusterData["VERSION"], "false", event)
	if err != nil {
		return "", errors.New("Error while generating graphql payload from the workflow event" + err.Error())
	}

	if event.FinishedAt != "" {
		payload, err = GenerateWorkflowPayload(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], clusterData["VERSION"], "true", event)
		delete(eventMap, event.UID)
	}

	body, err := graphql.SendRequest(clusterData["SERVER_ADDR"], payload)
	if err != nil {
		return "", err
	}

	return body, nil
}

func WorkflowUpdates(clusterData map[string]string, event chan types.WorkflowEvent) {
	// listen on the channel for streaming event updates
	for eventData := range event {
		response, err := SendWorkflowUpdates(clusterData, eventData)
		if err != nil {
			logrus.Print(err.Error())
		}

		logrus.Print("Response from the server: ", response)
	}
}
