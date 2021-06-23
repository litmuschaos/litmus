package k8s

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/graphql"

	yaml_converter "github.com/ghodss/yaml"
	"github.com/sirupsen/logrus"
	yaml2 "gopkg.in/yaml.v2"
	corev1 "k8s.io/api/core/v1"
	k8s_errors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
	memory "k8s.io/client-go/discovery/cached"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/restmapper"
)

const (
	ExternAgentConfigName = "agent-config"
	LiveCheckMaxTries     = 6
)

type AgentComponents struct {
	Deployments      []string `yaml:"DEPLOYMENTS"`
	LiveStatus       bool
	AccessLiveStatus sync.Mutex
}

var (
	Ctx             = context.Background()
	decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
	dr              dynamic.ResourceInterface
	//AgentNamespace  = os.Getenv("AGENT_NAMESPACE")
)

func CheckComponentStatus(componentEnv string) error {
	if componentEnv == "" {
		return errors.New("components not found in agent config")
	}

	clientset, err := GetGenericK8sClient()
	if err != nil {
		return err
	}

	var components AgentComponents

	err = yaml2.Unmarshal([]byte(strings.TrimSpace(componentEnv)), &components)
	if err != nil {
		return err
	}

	components.LiveStatus = true
	components.AccessLiveStatus = sync.Mutex{}

	wait := sync.WaitGroup{}

	// add all agent components to waitgroup
	wait.Add(1)
	go checkDeploymentStatus(&components, clientset, &wait)

	wait.Wait()
	if !components.LiveStatus {
		return errors.New("all components failed to startup")
	}
	return nil
}

func checkDeploymentStatus(components *AgentComponents, clientset *kubernetes.Clientset, wait *sync.WaitGroup) {
	downCount := 0
	retries := 0
	defer wait.Done()
	for retries < LiveCheckMaxTries {
		for _, dep := range components.Deployments {
			podList, err := clientset.CoreV1().Pods(AgentNamespace).List(metav1.ListOptions{LabelSelector: dep})
			if err != nil {
				logrus.Errorf("failed to get deployment pods %v , err : %v", dep, err.Error())
				downCount += 1
				continue
			}
			if len(podList.Items) == 0 {
				logrus.Errorf("failed to get deployments pods %v , err : pods not found", dep)
				downCount += 1
				continue
			}
		outer:
			for _, pod := range podList.Items {
				if pod.Status.Phase != corev1.PodRunning {
					logrus.Errorf("failed to get running pods for dep %v", dep)
					downCount += 1
					break
				}
				for _, containerStatus := range pod.Status.ContainerStatuses {
					if !containerStatus.Ready {
						logrus.Errorf("failed to get ready containers for pod %v, dep %v", pod.Name, dep)
						downCount += 1
						break outer
					}
				}
			}
		}
		if downCount == 0 {
			logrus.Info("all deployments up")
			return
		} else {
			retries += 1
			downCount = 0
			time.Sleep(30 * time.Second)
		}
	}
	components.AccessLiveStatus.Lock()
	defer components.AccessLiveStatus.Unlock()
	components.LiveStatus = false
}

func IsClusterConfirmed() (bool, string, error) {
	clientset, err := GetGenericK8sClient()
	if err != nil {
		return false, "", err
	}

	getCM, err := clientset.CoreV1().ConfigMaps(AgentNamespace).Get(ExternAgentConfigName, metav1.GetOptions{})
	if k8s_errors.IsNotFound(err) {
		return false, "", nil
	} else if getCM.Data["IS_CLUSTER_CONFIRMED"] == "true" {
		return true, getCM.Data["ACCESS_KEY"], nil
	} else if err != nil {
		return false, "", err
	}

	return false, "", nil
}

// ClusterRegister function creates litmus-portal config map in the litmus namespace
func ClusterRegister(clusterData map[string]string) (bool, error) {
	clientset, err := GetGenericK8sClient()
	if err != nil {
		return false, err
	}

	newConfigMapData := map[string]string{
		"ACCESS_KEY":           clusterData["ACCESS_KEY"],
		"IS_CLUSTER_CONFIRMED": clusterData["IS_CLUSTER_CONFIRMED"],
		"CLUSTER_ID":           clusterData["CLUSTER_ID"],
		"SERVER_ADDR":          clusterData["SERVER_ADDR"],
		"AGENT_SCOPE":          clusterData["AGENT_SCOPE"],
		"COMPONENTS":           clusterData["COMPONENTS"],
		"START_TIME":           clusterData["START_TIME"],
	}

	_, err = clientset.CoreV1().ConfigMaps(AgentNamespace).Update(&corev1.ConfigMap{
		Data: newConfigMapData,
		ObjectMeta: metav1.ObjectMeta{
			Name: ExternAgentConfigName,
		},
	})
	if err != nil {
		return false, err
	}

	logrus.Info(ExternAgentConfigName + " has been updated")
	return true, nil
}

