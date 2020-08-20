package cluster

import (
	"context"
	"k8s.io/apimachinery/pkg/api/meta"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/restmapper"

	"fmt"
	yaml_converter "github.com/ghodss/yaml"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	"log"

	memory "k8s.io/client-go/discovery/cached"
)

// New is the Subscriber's Constructor
func New() *Subscriber {
	return &Subscriber{
		Ctx: context.Background(),
	}
}

var PortalConfigName = "litmus-portal-config"
var DefaultNamespace = "litmus"

// IsClusterConfirmed checks if the config map with "is_cluster_confirmed" is true or not.
func (s *Subscriber) IsClusterConfirmed() (bool, error) {
	//s.GetGenericK8sClient()
	clientset, err := s.GetGenericK8sClient()
	if err != nil {
		return false, err
	}

	configMapData := map[string]string{
		"is_cluster_confirmed": "false",
	}

	configMap := corev1.ConfigMap{
		TypeMeta: metav1.TypeMeta{
			Kind:       "ConfigMap",
			APIVersion: "v1",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: PortalConfigName,
		},
		Data: configMapData,
	}

	getCM, err := clientset.CoreV1().ConfigMaps(DefaultNamespace).Get(s.Ctx, PortalConfigName, metav1.GetOptions{})
	if errors.IsNotFound(err) {
		_, err := clientset.CoreV1().ConfigMaps(DefaultNamespace).Create(s.Ctx, &configMap, metav1.CreateOptions{})
		if err != nil {
			return false, err
		}
	} else {
		if getCM.Data["is_cluster_confirmed"] == "true" {
			s.ClusterKey = getCM.Data["cluster_key"]
			return true, nil
		}
	}

	return false, nil
}

// ClusterRegister function creates litmus-portal config map in the litmus namespace
func (s *Subscriber) ClusterRegister(clusterkey string, clusterid string) (bool, error) {
	clientset, err := s.GetGenericK8sClient()
	if err != nil {
		return false, err
	}

	configMapData := map[string]string{
		"is_cluster_confirmed": "true",
		"cluster_key":          clusterkey,
		"cluster_id":           clusterid,
	}

	newConfigMap := corev1.ConfigMap{
		TypeMeta: metav1.TypeMeta{
			Kind:       "ConfigMap",
			APIVersion: "v1",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: PortalConfigName,
		},
		Data: configMapData,
	}

	_, err = clientset.CoreV1().ConfigMaps(DefaultNamespace).Update(s.Ctx, &newConfigMap, metav1.UpdateOptions{})
	if err != nil {
		return false, nil
	}

	log.Println("Configmap Updated")
	return true, nil
}

var decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)

// This function handles cluster operations
func (s *Subscriber) ClusterOperations(manifest string, requestType string) (*unstructured.Unstructured, error) {

	// Converting JSON to YAML and store it in yamlStr variable
	yamlStr, err := yaml_converter.JSONToYAML([]byte(manifest))
	if err != nil {
		return nil, err
	}

	// Getting dynamic and discovery client
	discoveryClient, dynamicClient, err := s.GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}

	// Create a mapper using dynamic client
	mapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(discoveryClient))

	// Decode YAML manifest into unstructured.Unstructured
	obj := &unstructured.Unstructured{}
	_, gvk, err := decUnstructured.Decode([]byte(yamlStr), nil, obj)
	if err != nil {
		return nil, err
	}

	// Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		return nil, err
	}

	// Obtain REST interface for the GVR
	var dr dynamic.ResourceInterface
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		//dr = dynamicClient.Resource(mapping.Resource).Namespace(
		dr = dynamicClient.Resource(mapping.Resource).Namespace("litmus")
	} else {
		// for cluster-wide resources
		dr = dynamicClient.Resource(mapping.Resource)
	}

	if requestType == "create" {
		response, err := dr.Create(s.Ctx, obj, metav1.CreateOptions{})
		if err != nil {
			return nil, err
		}

		log.Println("Resource successfully applied")
		return response, nil
	} else if requestType == "update" {
		response, err := dr.Update(s.Ctx, obj, metav1.UpdateOptions{})
		if err != nil {
			return nil, err
		}

		log.Println("Resource successfully applied")
		return response, nil
	} else if requestType == "delete" {
		err := dr.Delete(s.Ctx, obj.GetName(), metav1.DeleteOptions{})
		if err != nil {
			return nil, err
		}

		log.Println("Resource successfully applied")
		return &unstructured.Unstructured{}, nil
	} else if requestType == "get" {
		response, err := dr.Get(s.Ctx, obj.GetName(), metav1.GetOptions{})
		if err != nil {
			return nil, err
		}

		log.Println("Resource successfully applied")
		return response, nil
	} else {
		return nil, fmt.Errorf("err: %v\n", "Invalid Request")
	}

	return nil, fmt.Errorf("Invalid request")
}
