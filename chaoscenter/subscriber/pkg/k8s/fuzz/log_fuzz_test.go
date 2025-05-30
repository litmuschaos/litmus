package fuzz

import (
	"subscriber/pkg/graphql"
	"subscriber/pkg/k8s"
	"subscriber/pkg/types"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
)

func FuzzGetLogs(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			PodName   string
			Namespace string
			Container string
		}{}

		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			t.Skip("Failed to generate struct:", err)
			return
		}

		subscriberGraphql := graphql.NewSubscriberGql()
		if subscriberGraphql == nil {
			t.Fatalf("Failed to create a GraphQL subscriber")
		}

		subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)
		if subscriberK8s == nil {
			t.Fatalf("Failed to create a Kubernetes subscriber")
		}

		response, err := subscriberK8s.GetLogs(targetStruct.PodName, targetStruct.Namespace, targetStruct.Container)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
		if response == "" {
			t.Errorf("Returned payload is nil")
		}
	})
}

func FuzzCreatePodLogs(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			podLog types.PodLogRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		subscriberGraphql := graphql.NewSubscriberGql()
		subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)
		_, err = subscriberK8s.CreatePodLog(targetStruct.podLog)
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}
	})
}

func FuzzSendPodLogs(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			infraData map[string]string
			podLog    types.PodLogRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		subscriberGraphql := graphql.NewSubscriberGql()
		subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)
		subscriberK8s.SendPodLogs(targetStruct.infraData, targetStruct.podLog)
	})
}

func FuzzGenerateLogPayload(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			cid       string
			accessKey string
			version   string
			podLog    types.PodLogRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		subscriberGraphql := graphql.NewSubscriberGql()
		subscriberK8s := k8s.NewK8sSubscriber(subscriberGraphql)
		response, err := subscriberK8s.GenerateLogPayload(targetStruct.cid, targetStruct.accessKey, targetStruct.version, targetStruct.podLog)
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}
		if response == nil {
			t.Errorf("Returned payload is nil")
		}

	})
}
