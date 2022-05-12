package k8s

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"

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
	AgentConfigName   = "agent-config"
	AgentSecretName   = "agent-secret"
	LiveCheckMaxTries = 6
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
	ctx := context.TODO()
	downCount := 0
	retries := 0
	defer wait.Done()
	for retries < LiveCheckMaxTries {
		for _, dep := range components.Deployments {
			podList, err := clientset.CoreV1().Pods(AgentNamespace).List(ctx, metav1.ListOptions{LabelSelector: dep})
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
			logrus.Info("All agent deployments are up")
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

	getCM, err := clientset.CoreV1().ConfigMaps(AgentNamespace).Get(context.TODO(), AgentConfigName, metav1.GetOptions{})
	if k8s_errors.IsNotFound(err) {
		return false, "", errors.New(AgentConfigName + " configmap not found")
	} else if getCM.Data["IS_CLUSTER_CONFIRMED"] == "true" {
		getSecret, err := clientset.CoreV1().Secrets(AgentNamespace).Get(context.TODO(), AgentSecretName, metav1.GetOptions{})

		if k8s_errors.IsNotFound(err) {
			return false, "", errors.New(AgentSecretName + " secret not found")
		}

		if err != nil {
			return false, "", err
		}

		return true, string(getSecret.Data["ACCESS_KEY"]), nil
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
		"IS_CLUSTER_CONFIRMED": clusterData["IS_CLUSTER_CONFIRMED"],
		"SERVER_ADDR":          clusterData["SERVER_ADDR"],
		"AGENT_SCOPE":          clusterData["AGENT_SCOPE"],
		"COMPONENTS":           clusterData["COMPONENTS"],
		"START_TIME":           clusterData["START_TIME"],
		"VERSION":              clusterData["VERSION"],
		"SKIP_SSL_VERIFY":      clusterData["SKIP_SSL_VERIFY"],
		"CUSTOM_TLS_CERT":      clusterData["CUSTOM_TLS_CERT"],
	}

	_, err = clientset.CoreV1().ConfigMaps(AgentNamespace).Update(context.TODO(), &corev1.ConfigMap{
		Data: newConfigMapData,
		ObjectMeta: metav1.ObjectMeta{
			Name: AgentConfigName,
		},
	}, metav1.UpdateOptions{})
	if err != nil {
		return false, err
	}

	logrus.Info(AgentConfigName + " has been updated")

	newSecretData := map[string]string{
		"ACCESS_KEY": clusterData["ACCESS_KEY"],
		"CLUSTER_ID": clusterData["CLUSTER_ID"],
	}

	_, err = clientset.CoreV1().Secrets(AgentNamespace).Update(context.TODO(), &corev1.Secret{
		StringData: newSecretData,
		ObjectMeta: metav1.ObjectMeta{
			Name: AgentSecretName,
		},
	}, metav1.UpdateOptions{})
	if err != nil {
		return false, err
	}

	logrus.Info(AgentSecretName + " has been updated")

	return true, nil
}

func applyRequest(requestType string, obj *unstructured.Unstructured) (*unstructured.Unstructured, error) {
	ctx := context.TODO()
	if requestType == "create" {
		response, err := dr.Create(ctx, obj, metav1.CreateOptions{})
		if k8s_errors.IsAlreadyExists(err) {
			// This doesn't ever happen even if it does already exist
			logrus.Info("Already exists")
			return nil, nil
		}

		if err != nil {
			return nil, err
		}

		logrus.Info("Successfully created for kind: ", response.GetKind(), ", resource name: ", response.GetName(), ", and namespace: ", response.GetNamespace())
		return response, nil
	} else if requestType == "update" {
		getObj, err := dr.Get(ctx, obj.GetName(), metav1.GetOptions{})
		if k8s_errors.IsNotFound(err) {
			// This doesn't ever happen even if it is already deleted or not found
			logrus.Info("%v not found", obj.GetName())
			return nil, nil
		}

		if err != nil {
			return nil, err
		}

		obj.SetResourceVersion(getObj.GetResourceVersion())

		response, err := dr.Update(ctx, obj, metav1.UpdateOptions{})
		if err != nil {
			return nil, err
		}

		logrus.Info("successfully updated for kind: ", response.GetKind(), ", resource name: ", response.GetName(), ", and namespace: ", response.GetNamespace())
		return response, nil
	} else if requestType == "delete" {
		err := dr.Delete(ctx, obj.GetName(), metav1.DeleteOptions{})
		if k8s_errors.IsNotFound(err) {
			// This doesn't ever happen even if it is already deleted or not found
			logrus.Info("%v not found", obj.GetName())
			return nil, nil
		}

		if err != nil {
			return nil, err
		}

		logrus.Info("successfully deleted for kind: ", obj.GetKind(), ", resource name: ", obj.GetName(), ", and namespace: ", obj.GetNamespace())
		return &unstructured.Unstructured{}, nil
	} else if requestType == "get" {
		response, err := dr.Get(ctx, obj.GetName(), metav1.GetOptions{})
		if k8s_errors.IsNotFound(err) {
			// This doesn't ever happen even if it is already deleted or not found
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

func addCustomLabels(obj *unstructured.Unstructured, customLabels map[string]string) {
	newLabels := obj.GetLabels()

	if len(newLabels) == 0 {
		newLabels = make(map[string]string)
	}

	for label, value := range customLabels {
		newLabels[label] = value
	}

	obj.SetLabels(newLabels)
}

// ClusterOperations handles cluster operations
func ClusterOperations(clusterAction types.Action) (*unstructured.Unstructured, error) {

	// Converting JSON to YAML and store it in yamlStr variable
	yamlStr, err := yaml_converter.JSONToYAML([]byte(clusterAction.K8SManifest))
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

	addCustomLabels(obj, map[string]string{"executed_by": clusterAction.Username})

	// Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		return nil, err
	}

	// Obtain REST interface for the GVR
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = dynamicClient.Resource(mapping.Resource).Namespace(clusterAction.Namespace)
	} else {
		// for cluster-wide resources
		dr = dynamicClient.Resource(mapping.Resource)
	}

	return applyRequest(clusterAction.RequestType, obj)
}

func ClusterConfirm(clusterData map[string]string) ([]byte, error) {
	payload := `{"query":"mutation{ confirmClusterRegistration(request: {clusterID: \"` + clusterData["CLUSTER_ID"] + `\", version: \"` + clusterData["VERSION"] + `\", accessKey: \"` + clusterData["ACCESS_KEY"] + `\"}){isClusterConfirmed newAccessKey clusterID}}"}`
	resp, err := graphql.SendRequest(clusterData["SERVER_ADDR"], []byte(payload))
	if err != nil {
		return nil, err
	}
	return []byte(resp), nil
}
