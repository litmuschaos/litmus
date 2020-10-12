package k8s

import (
	"context"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"log"
	"os"
	"strconv"
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
			Replicas: func(i int32) *int32 { return &i }(1),
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

func GetPortalEndpoint() (string, error) {
	var (
		Nodeport       int32
		ExternalIP     string
		InternalIP     string
		LitmusPortalNS = os.Getenv("LITMUS_PORTAL_NAMESPACE")
	)

	clientset, err := GetGenericK8sClient()
	if err != nil {
		return "", err
	}

	podList, _ := clientset.CoreV1().Pods(LitmusPortalNS).List(context.TODO(), metav1.ListOptions{
		LabelSelector: "component=litmusportal-server",
	})

	svc, err := clientset.CoreV1().Services(LitmusPortalNS).Get(context.TODO(), "litmusportal-server-service", metav1.GetOptions{})
	if err != nil {
		return "", err
	}

	for _, port := range svc.Spec.Ports {
		if port.Name == "graphql-server" {
			Nodeport = port.NodePort
		}
	}

	nodeIP, err := clientset.CoreV1().Nodes().Get(context.TODO(), podList.Items[0].Spec.NodeName, metav1.GetOptions{})
	if err != nil {
		return "", err
	}

	for _, addr := range nodeIP.Status.Addresses {
		if addr.Type == "ExternalIP" && addr.Address != "" {
			ExternalIP = addr.Address
		} else if addr.Type == "InternalIP" && addr.Address != "" {
			InternalIP = addr.Address
		}
	}

	if ExternalIP == "" {
		return "http://" + InternalIP + ":" + strconv.Itoa(int(Nodeport)), nil
	} else {
		return "http://" + ExternalIP + ":" + strconv.Itoa(int(Nodeport)), nil
	}
}
