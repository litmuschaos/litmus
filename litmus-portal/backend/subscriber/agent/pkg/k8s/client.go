package k8s

import (
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/rest"
	"log"
)

//This function returns dynamic client and discovery client
func GetDynamicAndDiscoveryClient() (discovery.DiscoveryInterface, dynamic.Interface, error) {
	// returns a config object which uses the service account kubernetes gives to pods
	config, err := rest.InClusterConfig()
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
