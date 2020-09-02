package events

import (
	"strconv"

	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	v1alpha13 "github.com/argoproj/argo/pkg/apis/workflow/v1alpha1"
	v1alpha12 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/types"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
)

// util function, extracts the chaos data using the litmus go-client
func getChaosData(engineName, engineNS string, chaosClient *v1alpha12.LitmuschaosV1alpha1Client) (*types.ChaosData, error) {
	cd := &types.ChaosData{}
	cd.EngineName = engineName
	cd.Namespace = engineNS
	crd, err := chaosClient.ChaosEngines(cd.Namespace).Get(cd.EngineName, v1.GetOptions{})
	if err != nil {
		return nil, err
	}
	// considering chaos engine has only 1 experiment
	if len(crd.Status.Experiments) == 1 {
		expRes, err := chaosClient.ChaosResults(cd.Namespace).Get(crd.Name+"-"+crd.Status.Experiments[0].Name, v1.GetOptions{})
		if err != nil {
			return nil, err
		}
		cd.ProbeSuccessPercentage = expRes.Status.ExperimentStatus.ProbeSuccessPercentage
		cd.FailStep = expRes.Status.ExperimentStatus.FailStep
		cd.ExperimentPod = crd.Status.Experiments[0].ExpPod
		cd.RunnerPod = crd.Status.Experiments[0].Runner
		cd.EngineUID = string(crd.ObjectMeta.UID)
		cd.ExperimentStatus = string(crd.Status.Experiments[0].Status)
		cd.ExperimentName = crd.Status.Experiments[0].Name
		cd.LastUpdatedAt = strconv.FormatInt(crd.Status.Experiments[0].LastUpdateTime.Unix(), 10)
		cd.ExperimentVerdict = crd.Status.Experiments[0].Verdict
	} else {
		cd = nil
	}
	return cd, nil
}

// util function, checks if event is a chaos-exp event, if so -  extract the chaos data
func CheckChaosData(nodeStatus v1alpha13.NodeStatus, chaosClient *v1alpha12.LitmuschaosV1alpha1Client) (string, *types.ChaosData, error) {
	nodeType := string(nodeStatus.Type)
	var cd *types.ChaosData = nil
	// considering chaos workflow has only 1 artifact with manifest as raw data
	data := nodeStatus.Inputs.Artifacts[0].Raw.Data
	obj := &unstructured.Unstructured{}
	decUnstructured := yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
	_, _, err := decUnstructured.Decode([]byte(data), nil, obj)
	if err == nil && obj.GetKind() == "ChaosEngine" {
		nodeType = "ChaosEngine"
		if nodeStatus.Phase != "Pending" {
			cd, err = getChaosData(obj.GetName(), obj.GetNamespace(), chaosClient)
			if err != nil {
				return nodeType, nil, err
			}
			return nodeType, cd, nil
		}
	}
	return nodeType, nil, nil
}

// converts unix timestamp to string
func StrConvTime(time int64) string {
	if time < 0 {
		return ""
	} else {
		return strconv.FormatInt(time, 10)
	}
}
