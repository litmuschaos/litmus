package events

import (
	"errors"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/cluster/logs"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	v1alpha13 "github.com/argoproj/argo/pkg/apis/workflow/v1alpha1"
	v1alpha12 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
)

// 0 means no resync
const (
	resyncPeriod time.Duration = 0
)

var (
	AgentScope     = os.Getenv("AGENT_SCOPE")
	AgentNamespace = os.Getenv("AGENT_NAMESPACE")
	ClusterID      = os.Getenv("CLUSTER_ID")
)

// GetChaosData is a util function, extracts the chaos data using the litmus go-client
func GetChaosData(nodeStatus v1alpha13.NodeStatus, engineName, engineNS string, chaosClient *v1alpha12.LitmuschaosV1alpha1Client) (*types.ChaosData, error) {
	cd := &types.ChaosData{}
	cd.EngineName = engineName
	cd.Namespace = engineNS
	crd, err := chaosClient.ChaosEngines(cd.Namespace).Get(cd.EngineName, v1.GetOptions{})
	if err != nil {
		return nil, err
	}
	if nodeStatus.StartedAt.Unix() > crd.ObjectMeta.CreationTimestamp.Unix() {
		return nil, errors.New("chaosenginge resource older than current workflow node")
	}
	cd.ProbeSuccessPercentage = "0"
	cd.FailStep = ""
	cd.EngineUID = string(crd.ObjectMeta.UID)
	if len(crd.Status.Experiments) == 0 {
		return cd, nil
	}
	// considering chaosengine will only have 1 experiment
	cd.ExperimentPod = crd.Status.Experiments[0].ExpPod
	cd.RunnerPod = crd.Status.Experiments[0].Runner
	cd.ExperimentStatus = string(crd.Status.Experiments[0].Status)
	cd.ExperimentName = crd.Status.Experiments[0].Name
	cd.LastUpdatedAt = strconv.FormatInt(crd.Status.Experiments[0].LastUpdateTime.Unix(), 10)
	cd.ExperimentVerdict = crd.Status.Experiments[0].Verdict
	if strings.ToLower(string(crd.Status.EngineStatus)) == "stopped" || (strings.ToLower(string(crd.Status.EngineStatus)) == "completed" && strings.ToLower(cd.ExperimentVerdict) != "pass") {
		cd.ExperimentVerdict = "Fail"
		cd.ExperimentStatus = "Stopped"
	}
	if len(crd.Status.Experiments) == 1 {
		expRes, err := chaosClient.ChaosResults(cd.Namespace).Get(crd.Name+"-"+crd.Status.Experiments[0].Name, v1.GetOptions{})
		if err != nil {
			return cd, err
		}
		// annotations sometimes cause failure in gql message escaping
		expRes.Annotations = nil
		cd.ChaosResult = expRes
		cd.ProbeSuccessPercentage = expRes.Status.ExperimentStatus.ProbeSuccessPercentage
		cd.FailStep = expRes.Status.ExperimentStatus.FailStep
	}
	return cd, nil
}

// CheckChaosData is a util function, checks if event is a chaos-exp event, if so -  extract the chaos data
func CheckChaosData(nodeStatus v1alpha13.NodeStatus, workflowNS string, chaosClient *v1alpha12.LitmuschaosV1alpha1Client) (string, *types.ChaosData, error) {
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
			name := obj.GetName()
			if obj.GetGenerateName() != "" {
				log, err := logs.GetLogs(nodeStatus.ID, workflowNS, "main")
				if err != nil {
					return nodeType, nil, err
				}
				name = getNameFromLog(log)
				if name == "" {
					return nodeType, nil, errors.New("Chaos-Engine Generated Name couldn't be retrieved")
				}
			}
			cd, err = GetChaosData(nodeStatus, name, obj.GetNamespace(), chaosClient)
			return nodeType, cd, err
		}
	}
	return nodeType, nil, nil
}

func getNameFromLog(log string) string {
	s := regexp.MustCompile(`\n\nChaosEngine Name : .*\n\n`).FindString(log)
	if s == "" {
		return ""
	}
	s = strings.TrimSpace(s)
	name := strings.Split(s, ": ")
	if len(name) != 2 {
		return ""
	}
	return name[1]
}

// converts unix timestamp to string
func StrConvTime(time int64) string {
	if time < 0 {
		return ""
	} else {
		return strconv.FormatInt(time, 10)
	}
}
