package k8s

import (
	wfclientset "github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned"
	v1alpha12 "github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned/typed/workflow/v1alpha1"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

var KubeConfig *string

// getKubeConfig setup the config for access cluster resource
func (k8s *k8sSubscriber) GetKubeConfig() (*rest.Config, error) {
	// Use in-cluster config if kubeconfig path is not specified
	if *KubeConfig == "" {
		return rest.InClusterConfig()
	}
	return clientcmd.BuildConfigFromFlags("", *KubeConfig)
}

func (k8s *k8sSubscriber) GetGenericK8sClient() (*kubernetes.Clientset, error) {
	config, err := k8s.GetKubeConfig()
	if err != nil {
		return nil, err
	}

	return kubernetes.NewForConfig(config)
}

// This function returns dynamic client and discovery client
func (k8s *k8sSubscriber) GetDynamicAndDiscoveryClient() (discovery.DiscoveryInterface, dynamic.Interface, error) {
	// returns a config object which uses the service account kubernetes gives to pods
	config, err := k8s.GetKubeConfig()
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

func (k8s *k8sSubscriber) GenerateArgoClient(namespace string) (v1alpha12.WorkflowInterface, error) {

	//List all chaosEngines present in the particular namespace
	conf, err := k8s.GetKubeConfig()
	if err != nil {
		return nil, err
	}

	// create the events client
	wfClient := wfclientset.NewForConfigOrDie(conf).ArgoprojV1alpha1().Workflows(namespace)
	return wfClient, nil
}
