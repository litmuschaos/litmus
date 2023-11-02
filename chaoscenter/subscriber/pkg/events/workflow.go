package events

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"subscriber/pkg/types"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	"github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned"
	"github.com/argoproj/argo-workflows/v3/pkg/client/informers/externalversions"
	litmusV1alpha1 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
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
	InfraScope     = os.Getenv("INFRA_SCOPE")
	InfraNamespace = os.Getenv("INFRA_NAMESPACE")
	InfraID        = os.Getenv("INFRA_ID")
)

// WorkflowEventWatcher initializes the Argo Workflow event watcher
func (ev *subscriberEvents) WorkflowEventWatcher(stopCh chan struct{}, stream chan types.WorkflowEvent, infraData map[string]string) {
	startTime, err := strconv.Atoi(infraData["START_TIME"])
	if err != nil {
		logrus.WithError(err).Fatal("Failed to parse START_TIME")
	}
	cfg, err := ev.subscriberK8s.GetKubeConfig()
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
			list.LabelSelector = fmt.Sprintf("infra_id=%s,workflows.argoproj.io/controller-instanceid=%s", InfraID, InfraID)
		}))
	informer := f.Argoproj().V1alpha1().Workflows().Informer()
	if InfraScope == "namespace" {
		f = externalversions.NewSharedInformerFactoryWithOptions(clientSet, resyncPeriod, externalversions.WithNamespace(InfraNamespace),
			externalversions.WithTweakListOptions(func(list *v1.ListOptions) {
				list.LabelSelector = fmt.Sprintf("infra_id=%s,workflows.argoproj.io/controller-instanceid=%s", InfraID, InfraID)
			}))
		informer = f.Argoproj().V1alpha1().Workflows().Informer()
		// Start Event Watch
	}
	go ev.startWatchWorkflow(stopCh, informer, stream, int64(startTime))
}

