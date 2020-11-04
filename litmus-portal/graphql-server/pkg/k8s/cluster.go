package k8s

import (
	"context"
	"log"
	"os"
	"strconv"

	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/restmapper"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	memory "k8s.io/client-go/discovery/cached"
)

var (
	decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
	dr              dynamic.ResourceInterface
	AgentNamespace  = os.Getenv("AGENT_NAMESPACE")
)

// This function handles cluster operations
func ClusterResource(manifest string, namespace string) (*unstructured.Unstructured, error) {
	// Getting dynamic and discovery client
	discoveryClient, dynamicClient, err := GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}

	// Create a mapper using dynamic client
	mapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(discoveryClient))

	// Decode YAML manifest into unstructured.Unstructured
	obj := &unstructured.Unstructured{}
	_, gvk, err := decUnstructured.Decode([]byte(manifest), nil, obj)
	if err != nil {
		return nil, err
	}

	// Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		return nil, err
	}

	// Obtain REST interface for the GVR
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = dynamicClient.Resource(mapping.Resource).Namespace(namespace)
	} else {
		// for cluster-wide resources
		dr = dynamicClient.Resource(mapping.Resource)
	}

	response, err := dr.Create(context.TODO(), obj, metav1.CreateOptions{})
	if errors.IsAlreadyExists(err) {
		// This doesnt ever happen even if it does already exist
		log.Print("Already exists")
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	log.Println("Resource successfully created")

	return response, nil
}

func GetPortalEndpoint() (string, error) {
	var (
		Nodeport       int32
		ExternalIP     string
		InternalIP     string
		LitmusPortalNS = os.Getenv("LITMUS_PORTAL_NAMESPACE")
	)

	clientset, err := GetGenericK8sClient()
	if err != nil {
		return "", err
	}

	podList, _ := clientset.CoreV1().Pods(LitmusPortalNS).List(context.TODO(), metav1.ListOptions{
		LabelSelector: "component=litmusportal-server",
	})

	svc, err := clientset.CoreV1().Services(LitmusPortalNS).Get(context.TODO(), "litmusportal-server-service", metav1.GetOptions{})
	if err != nil {
		return "", err
	}

	for _, port := range svc.Spec.Ports {
		if port.Name == "graphql-server" {
			Nodeport = port.NodePort
		}
	}

	nodeIP, err := clientset.CoreV1().Nodes().Get(context.TODO(), podList.Items[0].Spec.NodeName, metav1.GetOptions{})
	if err != nil {
		return "", err
	}

	for _, addr := range nodeIP.Status.Addresses {
		if addr.Type == "ExternalIP" && addr.Address != "" {
			ExternalIP = addr.Address
		} else if addr.Type == "InternalIP" && addr.Address != "" {
			InternalIP = addr.Address
		}
	}

	if ExternalIP == "" {
		return "http://" + InternalIP + ":" + strconv.Itoa(int(Nodeport)), nil
	} else {
		return "http://" + ExternalIP + ":" + strconv.Itoa(int(Nodeport)), nil
	}
}
