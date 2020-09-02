package gql

import (
	"bytes"
	"io/ioutil"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
)

var eventMap map[string]types.WorkflowEvent

func init() {
	eventMap = make(map[string]types.WorkflowEvent)
}

func CommonHeaders(req *http.Request) {
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Dnt", "1")
}

func sendMutation(server string, payload []byte) (string, error) {
	req, err := http.NewRequest("POST", server, bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	body, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		return "", err
	}
	return string(body), nil
}

func ClusterConfirm(clusterData map[string]string) ([]byte, error) {
	payload := `{"query":"mutation{ clusterConfirm(identity: {cluster_id: \"` + clusterData["CID"] + `\", access_key: \"` + clusterData["KEY"] + `\"}){isClusterConfirmed newClusterKey cluster_id}}"}`
	resp, err := sendMutation(clusterData["GQL_SERVER"], []byte(payload))
	if err != nil {
		return nil, err
	}
	return []byte(resp), nil
}

//SendWorkflowUpdates generates gql mutation to send workflow updates to gql server
func SendWorkflowUpdates(clusterData map[string]string, event chan types.WorkflowEvent) {
	// listen on the channel for streaming event updates
	for eventData := range event {
		if wfEvent, ok := eventMap[eventData.UID]; ok {
			for key, node := range wfEvent.Nodes {
				if node.Type == "ChaosEngine" && node.ChaosExp != nil && eventData.Nodes[key].ChaosExp == nil {
					nodeData := eventData.Nodes[key]
					nodeData.ChaosExp = node.ChaosExp
					eventData.Nodes[key] = nodeData
				}
			}
		}
		eventMap[eventData.UID] = eventData

		// generate gql payload
		payload, err := GenerateWorkflowPayload(clusterData["CID"], clusterData["KEY"], eventData)
		if err != nil {
			logrus.WithError(err).Print("ERROR PARSING WORKFLOW EVENT")
		}

		body, err := sendMutation(clusterData["GQL_SERVER"], payload)
		if err != nil {
			logrus.Print(err.Error())
		}
		logrus.Print("RESPONSE ", body)

		if eventData.FinishedAt != "" {
			delete(eventMap, eventData.UID)
		}
	}
}

//SendPodLogs generates gql mutation to send workflow updates to gql server
func SendPodLogs(clusterData map[string]string, podLog types.PodLogRequest) {
	// generate gql payload
	payload, err := GenerateLogPayload(clusterData["CID"], clusterData["KEY"], podLog)
	if err != nil {
		logrus.WithError(err).Print("ERROR GETTING WORKFLOW LOG")
	}
	body, err := sendMutation(clusterData["GQL_SERVER"], payload)
	if err != nil {
		logrus.Print(err.Error())
	}
	logrus.Print("RESPONSE ", body)
}
