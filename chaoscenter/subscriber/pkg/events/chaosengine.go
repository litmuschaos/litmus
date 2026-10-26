package events

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"subscriber/pkg/types"

	wfclientset "github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned"
	litmusV1alpha1 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/chaos-operator/pkg/client/informers/externalversions"
	"github.com/sirupsen/logrus"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	mergeType "k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/tools/cache"
)

// ChaosEventWatcher initializes the Litmus ChaosEngine event watcher
func (ev *subscriberEvents) ChaosEventWatcher(stopCh chan struct{}, stream chan types.WorkflowEvent, infraData map[string]string) {
	startTime, err := strconv.Atoi(infraData["START_TIME"])
	if err != nil {
		logrus.WithError(err).Fatal("failed to parse startTime")
	}

	cfg, err := ev.subscriberK8s.GetKubeConfig()
	if err != nil {
		logrus.WithError(err).Fatal("could not get kube config")
	}

	// ClientSet to create Informer
	clientSet, err := versioned.NewForConfig(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("could not generate dynamic client for config")
	}

	// Create a factory object to watch workflows depending on default scope
	f := externalversions.NewSharedInformerFactoryWithOptions(clientSet, resyncPeriod,
		externalversions.WithTweakListOptions(func(list *v1.ListOptions) {
			list.LabelSelector = fmt.Sprintf("infra_id=%s,type=standalone_workflow", InfraID)
		}))

	informer := f.Litmuschaos().V1alpha1().ChaosEngines().Informer()
	if InfraScope == "namespace" {
		f = externalversions.NewSharedInformerFactoryWithOptions(clientSet, resyncPeriod, externalversions.WithNamespace(InfraNamespace),
			externalversions.WithTweakListOptions(func(list *v1.ListOptions) {
				list.LabelSelector = fmt.Sprintf("infra_id=%s,type=standalone_workflow", InfraID)
			}))
		informer = f.Litmuschaos().V1alpha1().ChaosEngines().Informer()
	}

	go ev.startWatchEngine(stopCh, informer, stream, int64(startTime))
}

// handles the different*subscriberEvents - add, update and delete
func (ev *subscriberEvents) startWatchEngine(stopCh <-chan struct{}, s cache.SharedIndexInformer, stream chan types.WorkflowEvent, startTime int64) {
	handlers := cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			ev.chaosEventHandler(obj, "ADD", stream, startTime)
		},
		UpdateFunc: func(oldObj, obj interface{}) {
			ev.chaosEventHandler(obj, "UPDATE", stream, startTime)
		},
	}

	s.AddEventHandler(handlers)
	s.Run(stopCh)
}

// responsible for extracting the required data from the event and streaming
func (ev *subscriberEvents) chaosEventHandler(obj interface{}, eventType string, stream chan types.WorkflowEvent, startTime int64) {
	workflowObj := obj.(*chaosTypes.ChaosEngine)
	if workflowObj.Labels["workflow_id"] == "" {
		logrus.WithFields(map[string]interface{}{
			"uid":      string(workflowObj.ObjectMeta.UID),
			"wf_id":    workflowObj.Labels["workflow_id"],
			"infra_id": workflowObj.Labels["infra_id"],
		}).Printf("CHAOSENGINE RUN IGNORED [INVALID METADATA]")
		return
	}

	if workflowObj.ObjectMeta.CreationTimestamp.UnixMilli() < startTime {
		return
	}

	cfg, err := ev.subscriberK8s.GetKubeConfig()
	if err != nil {
		logrus.WithError(err).Fatal("could not get kube config")
	}

	chaosClient, err := litmusV1alpha1.NewForConfig(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("could not get Chaos ClientSet")
	}

	nodes := make(map[string]types.Node)
	logrus.Print("STANDALONE CHAOSENGINE EVENT ", workflowObj.UID, " ", eventType)
	var cd *types.ChaosData = nil

	//extracts chaos data
	cd, err = ev.getChaosData(v1alpha1.NodeStatus{StartedAt: workflowObj.ObjectMeta.CreationTimestamp}, workflowObj.Name, workflowObj.Namespace, chaosClient)
	if err != nil {
		logrus.WithError(err).Print("FAILED PARSING CHAOS ENGINE CRD")
	}

	// considering chaos*subscriberEvents has only 1 artifact with manifest as raw data
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

// StopChaosEngineState is used to patch all the chaosEngines with engineState=stop
func (ev *subscriberEvents) StopChaosEngineState(namespace string, workflowRunID *string) error {
	ctx := context.TODO()

	//Define the GVR
	resourceType := schema.GroupVersionResource{
		Group:    "litmuschaos.io",
		Version:  "v1alpha1",
		Resource: "chaosengines",
	}

	//Generate the dynamic client
	_, dynamicClient, err := ev.subscriberK8s.GetDynamicAndDiscoveryClient()
	if err != nil {
		return errors.New("failed to get dynamic client, error: " + err.Error())
	}

	listOption := v1.ListOptions{}

	if workflowRunID != nil {
		listOption.LabelSelector = fmt.Sprintf("workflow_run_id=%s", *workflowRunID)
	}

	//List all chaosEngines present in the particular namespace
	chaosEngines, err := dynamicClient.Resource(resourceType).Namespace(namespace).List(context.TODO(), listOption)
	if err != nil {
		return errors.New("failed to list chaosengines: " + err.Error())
	}

	//Foe every subscriber patch the engineState to Stop
	for _, val := range chaosEngines.Items {
		patch := []byte(`{"spec":{"engineState":"stop"}}`)
		patched, err := dynamicClient.Resource(resourceType).Namespace(namespace).Patch(ctx, val.GetName(), mergeType.MergePatchType, patch, v1.PatchOptions{})
		if err != nil {
			return errors.New("failed to patch chaosengines: " + err.Error())
		}
		if patched != nil {
			logrus.Info("Successfully patched ChaosEngine: ", patched.GetName())
		}
	}
	return nil
}

// StopWorkflow will patch the workflow based on workflow name using the shutdown strategy
func (ev *subscriberEvents) StopWorkflow(wfName string, namespace string) error {

	conf, err := ev.subscriberK8s.GetKubeConfig()
	wfClient := wfclientset.NewForConfigOrDie(conf).ArgoprojV1alpha1().Workflows(namespace)
	patch := []byte(`{"spec":{"shutdown":"Stop"}}`)
	wf, err := wfClient.Patch(context.TODO(), wfName, mergeType.MergePatchType, patch, v1.PatchOptions{})
	if err != nil {
		return fmt.Errorf("error in patching workflow: %w", err)
	}
	if wf != nil {
		logrus.Info("Successfully patched workflow: ", wf.GetName())
		return nil
	}
	return nil
}

func mapStatus(status chaosTypes.EngineStatus) string {
	switch status {
	case chaosTypes.EngineStatusInitialized:
		return "Running"
	case chaosTypes.EngineStatusCompleted:
		return "Succeeded"
	case chaosTypes.EngineStatusStopped:
		return "Stopped"
	default:
		return "Running"
	}
}
