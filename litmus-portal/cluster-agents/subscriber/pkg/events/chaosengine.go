package events

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned"
	litmusV1alpha1 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/chaos-operator/pkg/client/informers/externalversions"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/cache"
)

// ChaosEventWatcher initializes the Litmus ChaosEngine event watcher
func ChaosEventWatcher(stopCh chan struct{}, stream chan types.WorkflowEvent, clusterData map[string]string) {
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
			list.LabelSelector = fmt.Sprintf("cluster_id=%s,type=standalone_workflow", ClusterID)
		}))

	informer := f.Litmuschaos().V1alpha1().ChaosEngines().Informer()
	if AgentScope == "namespace" {
		f = externalversions.NewSharedInformerFactoryWithOptions(clientSet, resyncPeriod, externalversions.WithNamespace(AgentNamespace),
			externalversions.WithTweakListOptions(func(list *v1.ListOptions) {
				list.LabelSelector = fmt.Sprintf("cluster_id=%s,type=standalone_workflow", ClusterID)
			}))
		informer = f.Litmuschaos().V1alpha1().ChaosEngines().Informer()
	}

	go startWatchEngine(stopCh, informer, stream, int64(startTime))
}

// handles the different events events - add, update and delete
func startWatchEngine(stopCh <-chan struct{}, s cache.SharedIndexInformer, stream chan types.WorkflowEvent, startTime int64) {
	handlers := cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			chaosEventHandler(obj, "ADD", stream, startTime)
		},
		UpdateFunc: func(oldObj, obj interface{}) {
			chaosEventHandler(obj, "UPDATE", stream, startTime)
		},
	}

	s.AddEventHandler(handlers)
	s.Run(stopCh)
}

// responsible for extracting the required data from the event and streaming
func chaosEventHandler(obj interface{}, eventType string, stream chan types.WorkflowEvent, startTime int64) {
	workflowObj := obj.(*chaosTypes.ChaosEngine)
	if workflowObj.Labels["workflow_id"] == "" {
		logrus.WithFields(map[string]interface{}{
			"uid":        string(workflowObj.ObjectMeta.UID),
			"wf_id":      workflowObj.Labels["workflow_id"],
			"cluster_id": workflowObj.Labels["cluster_id"],
		}).Printf("CHAOSENGINE RUN IGNORED [INVALID METADATA]")
		return
	}

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
	logrus.Print("STANDALONE CHAOSENGINE EVENT ", workflowObj.UID, " ", eventType)
	var cd *types.ChaosData = nil

	//extracts chaos data
	cd, err = getChaosData(v1alpha1.NodeStatus{StartedAt: workflowObj.ObjectMeta.CreationTimestamp}, workflowObj.Name, workflowObj.Namespace, chaosClient)
	if err != nil {
		logrus.WithError(err).Print("FAILED PARSING CHAOS ENGINE CRD")
	}

	// considering chaos events has only 1 artifact with manifest as raw data
	finTime := int64(-1)
	if workflowObj.Status.EngineStatus == chaosTypes.EngineStatusCompleted || workflowObj.Status.EngineStatus == chaosTypes.EngineStatusStopped {
		if len(workflowObj.Status.Experiments) > 0 {
			finTime = workflowObj.Status.Experiments[0].LastUpdateTime.Unix()
		}
	}

	nodes[workflowObj.Name] = types.Node{
		Name:       workflowObj.Name,
		Phase:      "Succeeded",
		StartedAt:  StrConvTime(workflowObj.CreationTimestamp.Unix()),
		FinishedAt: StrConvTime(finTime),
		Children:   []string{workflowObj.Name + "-engine"},
		Type:       "Steps",
	}
	details := types.Node{
		Name:       workflowObj.Name,
		Phase:      mapStatus(workflowObj.Status.EngineStatus),
		Type:       "ChaosEngine",
		StartedAt:  StrConvTime(workflowObj.CreationTimestamp.Unix()),
		FinishedAt: StrConvTime(finTime),
		Children:   []string{},
		ChaosExp:   cd,
		Message:    string(workflowObj.Status.EngineStatus),
	}

	if cd != nil && strings.ToLower(cd.ExperimentVerdict) == "fail" {
		details.Phase = "Failed"
		details.Message = "Chaos Experiment Failed"
	}

	nodes[workflowObj.Name+"-engine"] = details
	workflow := types.WorkflowEvent{
		WorkflowType:      "chaosengine",
		WorkflowID:        workflowObj.Labels["workflow_id"],
		EventType:         eventType,
		UID:               string(workflowObj.ObjectMeta.UID),
		Namespace:         workflowObj.ObjectMeta.Namespace,
		Name:              workflowObj.ObjectMeta.Name,
		CreationTimestamp: StrConvTime(workflowObj.ObjectMeta.CreationTimestamp.Unix()),
		Phase:             details.Phase,
		Message:           details.Message,
		StartedAt:         details.StartedAt,
		FinishedAt:        details.FinishedAt,
		Nodes:             nodes,
	}

	//stream
	stream <- workflow
}

func mapStatus(status chaosTypes.EngineStatus) string {
	switch status {
	case chaosTypes.EngineStatusInitialized:
		return "Running"
	case chaosTypes.EngineStatusCompleted:
		return "Succeeded"
	case chaosTypes.EngineStatusStopped:
		return "Skipped"
	default:
		return "Running"
	}
}
