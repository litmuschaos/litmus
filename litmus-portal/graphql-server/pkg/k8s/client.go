package k8s

import (
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
