package k8s

import (
	"flag"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"log"
)

var config *rest.Config
var err error

// getKubeConfig setup the config for access cluster resource
func getKubeConfig(kubeconfig *string) (*rest.Config, error) {
	flag.Parse()
	// Use in-cluster config if kubeconfig path is specified
	if *kubeconfig == "" {
		config, err = rest.InClusterConfig()
		if err != nil {
			return config, err
		}
	}
	config, err = clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		return config, err
	}
	return config, err
}

//This function returns dynamic client and discovery client
func GetDynamicAndDiscoveryClient(kubeconfig *string) (discovery.DiscoveryInterface, dynamic.Interface, error) {
	// returns a config object which uses the service account kubernetes gives to pods
	config, err := getKubeConfig(kubeconfig)
	if err != nil {
		log.Printf("err: %v\n", err)
	}

	// NewDiscoveryClientForConfig creates a new DiscoveryClient for the given config
	discoveryClient, err := discovery.NewDiscoveryClientForConfig(config)
	if err != nil {
		log.Printf("err: %v\n", err)
	}

	// NewForConfig creates a new dynamic client or returns an error.
	dynamicClient, err := dynamic.NewForConfig(config)
	if err != nil {
		log.Printf("err: %v\n", err)
	}

	return discoveryClient, dynamicClient, nil
}
