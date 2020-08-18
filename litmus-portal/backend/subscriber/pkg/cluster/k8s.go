package cluster

import (
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

//getKubeConfig setup the config for access cluster resource
func (s *Subscriber) getKubeConfig() (*rest.Config, error) {

	// Use in-cluster config if kubeconfig path is specified
	if *s.KubeConfig == "" {
		config, err := rest.InClusterConfig()
		if err != nil {
			return config, err
		}
	}

	config, err := clientcmd.BuildConfigFromFlags("", *s.KubeConfig)
	if err != nil {
		return config, err
	}

	return config, err
}

func (s *Subscriber) GetGenericK8sClient() (*kubernetes.Clientset, error) {
	config, err := s.getKubeConfig()
	if err != nil {
		return nil, err
	}

	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return clientSet, nil
}

//This function returns dynamic client and discovery client
func (s *Subscriber) GetDynamicAndDiscoveryClient() (discovery.DiscoveryInterface, dynamic.Interface, error) {
	// returns a config object which uses the service account kubernetes gives to pods
	config, err := s.getKubeConfig()
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
