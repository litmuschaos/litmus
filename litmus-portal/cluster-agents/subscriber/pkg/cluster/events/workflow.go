package events

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/argoproj/argo/pkg/apis/workflow/v1alpha1"
	"github.com/argoproj/argo/pkg/client/clientset/versioned"
	"github.com/argoproj/argo/pkg/client/informers/externalversions"
	litmusV1alpha1 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/cache"
)

// WorkflowEventWatcher initializes the Argo Workflow event watcher
func WorkflowEventWatcher(stopCh chan struct{}, stream chan types.WorkflowEvent, clusterData map[string]string) {
	startTime, err := strconv.Atoi(clusterData["START_TIME"])
	if err != nil {
		logrus.WithError(err).Fatal("failed to parse startTime")
	}
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

// handles the different workflow events - add, update and delete
func startWatchWorkflow(stopCh <-chan struct{}, s cache.SharedIndexInformer, stream chan types.WorkflowEvent, startTime int64) {
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
	if workflowObj.Labels["workflow_id"] == "" {
		logrus.WithFields(map[string]interface{}{
			"uid":         string(workflowObj.ObjectMeta.UID),
			"wf_id":       workflowObj.Labels["workflow_id"],
			"instance_id": workflowObj.Labels["workflows.argoproj.io/controller-instanceid"],
		}).Printf("WORKFLOW RUN IGNORED [INVALID METADATA]")
		return
	}
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
		if cd != nil && strings.ToLower(cd.ExperimentVerdict) == "fail" {
			experimentFail = 1
			details.Phase = "Failed"
			details.Message = "Chaos Experiment Failed"
		}
		nodes[nodeStatus.ID] = details
	}
	workflow := types.WorkflowEvent{
		WorkflowType:      "workflow",
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
