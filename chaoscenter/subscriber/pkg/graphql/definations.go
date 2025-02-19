package graphql

import (
	"subscriber/pkg/types"
)

type SubscriberGql interface {
	SendRequest(server string, payload []byte) (string, error)
	MarshalGQLData(gqlData interface{}) (string, error)
	SendExperimentRunRuquest(infraData map[string]string, podLog types.PodLogRequest) (types.ExperimentRunResponse, error)
	GenerateExperimentRunPayload(cid, accessKey, version string, podLog types.PodLogRequest) ([]byte, error)
}

type subscriberGql struct {
}

func NewSubscriberGql() SubscriberGql {
	return &subscriberGql{}
}
