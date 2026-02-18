package fuzz

import (
	"subscriber/pkg/graphql"
	"subscriber/pkg/k8s"
	pkgTypes "subscriber/pkg/types"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
)

func FuzzCheckComponentStatus(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			componentEnv string
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
		err = subscriberK8s.CheckComponentStatus(targetStruct.componentEnv)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
	})
}

func FuzzAgentRegister(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			accessKey string
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
		_, err = subscriberK8s.AgentRegister(targetStruct.accessKey)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
	})
}

func FuzzAgentOperations(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			infraAction pkgTypes.Action
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
		response, err := subscriberK8s.AgentOperations(targetStruct.infraAction)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
		if response == nil {
			t.Errorf("Returned response is nil")
			return
		}
	})
}

func FuzzAgentConfirm(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			infraData map[string]string
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
		response, err := subscriberK8s.AgentConfirm(targetStruct.infraData)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
		if response == nil {
			t.Errorf("Returned response is nil")
			return
		}
	})
}
