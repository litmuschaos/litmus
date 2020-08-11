package subscriptions

import (
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	"math/rand"
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

func SendWorkflowRequest(wfRequest database.ChaosWorkFlowInput, r store.StateData){

	newAction := model.ClusterAction{
		ProjectID: wfRequest.ProjectID,
		Action: &model.ActionPayload{
			K8sManifest: wfRequest.WorkflowManifest,
			RequestID: rand.Int(),
			Namespace: "litmus",
			RequestType: "create",
		},
	}

	r.Mutex.Lock()
	if r.ClusterEventPublish != nil {
		for _, observer := range r.ConnectedCluster {
			observer <- &newAction
		}
	}
	r.Mutex.Unlock()
}
