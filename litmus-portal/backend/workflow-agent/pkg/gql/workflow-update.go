package gql

import (
	"bytes"
	"github.com/gdsoumya/workflow_manager/pkg/types"
	"github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
)

//SendWorkflowUpdates generates gql mutation to send workflow updates to gql server
func SendWorkflowUpdates(server, cid, accesskey string, event chan types.WorkflowEvent) {
	// listen on the channel for streaming event updates
	for eventData := range event {
		// generate gql payload
		payload, err := GenerateWorkflowPayload(cid, accesskey, eventData)
		if err != nil {
			logrus.WithError(err).Print("ERROR PARSING WORKFLOW EVENT")
		}

		req, err := http.NewRequest("POST", server, bytes.NewBuffer(payload))
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
