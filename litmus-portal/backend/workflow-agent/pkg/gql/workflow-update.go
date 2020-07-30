package gql

import (
	"bytes"
	"encoding/json"
	"github.com/gdsoumya/workflow_manager/pkg/types"
	"github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
)

//SendWorkflowUpdates generates gql mutation to send workflow updates to gql server
func SendWorkflowUpdates(server, cid, accesskey string, event chan types.WorkflowEvent) {
	clusterID := `{cluster_id: \"` + cid + `\", access_key: \"` + accesskey + `\"}`
	for eventData := range event {
		data, err := json.Marshal(eventData)
		if err != nil {
			logrus.WithError(err).Print("ERROR PARSING WORKFLOW EVENT")
		}
		query := strconv.Quote(string(data))
		query = strings.Replace(query, `\"`, `\\\"`, -1)
		query = `{ workflow_run_id: \"` + eventData.UID + `\", workflow_name:\"` + eventData.Name + `\", cluster_id: ` + clusterID + `, execution_data:\"` + query[1:len(query)-1] + `\"}`
		var jsonStr = []byte(`{"query":"mutation { chaosWorkflowRun(workflowData:` + query + ` )}"}`)
		req, err := http.NewRequest("POST", server, bytes.NewBuffer(jsonStr))
		if err != nil {
			logrus.Print(err.Error())
		}
		req.Header.Set("Content-Type", "application/json")
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			logrus.Print(err.Error())
		}
		body, err := ioutil.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			logrus.Print(err.Error())
		}
		logrus.Print("RESPONSE ", string(body))
	}
}