// handles the different events events - add, update and delete
func (ev *subscriberEvents) startWatchWorkflow(stopCh <-chan struct{}, s cache.SharedIndexInformer, stream chan types.WorkflowEvent, startTime int64) {
	handlers := cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			workflowObj := obj.(*v1alpha1.Workflow)
			workflow, err := ev.WorkflowEventHandler(workflowObj, "ADD", startTime)
			if err != nil {
				logrus.Error(err)
			}

			//stream
			stream <- workflow

		},
		UpdateFunc: func(oldObj, obj interface{}) {
			workflowObj := obj.(*v1alpha1.Workflow)
			workflow, err := ev.WorkflowEventHandler(workflowObj, "UPDATE", startTime)
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

// WorkflowEventHandler is responsible for extracting the required data from the event and streaming
func (ev *subscriberEvents) WorkflowEventHandler(workflowObj *v1alpha1.Workflow, eventType string, startTime int64) (types.WorkflowEvent, error) {
	if workflowObj.Labels["workflow_id"] == "" {
		logrus.WithFields(map[string]interface{}{
			"uid":         string(workflowObj.ObjectMeta.UID),
			"wf_id":       workflowObj.Labels["workflow_id"],
			"instance_id": workflowObj.Labels["workflows.argoproj.io/controller-instanceid"],
		}).Printf("WORKFLOW RUN IGNORED [INVALID METADATA]")
		return types.WorkflowEvent{}, nil
	}

	if workflowObj.ObjectMeta.CreationTimestamp.UnixMilli() < startTime {
		return types.WorkflowEvent{}, errors.New("startTime of subscriber is greater than experiment creation timestamp")
	}

	cfg, err := ev.subscriberK8s.GetKubeConfig()
	if err != nil {
		logrus.WithError(err).Fatal("Could not get kube config")
	}

	chaosClient, err := litmusV1alpha1.NewForConfig(cfg)
	if err != nil {
		return types.WorkflowEvent{}, errors.New("could not get Chaos ClientSet: " + err.Error())
	}

	nodes := make(map[string]types.Node)
	logrus.Info("Workflow RUN_ID: ", workflowObj.UID, " and event type: ", eventType)

	for _, nodeStatus := range workflowObj.Status.Nodes {

		var (
			nodeType                  = string(nodeStatus.Type)
			cd       *types.ChaosData = nil
		)

		// considering chaos events has only 1 artifact with manifest as raw data
		if nodeStatus.Type == "Pod" && nodeStatus.Inputs != nil && len(nodeStatus.Inputs.Artifacts) == 1 && nodeStatus.Inputs.Artifacts[0].Raw != nil {
			//extracts chaos data
			nodeType, cd, err = ev.CheckChaosData(nodeStatus, workflowObj.ObjectMeta.Namespace, chaosClient)
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
		if nodeType == "ChaosEngine" && cd != nil {
			details.Phase = cd.ExperimentStatus
		}
		nodes[nodeStatus.ID] = details
	}

	status := updateWorkflowStatus(workflowObj.Status.Phase)

	finishedTime := StrConvTime(workflowObj.Status.FinishedAt.Unix())
	if workflowObj.Spec.Shutdown.Enabled() {
		status = "Stopped"
		finishedTime = StrConvTime(time.Now().Unix())
		nodes[workflowObj.Name] = types.Node{
			Name:       workflowObj.Name,
			Phase:      "Stopped",
			StartedAt:  StrConvTime(workflowObj.CreationTimestamp.Unix()),
			FinishedAt: finishedTime,
			Children:   nodes[workflowObj.Name].Children,
			Type:       nodes[workflowObj.Name].Type,
		}
	}
	var notifyID *string = nil

	if id, ok := workflowObj.Labels["notify_id"]; ok {
		notifyID = &id
	}

	workflow := types.WorkflowEvent{
		WorkflowType:      "events",
		WorkflowID:        workflowObj.Labels["workflow_id"],
		EventType:         eventType,
		RevisionID:        workflowObj.Labels["revision_id"],
		NotifyID:          notifyID,
		UID:               string(workflowObj.ObjectMeta.UID),
		Namespace:         workflowObj.ObjectMeta.Namespace,
		Name:              workflowObj.ObjectMeta.Name,
		CreationTimestamp: StrConvTime(workflowObj.ObjectMeta.CreationTimestamp.Unix()),
		Phase:             status,
		Message:           workflowObj.Status.Message,
		StartedAt:         StrConvTime(workflowObj.Status.StartedAt.Unix()),
		FinishedAt:        finishedTime,
		Nodes:             nodes,
		UpdatedBy:         workflowObj.Labels["updated_by"],
	}

	return workflow, nil
}

// SendWorkflowUpdates generates graphql mutation to send events updates to graphql server
func (ev *subscriberEvents) SendWorkflowUpdates(infraData map[string]string, event types.WorkflowEvent) (string, error) {
	if wfEvent, ok := eventMap[event.UID]; ok {
		for key, node := range wfEvent.Nodes {
			if node.Type == "ChaosEngine" && node.ChaosExp != nil && event.Nodes[key].ChaosExp == nil {
				nodeData := event.Nodes[key]
				nodeData.ChaosExp = node.ChaosExp
				nodeData.Phase = node.Phase
				nodeData.Message = node.Message
				event.Nodes[key] = nodeData
			}
			if event.Phase == "Stopped" {
				if event.Nodes[key].Phase == "Running" || event.Nodes[key].Phase == "Pending" {
					nodeData := event.Nodes[key]
					nodeData.Phase = "Stopped"
					event.Nodes[key] = nodeData
					nodeData.FinishedAt = event.FinishedAt
				}
			}
		}
	}
	// Setting up the experiment status
	// based on different probes results
	// present in the experiment
	event.Phase = getExperimentStatus(event)

	eventMap[event.UID] = event

	// generate graphql payload
	payload, err := ev.GenerateWorkflowPayload(infraData["INFRA_ID"], infraData["ACCESS_KEY"], infraData["VERSION"], "false", event)
	if err != nil {
		return "", errors.New("Error while generating graphql payload from the workflow event" + err.Error())
	}

	if event.FinishedAt != "" {
		payload, err = ev.GenerateWorkflowPayload(infraData["INFRA_ID"], infraData["ACCESS_KEY"], infraData["VERSION"], "true", event)
		delete(eventMap, event.UID)
	}

	body, err := ev.gqlSubscriberServer.SendRequest(infraData["SERVER_ADDR"], payload)
	if err != nil {
		return "", err
	}

	return body, nil
}

func (ev *subscriberEvents) WorkflowUpdates(infraData map[string]string, event chan types.WorkflowEvent) {
	// listen on the channel for streaming event updates
	for eventData := range event {
		response, err := ev.SendWorkflowUpdates(infraData, eventData)
		if err != nil {
			logrus.Print(err.Error())
		}

		logrus.Print("Response from the server: ", response)
	}
}

func updateWorkflowStatus(status v1alpha1.WorkflowPhase) string {
	switch status {
	case v1alpha1.WorkflowRunning:
		return "Running"
	case v1alpha1.WorkflowSucceeded:
		return "Completed"
	case v1alpha1.WorkflowFailed:
		return "Completed"
	case v1alpha1.WorkflowPending:
		return "Pending"
	case v1alpha1.WorkflowError:
		return "Error"
	default:
		return "Pending"
	}
}

// getExperimentStatus is used to fetch the final experiment status
// based on the fault/probe status
func getExperimentStatus(experiment types.WorkflowEvent) string {
	var (
		errorCount                     = 0
		completedWithProbeFailureCount = 0
		status                         = experiment.Phase
	)

	// Once the workflow is completed, and it is not stopped,
	// we will fetch the data based on the different
	// node statuses(which are coming from the probe status
	// of these faults)
	if status == "Stopped" || experiment.FinishedAt == "" {
		return status
	}

	for _, node := range experiment.Nodes {
		if node.Type == "ChaosEngine" && node.ChaosExp == nil {
			errorCount++
			continue
		}
		switch node.Phase {
		case string(types.FaultCompletedWithProbeFailure):
			completedWithProbeFailureCount++
		case string(types.Error):
			errorCount++
		}

	}

	// For multiple faults, if one of the fault
	// errors out, priority is given to the error
	// status and then the remaining status
	if errorCount > 0 {
		status = string(types.Error)
	} else if completedWithProbeFailureCount > 0 {
		status = string(types.FaultCompletedWithProbeFailure)
	}

	return status
}
