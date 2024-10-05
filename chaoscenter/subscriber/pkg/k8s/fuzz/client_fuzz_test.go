package fuzz

import (
	"subscriber/pkg/graphql"
	"subscriber/pkg/k8s"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
)

func FuzzGenerateArgoClient(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			namespace string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		if targetStruct.namespace == "" {
			targetStruct.namespace = "default-namespace"
		}
		subscriberGraphql := graphql.NewSubscriberGql()
		subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)

		wfClient, err := subscriberK8s.GenerateArgoClient(targetStruct.namespace)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}

		if wfClient == nil {
			t.Errorf("Returned payload is nil")
		}
	})
}
