package fuzz

import (
	"subscriber/pkg/graphql"
	"subscriber/pkg/k8s"
	"subscriber/pkg/types"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
)

func FuzzGetKubernetesNamespaces(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &types.KubeNamespaceRequest{}
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

		response, err := subscriberK8s.GetKubernetesNamespaces(*targetStruct)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
		if response == nil {
			t.Errorf("Returned response is nil")
		} else if len(response) == 0 {
			t.Errorf("Returned response is an empty slice")
		} else {
			for _, ns := range response {
				if ns.Name == "" {
					t.Errorf("Namespace name is empty in response")
				}
			}
		}
	})
}

func FuzzGetKubernetesObjects(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &types.KubeObjRequest{}
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

		response, err := subscriberK8s.GetKubernetesObjects(*targetStruct)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
		if response == nil {
			t.Errorf("Returned response is nil")
			return
		}

		if response.Namespace == "" {
			t.Errorf("Namespace in response is empty")
		}

		if response.Data == nil {
			t.Errorf("Data in response is nil")
		} else {
			if len(response.Data) == 0 {
				t.Errorf("Data in response is an empty slice")
			}
		}
	})
}
func FuzzGetObjectDataByNamespace(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			namespace     string
			dynamicClient dynamic.Interface
			resourceType  schema.GroupVersionResource
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			t.Skip("Failed to generate struct:", err)
			return
		}

		if targetStruct.dynamicClient == nil {
			t.Logf("dynamicClient is nil")
			return
		}
		if targetStruct.resourceType == (schema.GroupVersionResource{}) {
			t.Logf("resourceType is uninitialized")
			return
		}
		if targetStruct.namespace == "" {
			t.Logf("namespace is empty")
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

		response, err := subscriberK8s.GetObjectDataByNamespace(targetStruct.namespace, targetStruct.dynamicClient, targetStruct.resourceType)
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

func FuzzGenerateKubeNamespace(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			cid                  string
			accessKey            string
			version              string
			kubenamespacerequest types.KubeNamespaceRequest
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
		response, err := subscriberK8s.GenerateKubeNamespace(targetStruct.cid, targetStruct.accessKey, targetStruct.version, targetStruct.kubenamespacerequest)
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

func FuzzGenerateKubeObject(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			cid                  string
			accessKey            string
			version              string
			kubenamespacerequest types.KubeObjRequest
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
		response, err := subscriberK8s.GenerateKubeObject(targetStruct.cid, targetStruct.accessKey, targetStruct.version, targetStruct.kubenamespacerequest)
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

func FuzzSendKubeNamespaces(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			infraData            map[string]string
			kubenamespacerequest types.KubeNamespaceRequest
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
		err = subscriberK8s.SendKubeNamespaces(targetStruct.infraData, targetStruct.kubenamespacerequest)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
	})
}

func FuzzSendKubeObjects(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			infraData         map[string]string
			kubeobjectrequest types.KubeObjRequest
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
		err = subscriberK8s.SendKubeObjects(targetStruct.infraData, targetStruct.kubeobjectrequest)
		if err != nil {
			t.Logf("Unexpected error: %v", err)
			return
		}
	})
}
