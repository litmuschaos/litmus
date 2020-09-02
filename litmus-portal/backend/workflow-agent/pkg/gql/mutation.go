package gql

import (
	"bytes"
	"io/ioutil"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/backend/workflow-agent/pkg/types"
	"github.com/sirupsen/logrus"
)

var eventMap map[string]types.WorkflowEvent

func init() {
	eventMap = make(map[string]types.WorkflowEvent)
}

func sendMutation(server string, payload []byte) (string, error) {
	req, err := http.NewRequest("POST", server, bytes.NewBuffer(payload))
	if err != nil {
		logrus.Print(err.Error())
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

//SendWorkflowUpdates generates gql mutation to send workflow updates to gql server
func SendWorkflowUpdates(server, cid, accessKey string, event chan types.WorkflowEvent) {
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
		payload, err := GenerateWorkflowPayload(cid, accessKey, eventData)
		if err != nil {
			logrus.WithError(err).Print("ERROR PARSING WORKFLOW EVENT")
		}

		body, err := sendMutation(server, payload)
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
func SendPodLogs(server, cid, accessKey string, podLog types.PodLogRequest) {
	// generate gql payload
	payload, err := GenerateLogPayload(cid, accessKey, podLog)
	if err != nil {
		logrus.WithError(err).Print("ERROR GETTING WORKFLOW LOG")
	}
	body, err := sendMutation(server, payload)
	if err != nil {
		logrus.Print(err.Error())
	}
	logrus.Print("RESPONSE ", body)
}
