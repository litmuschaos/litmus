package subscriptions

import (
	"os"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

//SendClusterEvent sends events from the clusters to the appropriate users listening for the events
func SendClusterEvent(eventType, eventName, description string, cluster model.Cluster, r store.StateData) {
	newEvent := model.ClusterEvent{
		EventID:     uuid.New().String(),
		EventType:   eventType,
		EventName:   eventName,
		Description: description,
		Cluster:     &cluster,
	}
	r.Mutex.Lock()
	if r.ClusterEventPublish != nil {
		for _, observer := range r.ClusterEventPublish[cluster.ProjectID] {
			observer <- &newEvent
		}
	}
	r.Mutex.Unlock()
}

//SendWorkflowEvent sends workflow events from the clusters to the appropriate users listening for the events
func SendWorkflowEvent(wfRun model.WorkflowRun, r store.StateData) {
	r.Mutex.Lock()
	if r.WorkflowEventPublish != nil {
		for _, observer := range r.WorkflowEventPublish[wfRun.ProjectID] {
			observer <- &wfRun
		}
	}
	r.Mutex.Unlock()
}

func SendWorkflowRequest(wfRequest *database.ChaosWorkFlowInput, r store.StateData) {

	namespace := os.Getenv("AGENT_NAMESPACE")
	if os.Getenv("AGENT_SCOPE") == "cluster" {
		/*
			namespace = Obtain from WorkflowManifest or
			from frontend as a separate workflowNamespace field under ChaosWorkFlowInput model
			for CreateChaosWorkflow mutation to be passed to this function.
		*/
	}
	requesttype := "create"
	newAction := &model.ClusterAction{
		ProjectID: wfRequest.ProjectID,
		Action: &model.ActionPayload{
			K8sManifest: &wfRequest.WorkflowManifest,
			Namespace:   &namespace,
			RequestType: &requesttype,
		},
	}

	r.Mutex.Lock()

	if observer, ok := r.ConnectedCluster[wfRequest.ClusterID]; ok {
		observer <- newAction
	}

	r.Mutex.Unlock()
}
