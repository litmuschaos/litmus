package requests

import (
	"subscriber/pkg/k8s"
	"subscriber/pkg/types"
	"subscriber/pkg/utils"
)

type SubscriberRequests interface {
	AgentConnect(infraData map[string]string)
	RequestProcessor(infraData map[string]string, r types.RawData) error
}

type subscriberRequests struct {
	subscriberK8s   k8s.SubscriberK8s
	subscriberUtils utils.SubscriberUtils
}

func NewSubscriberRequests(subscriberK8s k8s.SubscriberK8s, subscriberUtils utils.SubscriberUtils) SubscriberRequests {
	return &subscriberRequests{
		subscriberK8s:   subscriberK8s,
		subscriberUtils: subscriberUtils,
	}
}
