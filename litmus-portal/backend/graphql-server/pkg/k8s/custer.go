package k8s

import (
	"context"
	"log"
	"os"

	"k8s.io/client-go/kubernetes"

	"k8s.io/client-go/tools/clientcmd"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
)

func CreateDeployment(namespace, token string) (*appsv1.Deployment, error) {
	cfg, err := GetKubeConfig()
	clientset, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		panic(err)
	}
	deploymentsClient := clientset.AppsV1().Deployments(namespace)

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "self-deployer",
			Labels:    map[string]string{"component": "self-deployer"},
			Namespace: namespace,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"component": "self-deployer",
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"component": "self-deployer",
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:            "deployer",
							Image:           "litmuschaos/litmusportal-self-deployer:ci",
							ImagePullPolicy: "Always",
							Env: []apiv1.EnvVar{
								{
									Name:  "SERVER",
									Value: "http://litmusportal-server-service:9002",
								},
								{
									Name:  "TOKEN",
									Value: token,
								},
							},
						},
					},
					ServiceAccountName: "litmus-svc-account",
				},
			},
		},
	}

	// Create Deployment
	log.Println("Creating deployment...")
	result, err := deploymentsClient.Create(context.TODO(), deployment, metav1.CreateOptions{})
	if err != nil {
		return nil, err
	}
	return result, nil
}

func GetKubeConfig() (*rest.Config, error) {
	if kubeConfig := os.Getenv("KUBECONFIG"); kubeConfig != "" {
		return clientcmd.BuildConfigFromFlags("", kubeConfig)
	} else {
		return rest.InClusterConfig()
	}
}
func int32Ptr(i int32) *int32 { return &i }
