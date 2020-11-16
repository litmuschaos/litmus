package k8s

import (
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"os"
)

func GetKubeConfig() (*rest.Config, error) {
	KubeConfig := os.Getenv("KUBECONFIG")
	// Use in-cluster config if kubeconfig path is not specified
	if KubeConfig == "" {
		return rest.InClusterConfig()
	}

	return clientcmd.BuildConfigFromFlags("", KubeConfig)
}

func GetGenericK8sClient() (*kubernetes.Clientset, error) {
	config, err := GetKubeConfig()
	if err != nil {
		return nil, err
	}

	return kubernetes.NewForConfig(config)
}

//This function returns dynamic client and discovery client
func GetDynamicAndDiscoveryClient() (discovery.DiscoveryInterface, dynamic.Interface, error) {
	// returns a config object which uses the service account kubernetes gives to pods
	config, err := GetKubeConfig()
	if err != nil {
		return nil, nil, err
	}

	// NewDiscoveryClientForConfig creates a new DiscoveryClient for the given config
	discoveryClient, err := discovery.NewDiscoveryClientForConfig(config)
	if err != nil {
		return nil, nil, err
	}

	// NewForConfig creates a new dynamic client or returns an error.
	dynamicClient, err := dynamic.NewForConfig(config)
	if err != nil {
		return nil, nil, err
	}

	return discoveryClient, dynamicClient, nil
}
