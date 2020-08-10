package data_store

import (
	"sync"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
)

//Application state, contains channels and mutexes used for subscriptions
type StateData struct {
	ClusterEventPublish map[string][]chan *model.ClusterEvent
	WorkflowPublish map[string][]chan *model.ChaosWorkFlowInput
	ConnectedCluster    map[string]chan *model.ClusterAction
	Mutex               *sync.Mutex
}

func New() *StateData {
	return &StateData{
		WorkflowPublish: 	 make(map[string][]chan *model.ChaosWorkFlowInput),
		ClusterEventPublish: make(map[string][]chan *model.ClusterEvent),
		ConnectedCluster:    make(map[string]chan *model.ClusterAction),
		Mutex:               &sync.Mutex{},
	}
}
