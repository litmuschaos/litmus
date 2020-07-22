package cluster

import (
	"context"
	"encoding/json"
	"fmt"
	yaml_converter "github.com/ghodss/yaml"
	k8s_client "github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/agent/pkg/k8s"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	memory "k8s.io/client-go/discovery/cached"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/restmapper"
	"log"
)

var decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)

func applyRequest(obj *unstructured.Unstructured, requestType interface{}, dr dynamic.ResourceInterface) (*unstructured.Unstructured, error) {

	if requestType == "create" {
		response, err := dr.Create(context.TODO(), obj, metav1.CreateOptions{})
		if err != nil {
			return nil, fmt.Errorf("err: %v\n", err)
		}

		log.Println("Resource successfully applied")

		return response, nil
	} else if requestType == "update" {
		response, err := dr.Update(context.TODO(), obj, metav1.UpdateOptions{})
		if err != nil {
			return nil, fmt.Errorf("err: %v\n", err)
		}

		log.Println("Resource successfully applied")

		return response, nil
	} else if requestType == "delete" {
		err := dr.Delete(context.TODO(), obj.GetName(), metav1.DeleteOptions{})
		if err != nil {
			return nil, fmt.Errorf("err: %v\n", err)
		}

		log.Println("Resource successfully applied")

		return &unstructured.Unstructured{}, nil
	} else if requestType == "get" {
		response, err := dr.Get(context.TODO(), obj.GetName(), metav1.GetOptions{})
		if err != nil {
			return nil, fmt.Errorf("err: %v\n", err)
		}

		log.Println("Resource successfully applied")

		return response, nil
	} else {
		log.Println("Invalid Request")

		return nil, fmt.Errorf("err: %v\n", "Invalid Request")
	}

	return nil, fmt.Errorf("Invalid request")
}

func ClusterOperations(clientData map[string]interface{}) (*unstructured.Unstructured, error) {

	manifestByte, err := json.Marshal(clientData["manifest"])
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}

	requestType := clientData["requesttype"]

	// Converting JSON to YAML and store it in yamlStr variable
	yamlStr, err := yaml_converter.JSONToYAML([]byte(manifestByte))
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}

	// Getting dynamic and discovery client
	discoveryClient, dynamicClient, err := k8s_client.GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}

	// Create a mapper using dynamic client
	mapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(discoveryClient))

	// Decode YAML manifest into unstructured.Unstructured
	obj := &unstructured.Unstructured{}
	_, gvk, err := decUnstructured.Decode([]byte(yamlStr), nil, obj)
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}

	// Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}

	// Obtain REST interface for the GVR
	var dr dynamic.ResourceInterface
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = dynamicClient.Resource(mapping.Resource).Namespace(obj.GetNamespace())
	} else {
		// for cluster-wide resources
		dr = dynamicClient.Resource(mapping.Resource)
	}

	return applyRequest(obj, requestType, dr)
}
