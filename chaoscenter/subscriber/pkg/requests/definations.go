package requests

import (
	"subscriber/pkg/k8s"
	"subscriber/pkg/types"
	"subscriber/pkg/utils"
)

var subscriberK8s = k8s.NewKubernetes()
var subscriberUtils = utils.NewSubscriberUtils()

type SubscriberRequests interface {
	AgentConnect(infraData map[string]string)
	RequestProcessor(infraData map[string]string, r types.RawData) error
}

type subscriberRequests struct {
}

func NewSubscriberRequests() SubscriberRequests {
	return &subscriberRequests{}
}
