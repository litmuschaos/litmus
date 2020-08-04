package gql

import (
	"encoding/json"
	"github.com/gdsoumya/workflow_manager/pkg/types"
	"strconv"
	"strings"
)

// process event data into proper format acceptable by gql
func MarshalWorkflowEvent(wfEvent types.WorkflowEvent) (string, error) {
	data, err := json.Marshal(wfEvent)
	if err != nil {
		return "", err
	}
	// process the marshalled data to make it gql compatible
	processed := strconv.Quote(string(data))
	processed = strings.Replace(processed, `\"`, `\\\"`, -1)
	return processed, nil
}

// generate gql mutation payload for workflow event
func GenerateWorkflowPayload(cid, accesskey string, wfEvent types.WorkflowEvent) ([]byte, error) {
	clusterID := `{cluster_id: \"` + cid + `\", access_key: \"` + accesskey + `\"}`
	// process event data
	processed, err := MarshalWorkflowEvent(wfEvent)
	if err != nil {
		return nil, err
	}
	mutation := `{ workflow_run_id: \"` + wfEvent.UID + `\", workflow_name:\"` + wfEvent.Name + `\", cluster_id: ` + clusterID + `, execution_data:\"` + processed[1:len(processed)-1] + `\"}`
	var payload = []byte(`{"query":"mutation { chaosWorkflowRun(workflowData:` + mutation + ` )}"}`)
	return payload, nil
}
