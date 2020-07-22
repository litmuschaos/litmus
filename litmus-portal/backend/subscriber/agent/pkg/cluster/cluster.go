package cluster

import (
	"context"
	"encoding/json"
	"fmt"
	y "github.com/ghodss/yaml"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	"k8s.io/client-go/discovery"
	memory "k8s.io/client-go/discovery/cached"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/rest"
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

		return &unstructured.Unstructured{}, fmt.Errorf("Invalid request")
	}

	return &unstructured.Unstructured{}, fmt.Errorf("Invalid request")
}

func ClusterOperations(clientData map[string]interface{}) (*unstructured.Unstructured, error) {

	manifestByte, err := json.Marshal(clientData["manifest"])
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}

	requestType := clientData["requesttype"]

	y, err := y.JSONToYAML([]byte(manifestByte))
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}

	cfg, err := rest.InClusterConfig()
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}

	dc, err := discovery.NewDiscoveryClientForConfig(cfg)
	if err != nil {
		return nil, fmt.Errorf("err: %v\n", err)
	}
	mapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(dc))

	// Prepare the dynamic client
	dyn, err := dynamic.NewForConfig(cfg)
	if err != nil {
		log.Printf("err: %v\n", err)
	}

	// Decode YAML manifest into unstructured.Unstructured
	obj := &unstructured.Unstructured{}
	_, gvk, err := decUnstructured.Decode([]byte(y), nil, obj)
	if err != nil {
		log.Printf("err: %v\n", err)
	}

	// Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		log.Printf("err: %v\n", err)
	}

	// Obtain REST interface for the GVR
	var dr dynamic.ResourceInterface
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = dyn.Resource(mapping.Resource).Namespace(obj.GetNamespace())
	} else {
		// for cluster-wide resources
		dr = dyn.Resource(mapping.Resource)
	}

	return applyRequest(obj, requestType, dr)
}
