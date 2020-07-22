package cluster

import (
	"github.com/google/uuid"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
)

func SendSubscription(eventType, eventName, description string, cluster model.Cluster, r store.StateData) {
	guid := uuid.New()
	newEvent := model.ClusterEvent{
		EventID:     guid.String(),
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
