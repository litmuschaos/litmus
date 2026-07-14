package k8s

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/sirupsen/logrus"

	"subscriber/pkg/types"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
)

var (
	InfraNamespace = os.Getenv("INFRA_NAMESPACE")
	InfraScope     = os.Getenv("INFRA_SCOPE")
)

// GetKubernetesNamespaces is used to get the list of Kubernetes Namespaces
func (k8s *k8sSubscriber) GetKubernetesNamespaces(request types.KubeNamespaceRequest) ([]*types.KubeNamespace, error) {

	var namespaceData []*types.KubeNamespace

	if strings.ToLower(InfraScope) == "namespace" {
		// In case of namespace scope, only one namespace is available
		KubeNamespace := &types.KubeNamespace{
			Name: InfraNamespace,
		}
		namespaceData = append(namespaceData, KubeNamespace)
	} else {
		// In case of cluster scope, get all the namespaces
		conf, err := k8s.GetKubeConfig()
		if err != nil {
			return nil, err
		}
		clientset, err := kubernetes.NewForConfig(conf)
		if err != nil {
			return nil, err
		}

		namespace, err := clientset.CoreV1().Namespaces().List(context.TODO(), metav1.ListOptions{})
		if err != nil {
			return nil, err
		}
		if len(namespace.Items) > 0 {
			for _, namespace := range namespace.Items {

				KubeNamespace := &types.KubeNamespace{
					Name: namespace.GetName(),
				}

				namespaceData = append(namespaceData, KubeNamespace)
			}
		} else {
			return nil, errors.New("No namespace available")
		}
	}
	//TODO Maybe add marshal/unmarshal here
	return namespaceData, nil
}

// GetKubernetesObjects is used to get the Kubernetes Object details according to the request type
func (k8s *k8sSubscriber) GetKubernetesObjects(request types.KubeObjRequest) (*types.KubeObject, error) {
	resourceType := schema.GroupVersionResource{
		Group:    request.KubeGVRRequest.Group,
		Version:  request.KubeGVRRequest.Version,
		Resource: request.KubeGVRRequest.Resource,
	}
	_, dynamicClient, err := k8s.GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}

	dataList, err := k8s.GetObjectDataByNamespace(request.Namespace, dynamicClient, resourceType)
	if err != nil {
		return nil, err
	}
	KubeObj := &types.KubeObject{
		Namespace: InfraNamespace,
		Data:      dataList,
	}

	kubeData, _ := json.Marshal(KubeObj)
	var kubeObjects *types.KubeObject
	err = json.Unmarshal(kubeData, &kubeObjects)
	if err != nil {
		return nil, err
	}
	return kubeObjects, nil
}

// GetObjectDataByNamespace uses dynamic client to fetch Kubernetes Objects data.
func (k8s *k8sSubscriber) GetObjectDataByNamespace(namespace string, dynamicClient dynamic.Interface, resourceType schema.GroupVersionResource) ([]types.ObjectData, error) {
	list, err := dynamicClient.Resource(resourceType).Namespace(namespace).List(context.TODO(), metav1.ListOptions{})
	var kubeObjects []types.ObjectData
	if err != nil {
		return kubeObjects, nil
	}
	for _, list := range list.Items {
		listInfo := types.ObjectData{
			Name:                    list.GetName(),
			UID:                     list.GetUID(),
			Namespace:               list.GetNamespace(),
			APIVersion:              list.GetAPIVersion(),
			CreationTimestamp:       list.GetCreationTimestamp(),
			TerminationGracePeriods: list.GetDeletionGracePeriodSeconds(),
			Labels:                  k8s.updateLabels(list.GetLabels()),
		}
		kubeObjects = append(kubeObjects, listInfo)
	}
	return kubeObjects, nil
}

func (k8s *k8sSubscriber) updateLabels(labels map[string]string) []string {
	var updatedLabels []string

	for k, v := range labels {
		updatedLabels = append(updatedLabels, fmt.Sprintf("%s=%s", k, v))
	}
	return updatedLabels
}

func (k8s *k8sSubscriber) GenerateKubeNamespace(cid string, accessKey, version string, kubenamespacerequest types.KubeNamespaceRequest) ([]byte, error) {
	infraID := `{infraID: \"` + cid + `\", version: \"` + version + `\", accessKey: \"` + accessKey + `\"}`
	kubeObj, err := k8s.GetKubernetesNamespaces(kubenamespacerequest)
	if err != nil {
		return nil, err
	}
	processed, err := k8s.gqlSubscriberServer.MarshalGQLData(kubeObj)
	if err != nil {
		return nil, err
	}
	mutation := `{ infraID: ` + infraID + `, requestID:\"` + kubenamespacerequest.RequestID + `\", kubeNamespace:\"` + processed[1:len(processed)-1] + `\"}`

	var payload = []byte(`{"query":"mutation { kubeNamespace(request:` + mutation + ` )}"}`)
	return payload, nil
}

func (k8s *k8sSubscriber) GenerateKubeObject(cid string, accessKey, version string, kubeobjectrequest types.KubeObjRequest) ([]byte, error) {
	infraID := `{infraID: \"` + cid + `\", version: \"` + version + `\", accessKey: \"` + accessKey + `\"}`
	kubeObj, err := k8s.GetKubernetesObjects(kubeobjectrequest)
	if err != nil {
		return nil, err
	}
	processed, err := k8s.gqlSubscriberServer.MarshalGQLData(kubeObj)
	if err != nil {
		return nil, err
	}
	mutation := `{ infraID: ` + infraID + `, requestID:\"` + kubeobjectrequest.RequestID + `\", kubeObj:\"` + processed[1:len(processed)-1] + `\"}`

	var payload = []byte(`{"query":"mutation { kubeObj(request:` + mutation + ` )}"}`)
	return payload, nil
}

// SendKubeNamespace generates graphql mutation to send kubernetes namespaces data to graphql server
func (k8s *k8sSubscriber) SendKubeNamespaces(infraData map[string]string, kubenamespacerequest types.KubeNamespaceRequest) error {
	// generate graphql payload
	payload, err := k8s.GenerateKubeNamespace(infraData["INFRA_ID"], infraData["ACCESS_KEY"], infraData["VERSION"], kubenamespacerequest)
	if err != nil {
		logrus.WithError(err).Print("Error while getting KubeObject Data")
		return err
	}

	body, err := k8s.gqlSubscriberServer.SendRequest(infraData["SERVER_ADDR"], payload)
	if err != nil {
		logrus.Print(err.Error())
		return err
	}

	logrus.Println("Response", body)
	return nil
}

// SendKubeObjects generates graphql mutation to send kubernetes objects data to graphql server
func (k8s *k8sSubscriber) SendKubeObjects(infraData map[string]string, kubeobjectrequest types.KubeObjRequest) error {
	// generate graphql payload
	payload, err := k8s.GenerateKubeObject(infraData["INFRA_ID"], infraData["ACCESS_KEY"], infraData["VERSION"], kubeobjectrequest)
	if err != nil {
		logrus.WithError(err).Print("Error while getting KubeObject Data")
		return err
	}

	body, err := k8s.gqlSubscriberServer.SendRequest(infraData["SERVER_ADDR"], payload)
	if err != nil {
		logrus.Print(err.Error())
		return err
	}

	logrus.Println("Response", body)
	return nil
}
