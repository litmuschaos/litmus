package utils

import (
	"subscriber/pkg/events"
	"subscriber/pkg/k8s"
)

type SubscriberUtils interface {
	WorkflowRequest(agentData map[string]string, requestType string, externalData string, uuid string) error
	DeleteWorkflow(wfname string, agentData map[string]string) error
}

type subscriberUtils struct {
	subscriberEventOperations events.SubscriberEvents
	subscriberK8s             k8s.SubscriberK8s
}

func NewSubscriberUtils(subscriberEventOperations events.SubscriberEvents, subscriberK8s k8s.SubscriberK8s) SubscriberUtils {
	return &subscriberUtils{
		subscriberEventOperations: subscriberEventOperations,
		subscriberK8s:             subscriberK8s,
	}
}
