package k8s

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/workloads"
	"github.com/sirupsen/logrus"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
)

var (
	AgentNamespace = os.Getenv("AGENT_NAMESPACE")
	AgentScope     = os.Getenv("AGENT_SCOPE")
)

//GetKubernetesObjects is used to get the Kubernetes Object details according to the request type
func GetKubernetesObjects(request types.KubeObjRequest) ([]*types.KubeObject, error) {
	conf, err := GetKubeConfig()
	if err != nil {
		return nil, err
	}
	clientSet, err := kubernetes.NewForConfig(conf)
	if err != nil {
		return nil, err
	}

	_, dynamicClient, err := GetDynamicAndDiscoveryClient()
	if err != nil {
		return nil, err
	}

	var ObjData []*types.KubeObject

	if len(request.Workloads) != 0 {
		ObjData, err = getPodsFromWorkloads(request.Workloads, clientSet, dynamicClient)
		if err != nil {
			return nil, err
		}
	} else {
		var gvrList []schema.GroupVersionResource

		for _, req := range request.KubeGVRRequest {
			resourceType := schema.GroupVersionResource{
				Group:    req.Group,
				Version:  req.Version,
				Resource: req.Resource,
			}
			gvrList = append(gvrList, resourceType)
		}

		if strings.ToLower(AgentScope) == "namespace" {
			dataList, err := GetObjectDataByNamespace(AgentNamespace, dynamicClient, gvrList)
			if err != nil {
				return nil, err
			}
			KubeObj := &types.KubeObject{
				Namespace: AgentNamespace,
				Data:      dataList,
			}
			ObjData = append(ObjData, KubeObj)
		} else {
			namespace, err := clientSet.CoreV1().Namespaces().List(context.TODO(), v1.ListOptions{})
			if err != nil {
				return nil, err
			}

			if len(namespace.Items) > 0 {
				for _, namespace := range namespace.Items {
					dataList, err := GetObjectDataByNamespace(namespace.GetName(), dynamicClient, gvrList)
					if err != nil {
						return nil, err
					}
					KubeObj := &types.KubeObject{
						Namespace: namespace.GetName(),
						Data:      dataList,
					}
					ObjData = append(ObjData, KubeObj)
				}
			} else {
				return nil, errors.New("no namespace available")
			}

		}
	}
	kubeData, _ := json.Marshal(ObjData)
	var kubeObjects []*types.KubeObject
	err = json.Unmarshal(kubeData, &kubeObjects)
	if err != nil {
		return nil, err
	}
	return kubeObjects, nil
}

func getPodsFromWorkloads(resources []types.Workload, k8sClient *kubernetes.Clientset, dynamicClient dynamic.Interface) ([]*types.KubeObject, error) {
	var ObjData []*types.KubeObject
	podNsMap, err := workloads.GetPodsFromWorkloads(resources, k8sClient, dynamicClient)
	if err != nil {
		return nil, err
	}
	for ns, podList := range podNsMap {
		var data []types.ObjectData
		for _, pod := range podList {
			data = append(data, types.ObjectData{
				Name: pod,
				Kind: "Pod",
			})
		}
		ObjData = append(ObjData, &types.KubeObject{
			Namespace: ns,
			Data:      data,
		})
	}

	return ObjData, nil
}

//GetObjectDataByNamespace uses dynamic client to fetch Kubernetes Objects data.
func GetObjectDataByNamespace(namespace string, dynamicClient dynamic.Interface, gvrList []schema.GroupVersionResource) ([]types.ObjectData, error) {
	var kubeObjects []types.ObjectData
	for _, gvr := range gvrList {
		list, err := dynamicClient.Resource(gvr).Namespace(namespace).List(context.TODO(), v1.ListOptions{})
		if err != nil {
			return kubeObjects, nil
		}
		for _, list := range list.Items {
			listInfo := types.ObjectData{
				Name:   list.GetName(),
				Kind:   list.GetKind(),
				Labels: list.GetLabels(),
			}
			kubeObjects = append(kubeObjects, listInfo)
		}
	}
	return kubeObjects, nil
}

func GenerateKubeObject(cid string, accessKey, version string, kubeObjectRequest types.KubeObjRequest) ([]byte, error) {
	clusterID := `{clusterID: \"` + cid + `\", version: \"` + version + `\", accessKey: \"` + accessKey + `\"}`
	kubeObj, err := GetKubernetesObjects(kubeObjectRequest)
	if err != nil {
		return nil, err
	}
	processed, err := graphql.MarshalGQLData(kubeObj)
	if err != nil {
		return nil, err
	}
	mutation := `{ clusterID: ` + clusterID + `, requestID:\"` + kubeObjectRequest.RequestID + `\", kubeObj:\"` + processed[1:len(processed)-1] + `\"}`

	var payload = []byte(`{"query":"mutation { kubeObj(request:` + mutation + ` )}"}`)
	return payload, nil
}

//SendKubeObjects generates graphql mutation to send kubernetes objects data to graphql server
func SendKubeObjects(clusterData map[string]string, kubeObjectRequest types.KubeObjRequest) error {
	// generate graphql payload
	payload, err := GenerateKubeObject(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], clusterData["VERSION"], kubeObjectRequest)
	if err != nil {
		logrus.WithError(err).Print("Error while getting KubeObject Data")

		clusterID := `{clusterID: \"` + clusterData["CLUSTER_ID"] + `\", version: \"` + clusterData["VERSION"] + `\", accessKey: \"` + clusterData["ACCESS_KEY"] + `\"}`
		mutation := `{ clusterID: ` + clusterID + `, requestID:\"` + kubeObjectRequest.RequestID + `\", kubeObj:\"` + "failed to get kubeobjects" + `\"}`
		var payload = []byte(`{"query":"mutation { kubeObj(request:` + mutation + ` )}"}`)
		body, reqErr := graphql.SendRequest(clusterData["SERVER_ADDR"], payload)
		if reqErr != nil {
			logrus.Print(reqErr.Error())
			return reqErr
		}

		logrus.Println("Response", body)
		return err
	}

	body, err := graphql.SendRequest(clusterData["SERVER_ADDR"], payload)
	if err != nil {
		logrus.Print(err.Error())
		return err
	}

	logrus.Println("Response", body)
	return nil
}
