package gql

import (
	"encoding/json"
	"strconv"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/backend/workflow-agent/pkg/cluster/logs"
	"github.com/litmuschaos/litmus/litmus-portal/backend/workflow-agent/pkg/types"
)

// process event data into proper format acceptable by gql
func MarshalGQLData(gqlData interface{}) (string, error) {
	data, err := json.Marshal(gqlData)
	if err != nil {
		return "", err
	}
	// process the marshalled data to make it gql compatible
	processed := strconv.Quote(string(data))
	processed = strings.Replace(processed, `\"`, `\\\"`, -1)
	return processed, nil
}

// generate gql mutation payload for workflow event
func GenerateWorkflowPayload(cid, accessKey string, wfEvent types.WorkflowEvent) ([]byte, error) {
	clusterID := `{cluster_id: \"` + cid + `\", access_key: \"` + accessKey + `\"}`
	// process event data
	processed, err := MarshalGQLData(wfEvent)
	if err != nil {
		return nil, err
	}
	mutation := `{ workflow_run_id: \"` + wfEvent.UID + `\", workflow_name:\"` + wfEvent.Name + `\", cluster_id: ` + clusterID + `, execution_data:\"` + processed[1:len(processed)-1] + `\"}`
	var payload = []byte(`{"query":"mutation { chaosWorkflowRun(workflowData:` + mutation + ` )}"}`)
	return payload, nil
}

// create pod log for normal pods and chaos-engine pods
func CreatePodLog(podLog types.PodLogRequest) (types.PodLog, error) {
	logDetails := types.PodLog{}
	mainLog, err := logs.GetLogs(podLog.PodName, podLog.PodNamespace, "main")
	if err != nil {
		return logDetails, err
	}
	logDetails.MainPod = strconv.Quote(strings.Replace(mainLog, `"`, `'`, -1))
	logDetails.MainPod = logDetails.MainPod[1 : len(logDetails.MainPod)-1]
	if strings.ToLower(podLog.PodType) == "chaosengine" && podLog.ChaosNamespace != nil {
		chaosLog := make(map[string]string)
		if podLog.ExpPod != nil {
			expLog, err := logs.GetLogs(*podLog.ExpPod, *podLog.ChaosNamespace, "")
			if err == nil {
				chaosLog[*podLog.ExpPod] = strconv.Quote(strings.Replace(expLog, `"`, `'`, -1))
				chaosLog[*podLog.ExpPod] = chaosLog[*podLog.ExpPod][1 : len(chaosLog[*podLog.ExpPod])-1]
			}
		}
		if podLog.RunnerPod != nil {
			runnerLog, err := logs.GetLogs(*podLog.RunnerPod, *podLog.ChaosNamespace, "")
			if err == nil {
				chaosLog[*podLog.RunnerPod] = strconv.Quote(strings.Replace(runnerLog, `"`, `'`, -1))
				chaosLog[*podLog.RunnerPod] = chaosLog[*podLog.RunnerPod][1 : len(chaosLog[*podLog.RunnerPod])-1]
			}
		}
		if podLog.ExpPod == nil && podLog.RunnerPod == nil {
			logDetails.ChaosPod = nil
		} else {
			logDetails.ChaosPod = chaosLog
		}
	}
	return logDetails, nil
}

func GenerateLogPayload(cid, accessKey string, podLog types.PodLogRequest) ([]byte, error) {
	clusterID := `{cluster_id: \"` + cid + `\", access_key: \"` + accessKey + `\"}`
	processed := " Could not get logs "
	// get the logs
	logDetails, err := CreatePodLog(podLog)
	if err == nil {
		// process log data
		processed, err = MarshalGQLData(logDetails)
		if err != nil {
			processed = " Could not get logs "
		}
	}
	mutation := `{ cluster_id: ` + clusterID + `, request_id:\"` + podLog.RequestID + `\", workflow_run_id: \"` + podLog.WorkflowRunID + `\", pod_name: \"` + podLog.PodName + `\", pod_type: \"` + podLog.PodType + `\", log:\"` + processed[1:len(processed)-1] + `\"}`
	var payload = []byte(`{"query":"mutation { podLog(log:` + mutation + ` )}"}`)

	return payload, nil
}
