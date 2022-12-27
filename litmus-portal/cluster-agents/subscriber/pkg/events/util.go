package events

import (
	"context"
	"encoding/base64"
	"errors"
	"regexp"
	"strconv"
	"strings"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	v1alpha13 "github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	wfclientset "github.com/argoproj/argo-workflows/v3/pkg/client/clientset/versioned"
	v1alpha12 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/serializer/yaml"
)

// util function, extracts the chaos data using the litmus go-client
func getChaosData(nodeStatus v1alpha13.NodeStatus, engineName, engineNS string, chaosClient *v1alpha12.LitmuschaosV1alpha1Client) (*types.ChaosData, error) {
	cd := &types.ChaosData{}
	cd.EngineName = engineName
	cd.Namespace = engineNS
	crd, err := chaosClient.ChaosEngines(cd.Namespace).Get(context.Background(), cd.EngineName, v1.GetOptions{})
	if err != nil {
		return nil, err
	}
	if nodeStatus.StartedAt.Unix() > crd.ObjectMeta.CreationTimestamp.Unix() {
		logrus.Errorf("chaosengine resource older than current events node | workflow time : %v | engine time : %v", nodeStatus.StartedAt.Unix(), crd.ObjectMeta.CreationTimestamp.Unix())
		return nil, nil
	}
	cd.ProbeSuccessPercentage = "0"
	cd.FailStep = ""
	cd.EngineUID = string(crd.ObjectMeta.UID)
	cd.EngineContext = string(crd.Labels["context"])

	if strings.ToLower(string(crd.Status.EngineStatus)) == "stopped" {
		cd.ExperimentVerdict = "Fail"
		cd.ExperimentStatus = string(crd.Status.EngineStatus)
	}
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
		cd.ExperimentStatus = string(crd.Status.EngineStatus)
	}
	if len(crd.Status.Experiments) == 1 {
		expRes, err := chaosClient.ChaosResults(cd.Namespace).Get(context.Background(), crd.Name+"-"+crd.Status.Experiments[0].Name, v1.GetOptions{})
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

//CheckChaosData util function, checks if event is a chaos-exp event, if so -  extract the chaos data
func CheckChaosData(nodeStatus v1alpha13.NodeStatus, workflowNS string, chaosClient *v1alpha12.LitmuschaosV1alpha1Client) (string, *types.ChaosData, error) {
	nodeType := string(nodeStatus.Type)
	var cd *types.ChaosData = nil
	// considering chaos events has only 1 artifact with manifest as raw data
	data := nodeStatus.Inputs.Artifacts[0].Raw.Data
	obj := &unstructured.Unstructured{}
	decUnstructured := yaml.NewDecodingSerializer(unstructured.UnstructuredJSONScheme)
	_, _, err := decUnstructured.Decode([]byte(data), nil, obj)
	if err == nil && obj.GetKind() == "ChaosEngine" {
		nodeType = "ChaosEngine"
		if nodeStatus.Phase != "Pending" {
			name := obj.GetName()
			if obj.GetGenerateName() != "" {
				log, err := k8s.GetLogs(nodeStatus.ID, workflowNS, "main")
				if err != nil {
					return nodeType, nil, err
				}
				name = getNameFromLog(log)
				if name == "" {
					return nodeType, nil, errors.New("Chaos-Engine Generated Name couldn't be retrieved")
				}
			}
			cd, err = getChaosData(nodeStatus, name, obj.GetNamespace(), chaosClient)
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

//StrConvTime converts unix timestamp to string
func StrConvTime(time int64) string {
	if time < 0 {
		return ""
	} else {
		return strconv.FormatInt(time, 10)
	}
}

func GetWorkflowObj(uid string) (*v1alpha1.Workflow, error) {
	ctx := context.TODO()
	conf, err := k8s.GetKubeConfig()
	if err != nil {
		return nil, err
	}

	// create the events client
	wfClient := wfclientset.NewForConfigOrDie(conf).ArgoprojV1alpha1().Workflows(AgentNamespace)
	listWf, err := wfClient.List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	for _, wf := range listWf.Items {
		if string(wf.UID) == uid {
			return &wf, nil
		}
	}

	return nil, nil
}

//GenerateWorkflowPayload generate graphql mutation payload for events event
func GenerateWorkflowPayload(cid, accessKey, version, completed string, wfEvent types.WorkflowEvent) ([]byte, error) {
	clusterID := `{clusterID: \"` + cid + `\", version: \"` + version + `\", accessKey: \"` + accessKey + `\"}`

	for id, event := range wfEvent.Nodes {
		event.Message = strings.Replace(event.Message, `"`, ``, -1)
		wfEvent.Nodes[id] = event
	}

	wfEvent.ExecutedBy = URLDecodeBase64(wfEvent.ExecutedBy)

	processed, err := graphql.MarshalGQLData(wfEvent)
	if err != nil {
		return nil, err
	}
	mutation := `{ workflowID: \"` + wfEvent.WorkflowID + `\", workflowRunID: \"` + wfEvent.UID + `\", completed: ` + completed + `, workflowName:\"` + wfEvent.Name + `\", clusterID: ` + clusterID + `, executedBy:\"` + wfEvent.ExecutedBy + `\", executionData:\"` + processed[1:len(processed)-1] + `\"}`
	var payload = []byte(`{"query":"mutation { chaosWorkflowRun(request:` + mutation + ` )}"}`)
	return payload, nil
}

func URLDecodeBase64(encoded string) string {
	decoded, err := base64.RawURLEncoding.DecodeString(encoded)
	if err != nil {
		return encoded
	}
	return string(decoded)
}
