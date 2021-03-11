package events

import (
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

var (
	AgentScope     = os.Getenv("AGENT_SCOPE")
	AgentNamespace = os.Getenv("AGENT_NAMESPACE")
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
			workflowEventHandler(obj, "ADD", stream, startTime)
		},
		UpdateFunc: func(oldObj, obj interface{}) {
			workflowEventHandler(obj, "UPDATE", stream, startTime)
		},
	}
	s.AddEventHandler(handlers)
	s.Run(stopCh)
}

// responsible for extracting the required data from the event and streaming
func workflowEventHandler(obj interface{}, eventType string, stream chan types.WorkflowEvent, startTime int64) {
	workflowObj := obj.(*v1alpha1.Workflow)
	experimentFail := 0
	if workflowObj.ObjectMeta.CreationTimestamp.Unix() < startTime {
		return
	}
	cfg, err := k8s.GetKubeConfig()
	if err != nil {
		logrus.WithError(err).Fatal("could not get config")
	}
	chaosClient, err := litmusV1alpha1.NewForConfig(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("could not get Chaos ClientSet")
	}
	nodes := make(map[string]types.Node)
	logrus.Print("WORKFLOW EVENT ", workflowObj.UID, " ", eventType)
	for _, nodeStatus := range workflowObj.Status.Nodes {
		nodeType := string(nodeStatus.Type)
		var cd *types.ChaosData = nil
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
	//stream
	stream <- workflow
}
