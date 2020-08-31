package gql

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/backend/workflow-agent/pkg/types"
	"github.com/sirupsen/logrus"
)

// Subscription performs cluster-connect operation and listens for requests from server
func Subscription(server, cid, accessKey string) {
	client := &http.Client{}
	clusterID := `{cluster_id: \"` + cid + `\", access_key: \"` + accessKey + `\"}`
	query := `{
			"query": "subscription { clusterConnect(clusterInfo: ` + clusterID + `) { project_id action{request_type external_data}}  }"
		}`

	req, err := http.NewRequest("POST", server, strings.NewReader(query))
	if err != nil {
		logrus.WithError(err).Fatal("error sending cluster-connect request")
	}

	// Headers for the calling the server endpoint
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("DNT", "1")

	for {
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode != 200 {
			logrus.WithError(err).Fatal("error reading cluster-action request")
		}
		bodyText, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			logrus.WithError(err).Fatal("error reading cluster-action request")
		}

		// extract cluster action data
		var responseInterface map[string]map[string]map[string]interface{}
		err = json.Unmarshal([]byte(bodyText), &responseInterface)
		if err != nil || len(responseInterface) == 0 {
			logrus.WithError(err).Fatal("error reading cluster-action request [action-data]")
		}
		var action = responseInterface["data"]["clusterConnect"]["action"].(map[string]interface{})

		// check if logs action
		if strings.ToLower(action["request_type"].(string)) != "logs" {
			continue
		}

		// send pod logs
		podRequest := types.PodLogRequest{
			RequestID: responseInterface["data"]["clusterConnect"]["project_id"].(string),
		}
		err = json.Unmarshal([]byte(action["external_data"].(string)), &podRequest)
		if err != nil {
			logrus.WithError(err).Fatal("error reading cluster-action request [external-data]")
		}
		logrus.Print("LOG REQUEST ", podRequest)
		SendPodLogs(server, cid, accessKey, podRequest)
	}
}
