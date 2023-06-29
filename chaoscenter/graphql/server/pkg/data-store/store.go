package data_store

import (
	"sync"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

// Application state, contains channels and mutexes used for subscriptions
type StateData struct {
	InfraEventPublish      map[string][]chan *model.InfraEventResponse
	ConnectedInfra         map[string]chan *model.InfraActionResponse
	ExperimentEventPublish map[string][]chan *model.ExperimentRun
	ExperimentLog          map[string]chan *model.PodLogResponse
	KubeObjectData         map[string]chan *model.KubeObjectResponse
	Mutex                  *sync.Mutex
}

func NewStore() *StateData {
	return &StateData{
		InfraEventPublish:      make(map[string][]chan *model.InfraEventResponse),
		ConnectedInfra:         make(map[string]chan *model.InfraActionResponse),
		ExperimentEventPublish: make(map[string][]chan *model.ExperimentRun),
		ExperimentLog:          make(map[string]chan *model.PodLogResponse),
		KubeObjectData:         make(map[string]chan *model.KubeObjectResponse),
		Mutex:                  &sync.Mutex{},
	}
}

var Store = NewStore()
