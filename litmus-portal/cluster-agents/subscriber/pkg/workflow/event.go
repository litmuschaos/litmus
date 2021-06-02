package workflow

import (
	"errors"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/graphql"
	"os"
	"strings"
	"time"

	"github.com/argoproj/argo/pkg/apis/workflow/v1alpha1"
	"github.com/argoproj/argo/pkg/client/clientset/versioned"
	"github.com/argoproj/argo/pkg/client/informers/externalversions"
	litmusV1alpha1 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
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
func WorkflowEventWatcher(stopCh chan struct{}, stream chan types.WorkflowEvent) {
	cfg, err := k8s.GetKubeConfig()
	if err != nil {
		logrus.WithError(err).Fatal("could not get config")
	}
	// ClientSet to create Informer
	clientSet, err := versioned.NewForConfig(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("could not generate dynamic client for config")
	}
	// Create a factory object to watch workflows depending on default scope
	if AgentScope == "namespace" {
		f := externalversions.NewSharedInformerFactoryWithOptions(clientSet, resyncPeriod, externalversions.WithNamespace(AgentNamespace))
		informer := f.Argoproj().V1alpha1().Workflows().Informer()
		// Start Event Watch
		go startWatch(stopCh, informer, stream)
	} else {
		f := externalversions.NewSharedInformerFactory(clientSet, resyncPeriod)
		informer := f.Argoproj().V1alpha1().Workflows().Informer()
		// Start Event Watch
		go startWatch(stopCh, informer, stream)
	}
}

// handles the different workflow events - add, update and delete
func startWatch(stopCh <-chan struct{}, s cache.SharedIndexInformer, stream chan types.WorkflowEvent) {
	startTime := time.Now().Unix()
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
	if val, ok := workflowObj.Labels["workflows.argoproj.io/controller-instanceid"]; !ok || val != ClusterID {
		logrus.WithField("uid", string(workflowObj.ObjectMeta.UID)).Printf("WORKFLOW RUN IGNORED [NO MATCHING INSTANCE-ID]")
		return types.WorkflowEvent{}, nil
	}

	experimentFail := 0
	//if workflowObj.ObjectMeta.CreationTimestamp.Unix() < startTime {
	//
	//	return types.WorkflowEvent{}, nil
	//}

	cfg, err := k8s.GetKubeConfig()
	if err != nil {
		logrus.WithError(err).Fatal("could not get config")
	}

	chaosClient, err := litmusV1alpha1.NewForConfig(cfg)
	if err != nil {
		return types.WorkflowEvent{}, errors.New("could not get Chaos ClientSet: " + err.Error())
	}

	nodes := make(map[string]types.Node)
	logrus.Print("WORKFLOW EVENT ", workflowObj.UID, " ", eventType)

	for _, nodeStatus := range workflowObj.Status.Nodes {

		var (
			nodeType                  = string(nodeStatus.Type)
			cd       *types.ChaosData = nil
		)

		// considering chaos workflow has only 1 artifact with manifest as raw data
		if nodeStatus.Type == "Pod" && nodeStatus.Inputs != nil && len(nodeStatus.Inputs.Artifacts) == 1 {
			//extracts chaos data
			nodeType, cd, err = CheckChaosData(nodeStatus, workflowObj.ObjectMeta.Namespace, chaosClient)
			if err != nil {
				logrus.WithError(err).Print("FAILED PARSING CHAOS ENGINE CRD")
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

		if cd != nil && (strings.ToLower(cd.ExperimentVerdict) == "fail" || strings.ToLower(cd.ExperimentVerdict) == "stopped") {
			experimentFail = 1
			details.Phase = "Failed"
			details.Message = "Chaos Experiment Failed"
			cd.ExperimentVerdict = "Fail"
		}
		nodes[nodeStatus.ID] = details
	}

	workflow := types.WorkflowEvent{
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
	}

	if experimentFail == 1 {
		workflow.Phase = "Failed"
		workflow.Message = "Chaos Experiment Failed"
	}

	return workflow, nil
}

//SendWorkflowUpdates generates graphql mutation to send workflow updates to graphql server
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
	payload, err := GenerateWorkflowPayload(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], "false", event)

	if event.FinishedAt != "" {
		payload, err = GenerateWorkflowPayload(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], "true", event)
		delete(eventMap, event.UID)
	}

	if err != nil {
		return "", errors.New(err.Error() + ": ERROR PARSING WORKFLOW EVENT")
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

		logrus.Print("RESPONSE ", response)
	}
}
