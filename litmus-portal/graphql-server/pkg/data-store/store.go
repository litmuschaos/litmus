package data_store

import (
	"sync"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

// Application state, contains channels and mutexes used for subscriptions
type StateData struct {
	ClusterEventPublish  map[string][]chan *model.ClusterEventResponse
	ConnectedCluster     map[string]chan *model.ClusterActionResponse
	WorkflowEventPublish map[string][]chan *model.WorkflowRun
	WorkflowLog          map[string]chan *model.PodLogResponse
	KubeObjectData       map[string]chan *model.KubeObjectResponse
	DashboardData        map[string]chan *model.DashboardPromResponse
	Mutex                *sync.Mutex
}

func NewStore() *StateData {
	return &StateData{
		ClusterEventPublish:  make(map[string][]chan *model.ClusterEventResponse),
		ConnectedCluster:     make(map[string]chan *model.ClusterActionResponse),
		WorkflowEventPublish: make(map[string][]chan *model.WorkflowRun),
		WorkflowLog:          make(map[string]chan *model.PodLogResponse),
		KubeObjectData:       make(map[string]chan *model.KubeObjectResponse),
		DashboardData:        make(map[string]chan *model.DashboardPromResponse),
		Mutex:                &sync.Mutex{},
	}
}

var Store = NewStore()
