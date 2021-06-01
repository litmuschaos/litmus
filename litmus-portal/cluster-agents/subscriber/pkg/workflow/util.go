package workflow

import (
	"errors"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/gql"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/sirupsen/logrus"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/argoproj/argo/pkg/apis/workflow/v1alpha1"
	v1alpha13 "github.com/argoproj/argo/pkg/apis/workflow/v1alpha1"
	wfclientset "github.com/argoproj/argo/pkg/client/clientset/versioned"
	v1alpha12 "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
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
	crd, err := chaosClient.ChaosEngines(cd.Namespace).Get(cd.EngineName, v1.GetOptions{})
	if err != nil {
		return nil, err
	}
	// considering chaos engine has only 1 experiment
	if len(crd.Status.Experiments) == 1 {
		if nodeStatus.StartedAt.Unix() > crd.ObjectMeta.CreationTimestamp.Unix() {
			return nil, errors.New("chaosenginge resource older than current workflow node")
		}
		expRes, err := chaosClient.ChaosResults(cd.Namespace).Get(crd.Name+"-"+crd.Status.Experiments[0].Name, v1.GetOptions{})
		if err != nil {
			return nil, err
		}
		cd.ChaosResult = expRes
		cd.ProbeSuccessPercentage = expRes.Status.ExperimentStatus.ProbeSuccessPercentage
		cd.FailStep = expRes.Status.ExperimentStatus.FailStep
		cd.ExperimentPod = crd.Status.Experiments[0].ExpPod
		cd.RunnerPod = crd.Status.Experiments[0].Runner
		cd.EngineUID = string(crd.ObjectMeta.UID)
		cd.ExperimentStatus = string(crd.Status.Experiments[0].Status)
		cd.ExperimentName = crd.Status.Experiments[0].Name
		cd.LastUpdatedAt = strconv.FormatInt(crd.Status.Experiments[0].LastUpdateTime.Unix(), 10)
		cd.ExperimentVerdict = crd.Status.Experiments[0].Verdict
	} else if strings.ToLower(string(crd.Status.EngineStatus)) == "stopped" {
		cd.ExperimentVerdict = "Stopped"
		cd.ExperimentStatus = "Stopped"
	} else {
		cd = nil
	}
	return cd, nil
}

// util function, checks if event is a chaos-exp event, if so -  extract the chaos data
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
			if err != nil {
				return nodeType, nil, err
			}
			return nodeType, cd, nil
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

func WorkflowRequest(clusterData map[string]string, requestType string, uid string) error {
	if requestType == "workflow_delete" {
		wfOb, err := GetWorkflowObj(uid)
		if err != nil {
			return err
		}

		err = DeleteWorflow(wfOb.Name)
		if err != nil {
			return err
		}

	} else if requestType == "workflow_sync" {
		wfOb, err := GetWorkflowObj(uid)
		if err != nil {
			return err
		}

		startTime := time.Now().Unix()

		events, err := WorkflowEventHandler(wfOb, "UPDATE", startTime)
		if err != nil {
			return err
		}

		response, err := gql.SendWorkflowUpdates(clusterData, events)
		if err != nil {
			return err
		}
		logrus.Print(response)
	}
	return nil
}

func GetWorkflowObj(uid string) (*v1alpha1.Workflow, error){
	conf, err := k8s.GetKubeConfig()
	if err != nil {
		return nil, err
	}

	// create the workflow client
	wfClient := wfclientset.NewForConfigOrDie(conf).ArgoprojV1alpha1().Workflows("default")
	listWf, err := wfClient.List(metav1.ListOptions{})
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

func DeleteWorflow(wfname string) error {
	conf, err := k8s.GetKubeConfig()
	if err != nil {
		return err
	}

	// create the workflow client
	wfClient := wfclientset.NewForConfigOrDie(conf).ArgoprojV1alpha1().Workflows("default")
	return wfClient.Delete(wfname, &metav1.DeleteOptions{})
}