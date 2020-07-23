package data_store

import (
	"sync"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
)

type StateData struct {
	ClusterEventPublish map[string][]chan *model.ClusterEvent
	ConnectedCluster    map[string]chan *model.ClusterAction
	Mutex               *sync.Mutex
}

var State StateData

func StoreInit() {
	State.ClusterEventPublish = make(map[string][]chan *model.ClusterEvent)
	State.ConnectedCluster = make(map[string]chan *model.ClusterAction)
	State.Mutex = &sync.Mutex{}
}