func applyRequest(requestType string, obj *unstructured.Unstructured) (*unstructured.Unstructured, error) {
	if requestType == "create" {
		response, err := dr.Create(obj, metav1.CreateOptions{})
		if k8s_errors.IsAlreadyExists(err) {
			// This doesnt ever happen even if it does already exist
			logrus.Info("Already exists")
			return nil, nil
		}

		if err != nil {
			return nil, err
		}

		logrus.Info("successfully created for kind: ", response.GetKind(), ", resource name: ", response.GetName(), ", and namespace: ", response.GetNamespace())
		return response, nil
	} else if requestType == "update" {
		getObj, err := dr.Get(obj.GetName(), metav1.GetOptions{})
		if k8s_errors.IsNotFound(err) {
			// This doesnt ever happen even if it is already deleted or not found
			logrus.Info("%v not found", obj.GetName())
			return nil, nil
		}

		if err != nil {
			return nil, err
		}

		obj.SetResourceVersion(getObj.GetResourceVersion())

		response, err := dr.Update(obj, metav1.UpdateOptions{})
		if err != nil {
			return nil, err
		}

		logrus.Info("successfully updated for kind: ", response.GetKind(), ", resource name: ", response.GetName(), ", and namespace: ", response.GetNamespace())
		return response, nil
	} else if requestType == "delete" {
		err := dr.Delete(obj.GetName(), &metav1.DeleteOptions{})
		if k8s_errors.IsNotFound(err) {
			// This doesnt ever happen even if it is already deleted or not found
			logrus.Info("%v not found", obj.GetName())
			return nil, nil
		}

		if err != nil {
			return nil, err
		}

		logrus.Info("successfully deleted for kind: ", obj.GetKind(), ", resource name: ", obj.GetName(), ", and namespace: ", obj.GetNamespace())
		return &unstructured.Unstructured{}, nil
	} else if requestType == "get" {
		response, err := dr.Get(obj.GetName(), metav1.GetOptions{})
		if k8s_errors.IsNotFound(err) {
			// This doesnt ever happen even if it is already deleted or not found
			logrus.Info("%v not found", obj.GetName())
			return nil, nil
		}

		if err != nil {
			return nil, err
		}

		logrus.Info("successfully retrieved for kind: ", response.GetKind(), ", resource name: ", response.GetName(), ", and namespace: ", response.GetNamespace())
		return response, nil
	}

	return nil, fmt.Errorf("err: %v\n", "Invalid Request")
}

// This function handles cluster operations
func ClusterOperations(manifest string, requestType string, namespace string) (*unstructured.Unstructured, error) {

	// Converting JSON to YAML and store it in yamlStr variable
	yamlStr, err := yaml_converter.JSONToYAML([]byte(manifest))
	if err != nil {
		return nil, err
	}

	// Getting dynamic and discovery client
	discoveryClient, dynamicClient, err := GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}

	// Create a mapper using dynamic client
	mapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(discoveryClient))

	// Decode YAML manifest into unstructured.Unstructured
	obj := &unstructured.Unstructured{}
	_, gvk, err := decUnstructured.Decode([]byte(yamlStr), nil, obj)
	if err != nil {
		return nil, err
	}

	// Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		return nil, err
	}

	// Obtain REST interface for the GVR
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = dynamicClient.Resource(mapping.Resource).Namespace(namespace)
	} else {
		// for cluster-wide resources
		dr = dynamicClient.Resource(mapping.Resource)
	}

	return applyRequest(requestType, obj)
}

func ClusterConfirm(clusterData map[string]string) ([]byte, error) {
	payload := `{"query":"mutation{ clusterConfirm(identity: {cluster_id: \"` + clusterData["CLUSTER_ID"] + `\", access_key: \"` + clusterData["ACCESS_KEY"] + `\"}){isClusterConfirmed newAccessKey cluster_id}}"}`
	resp, err := graphql.SendRequest(clusterData["SERVER_ADDR"], []byte(payload))
	if err != nil {
		return nil, err
	}
	return []byte(resp), nil
}
