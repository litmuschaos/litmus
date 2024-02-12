package k8s

import (
	"subscriber/pkg/graphql"
	"subscriber/pkg/types"

	v1alpha12 "github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned/typed/workflow/v1alpha1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type SubscriberK8s interface {
	GetLogs(podName, namespace, container string) (string, error)
	CreatePodLog(podLog types.PodLogRequest) (types.PodLog, error)
	SendPodLogs(infraData map[string]string, podLog types.PodLogRequest)
	GenerateLogPayload(cid, accessKey, version string, podLog types.PodLogRequest) ([]byte, error)
	GetKubernetesObjects(request types.KubeObjRequest) ([]*types.KubeObject, error)
	GetObjectDataByNamespace(namespace string, dynamicClient dynamic.Interface, resourceType schema.GroupVersionResource) ([]types.ObjectData, error)
	GenerateKubeObject(cid string, accessKey, version string, kubeobjectrequest types.KubeObjRequest) ([]byte, error)
	SendKubeObjects(infraData map[string]string, kubeobjectrequest types.KubeObjRequest) error
	CheckComponentStatus(componentEnv string) error
	IsAgentConfirmed() (bool, string, error)
	AgentRegister(accessKey string) (bool, error)
	AgentOperations(infraAction types.Action) (*unstructured.Unstructured, error)
	AgentConfirm(infraData map[string]string) ([]byte, error)
	GetKubeConfig() (*rest.Config, error)
	GetGenericK8sClient() (*kubernetes.Clientset, error)
	GetDynamicAndDiscoveryClient() (discovery.DiscoveryInterface, dynamic.Interface, error)
	GenerateArgoClient(namespace string) (v1alpha12.WorkflowInterface, error)
}

type k8sSubscriber struct {
	gqlSubscriberServer graphql.SubscriberGql
}

func NewK8sSubscriber(gqlSubscriberServer graphql.SubscriberGql) SubscriberK8s {
	return &k8sSubscriber{
		gqlSubscriberServer: gqlSubscriberServer,
	}
}
