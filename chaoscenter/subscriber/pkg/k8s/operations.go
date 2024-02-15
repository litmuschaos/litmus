package k8s

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"k8s.io/apimachinery/pkg/labels"

	pkgTypes "subscriber/pkg/types"

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
	InfraConfigName   = "subscriber-config"
	InfraSecretName   = "subscriber-secret"
	LiveCheckMaxTries = 6
)

type InfraComponents struct {
	Deployments      []string `yaml:"DEPLOYMENTS"`
	LiveStatus       bool
	AccessLiveStatus sync.Mutex
}

var (
	Ctx             = context.Background()
	decUnstructured = yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
	dr              dynamic.ResourceInterface
)

func (k8s *k8sSubscriber) CheckComponentStatus(componentEnv string) error {
	if componentEnv == "" {
		return errors.New("components not found in infra config")
	}

	clientset, err := k8s.GetGenericK8sClient()
	if err != nil {
		return err
	}

	var components InfraComponents

	err = yaml2.Unmarshal([]byte(strings.TrimSpace(componentEnv)), &components)
	if err != nil {
		return err
	}

	components.LiveStatus = true
	components.AccessLiveStatus = sync.Mutex{}

	wait := sync.WaitGroup{}

	// add all agent components to waitgroup
	wait.Add(1)
	go k8s.checkDeploymentStatus(&components, clientset, &wait)

	wait.Wait()
	if !components.LiveStatus {
		return errors.New("all components failed to startup")
	}
	return nil
}

