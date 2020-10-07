package k8s

import (
	"context"
	"log"
	"os"

	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

func CreateDeployment(namespace, token string) (*appsv1.Deployment, error) {
	deployerImage := os.Getenv("DEPLOYER_IMAGE")
	subscriberSC := os.Getenv("AGENT_SCOPE")
	selfDeployerSvcAccount := "self-deployer-namespace-account"
	if subscriberSC == "cluster" {
		selfDeployerSvcAccount = "self-deployer-admin-account"
	}
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
							Name:  "deployer",
							Image: deployerImage,
							Resources: apiv1.ResourceRequirements{
								Limits: apiv1.ResourceList{
									"cpu":    resource.MustParse("100m"),
									"memory": resource.MustParse("128Mi"),
								},
							},
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
								{
									Name: "NAMESPACE",
									ValueFrom: &apiv1.EnvVarSource{
										FieldRef: &apiv1.ObjectFieldSelector{
											FieldPath: "metadata.namespace",
										},
									},
								},
							},
						},
					},
					ServiceAccountName: selfDeployerSvcAccount,
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
