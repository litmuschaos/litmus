package kubernetes

import (
	"k8s.io/client-go/kubernetes"
	"sigs.k8s.io/controller-runtime/pkg/client/config"
)

 // CreateClientSet will generate the kubernetes clientset using config
func CreateClientSet() (*kubernetes.Clientset, error) {
	restConfig, err := config.GetConfig()
	if err != nil {
		return &kubernetes.Clientset{}, err
	}
	clientSet, err := kubernetes.NewForConfig(restConfig)
	if err != nil {
		return &kubernetes.Clientset{}, err
	}
	return clientSet, nil
}