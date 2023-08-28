package utils

import (
	"subscriber/pkg/graphql"
	"subscriber/pkg/k8s"
)

var gqlSubscriberServer = graphql.NewGqlServer()
var subscriberK8s = k8s.NewKubernetes()

type SubscriberUtils interface {
	WorkflowRequest(agentData map[string]string, requestType string, externalData string, uuid string) error
	DeleteWorkflow(wfname string, agentData map[string]string) error
}

type subscriberUtils struct {
}

func NewSubscriberUtils() SubscriberUtils {
	return &subscriberUtils{}
}