func (k8s *k8sSubscriber) checkDeploymentStatus(components *InfraComponents, clientset *kubernetes.Clientset, wait *sync.WaitGroup) {
	ctx := context.TODO()
	downCount := 0
	retries := 0
	defer wait.Done()
	for retries < LiveCheckMaxTries {
		for _, dep := range components.Deployments {
			podList, err := clientset.CoreV1().Pods(InfraNamespace).List(ctx, metav1.ListOptions{LabelSelector: dep})
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
			logrus.Info("All infra deployments are up")
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

func (k8s *k8sSubscriber) IsAgentConfirmed() (bool, string, error) {
	clientset, err := k8s.GetGenericK8sClient()
	if err != nil {
		return false, "", err
	}

	getCM, err := clientset.CoreV1().ConfigMaps(InfraNamespace).Get(context.TODO(), InfraConfigName, metav1.GetOptions{})
	if k8s_errors.IsNotFound(err) {
		return false, "", errors.New(InfraConfigName + " configmap not found")
	} else if getCM.Data["IS_INFRA_CONFIRMED"] == "true" {
		getSecret, err := clientset.CoreV1().Secrets(InfraNamespace).Get(context.TODO(), InfraSecretName, metav1.GetOptions{})
		if err != nil {
			return false, "", errors.New(InfraSecretName + " secret not found")
		}

		if k8s_errors.IsNotFound(err) {
			return false, "", err
		}

		return true, string(getSecret.Data["ACCESS_KEY"]), nil
	} else if err != nil {
		return false, "", err
	}

	return false, "", nil
}

// AgentRegister function creates litmus-portal config map in the litmus namespace
func (k8s *k8sSubscriber) AgentRegister(accessKey string) (bool, error) {
	clientset, err := k8s.GetGenericK8sClient()
	if err != nil {
		return false, err
	}

	getCM, err := clientset.CoreV1().ConfigMaps(InfraNamespace).Get(context.TODO(), InfraConfigName, metav1.GetOptions{})
	if err != nil {
		return false, err
	}
	getSecret, err := clientset.CoreV1().Secrets(InfraNamespace).Get(context.TODO(), InfraSecretName, metav1.GetOptions{})
	if err != nil {
		return false, err
	}

	getCM.Data["IS_INFRA_CONFIRMED"] = "true"

	// Update the ConfigMap.
	_, err = clientset.CoreV1().ConfigMaps(InfraNamespace).Update(
		context.TODO(),
		getCM,
		metav1.UpdateOptions{},
	)
	if err != nil {
		return false, err
	}

	logrus.Infof("%s has been updated", InfraConfigName)

	getSecret.StringData = make(map[string]string)
	getSecret.StringData["ACCESS_KEY"] = accessKey

	if err != nil {
		return false, err
	}
	_, err = clientset.CoreV1().Secrets(InfraNamespace).Update(
		context.TODO(),
		getSecret,
		metav1.UpdateOptions{},
	)
	if err != nil {
		return false, err
	}

	logrus.Infof("%s has been updated", InfraSecretName)

	return true, nil
}

func applyRequest(requestType string, obj *unstructured.Unstructured) (*unstructured.Unstructured, error) {
	ctx := context.TODO()

	logrus.Info("Applying request for kind: ", obj.GetKind(), ", resource name: ", obj.GetName(), ", and namespace: ", obj.GetNamespace())
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
			// This doesnt ever happen even if it is already deleted or not found

			logrus.Info("%v not found ", obj.GetName())
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
		var err error
		if obj.GetName() != "" {
			err = dr.Delete(ctx, obj.GetName(), metav1.DeleteOptions{})
			if k8s_errors.IsNotFound(err) {
				fmt.Println(obj)
				// This doesnt ever happen even if it is already deleted or not found
				logrus.Info("%v not found ", obj.GetName())
				return nil, nil
			}
			logrus.Info("successfully deleted for kind: ", obj.GetKind(), ", resource name: ", obj.GetName(), ", and namespace: ", obj.GetNamespace())
		} else if obj.GetLabels() != nil {
			objLabels := obj.GetLabels()
			delete(objLabels, "updated_by")
			err = dr.DeleteCollection(ctx, metav1.DeleteOptions{}, metav1.ListOptions{LabelSelector: labels.FormatLabels(objLabels)})
			if k8s_errors.IsNotFound(err) {

				// This doesnt ever happen even if it is already deleted or not found
				logrus.Info("%v not found ", obj.GetName())
				return nil, nil
			}
			logrus.Info("successfully deleted for kind: ", obj.GetKind(), ", resource labels: ", objLabels, ", and namespace: ", obj.GetNamespace())
		}

		if err != nil {
			return nil, err
		}

		logrus.Info("successfully deleted for kind: ", obj.GetKind(), ", resource name: ", obj.GetName(), ", and namespace: ", obj.GetNamespace())
		return &unstructured.Unstructured{}, nil
	} else if requestType == "get" {
		response, err := dr.Get(ctx, obj.GetName(), metav1.GetOptions{})
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

// AgentOperations This function handles agent operations
func (k8s *k8sSubscriber) AgentOperations(infraAction pkgTypes.Action) (*unstructured.Unstructured, error) {
	// Converting JSON to YAML and store it in yamlStr variable
	yamlStr, err := yaml_converter.JSONToYAML([]byte(infraAction.K8SManifest))
	if err != nil {
		return nil, err
	}

	// Getting dynamic and discovery client
	discoveryClient, dynamicClient, err := k8s.GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}

	// Create a mapper using dynamic client
	mapper := restmapper.NewDeferredDiscoveryRESTMapper(memory.NewMemCacheClient(discoveryClient))

	// Decode YAML manifest into unstructured.Unstructured
	obj := &unstructured.Unstructured{}
	_, gvk, err := decUnstructured.Decode(yamlStr, nil, obj)
	if err != nil {
		return nil, err
	}

	if infraAction.RequestType != "delete" {
		addCustomLabels(obj, map[string]string{"updated_by": base64.RawURLEncoding.EncodeToString([]byte(infraAction.Username))})
	}

	// Find GVR
	mapping, err := mapper.RESTMapping(gvk.GroupKind(), gvk.Version)
	if err != nil {
		return nil, err
	}
	// Obtain REST interface for the GVR
	if mapping.Scope.Name() == meta.RESTScopeNameNamespace {
		// namespaced resources should specify the namespace
		dr = dynamicClient.Resource(mapping.Resource).Namespace(infraAction.Namespace)
	} else {
		// for agent-wide resources
		dr = dynamicClient.Resource(mapping.Resource)
	}

	return applyRequest(infraAction.RequestType, obj)
}

func (k8s *k8sSubscriber) AgentConfirm(infraData map[string]string) ([]byte, error) {
	payload := `{"query":"mutation{ confirmInfraRegistration(request: {infraID: \"` + infraData["INFRA_ID"] + `\", version: \"` + infraData["VERSION"] + `\", accessKey: \"` + infraData["ACCESS_KEY"] + `\"}){isInfraConfirmed newAccessKey infraID}}"}`
	resp, err := k8s.gqlSubscriberServer.SendRequest(infraData["SERVER_ADDR"], []byte(payload))
	if err != nil {
		return nil, err
	}
	return []byte(resp), nil
}
