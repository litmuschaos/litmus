package k8s

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

// GetK8sClients returns the k8s clients
func GetK8sClients(config *rest.Config) (*kubernetes.Clientset, dynamic.Interface, discovery.DiscoveryInterface, error) {
	genericClient, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, nil, nil, err
	}
	dynamicClient, err := dynamic.NewForConfig(config)
	if err != nil {
		return nil, nil, nil, err
	}
	discoveryClient, err := discovery.NewDiscoveryClientForConfig(config)
	if err != nil {
		return nil, nil, nil, err
	}
	return genericClient, dynamicClient, discoveryClient, nil
}

// GetKubeConfig returns the *rest.Config
func GetKubeConfig() (*rest.Config, error) {
	kubeConfig := utils.Config.KubeConfigFilePath
	// Use in-cluster config if KubeConfig path is not specified
	if kubeConfig == "" {
		return rest.InClusterConfig()
	}

	return clientcmd.BuildConfigFromFlags("", kubeConfig)
}
