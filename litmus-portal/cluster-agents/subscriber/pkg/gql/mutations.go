package gql

import (
	"bytes"
	"io/ioutil"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
)

var eventMap map[string]types.WorkflowEvent

func init() {
	eventMap = make(map[string]types.WorkflowEvent)
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
	payload := `{"query":"mutation{ clusterConfirm(identity: {cluster_id: \"` + clusterData["CLUSTER_ID"] + `\", access_key: \"` + clusterData["ACCESS_KEY"] + `\"}){isClusterConfirmed newAccessKey cluster_id}}"}`
	resp, err := sendMutation(clusterData["SERVER_ADDR"], []byte(payload))
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
					nodeData.Phase = node.Phase
					nodeData.Message = node.Message
					if node.Phase == "Failed" {
						eventData.Phase = "Failed"
						eventData.Message = "Chaos Experiment Failed"
					}
					eventData.Nodes[key] = nodeData
				}
			}
		}
		eventMap[eventData.UID] = eventData

		// generate gql payload
		payload, err := GenerateWorkflowPayload(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], "false", eventData)

		if eventData.FinishedAt != "" {
			payload, err = GenerateWorkflowPayload(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], "true", eventData)
			delete(eventMap, eventData.UID)
		}

		if err != nil {
			logrus.WithError(err).Print("ERROR PARSING WORKFLOW EVENT")
		}

		body, err := sendMutation(clusterData["SERVER_ADDR"], payload)
		if err != nil {
			logrus.Print(err.Error())
		}
		logrus.Print("RESPONSE ", body)
	}
}

//SendPodLogs generates gql mutation to send workflow updates to gql server
func SendPodLogs(clusterData map[string]string, podLog types.PodLogRequest) {
	// generate gql payload
	payload, err := GenerateLogPayload(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], podLog)
	if err != nil {
		logrus.WithError(err).Print("ERROR GETTING WORKFLOW LOG")
	}
	body, err := sendMutation(clusterData["SERVER_ADDR"], payload)
	if err != nil {
		logrus.Print(err.Error())
	}
	logrus.Print("RESPONSE ", body)
}

//SendKubeObjects generates gql mutation to send kubernetes objects data to gql server
func SendKubeObjects(clusterData map[string]string, kubeobjectrequest types.KubeObjRequest) error {
	// generate gql payload
	payload, err := GenerateKubeObject(clusterData["CLUSTER_ID"], clusterData["ACCESS_KEY"], kubeobjectrequest)
	if err != nil {
		logrus.WithError(err).Print("Error while getting KubeObject Data")
		return err
	}
	body, err := sendMutation(clusterData["SERVER_ADDR"], payload)

	if err != nil {
		logrus.Print(err.Error())
		return err
	}
	logrus.Println("Response", body)
	return nil
}
