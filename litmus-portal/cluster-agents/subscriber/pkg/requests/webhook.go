package requests

import (
	"encoding/json"
	"errors"
	"net/url"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/utils"
	"github.com/sirupsen/logrus"
)

func ClusterConnect(clusterData map[string]string) {
	query := `{"query":"subscription {\n    clusterConnect(clusterInfo: {clusterID: \"` + clusterData["CLUSTER_ID"] + `\", version: \"` + clusterData["VERSION"] + `\", accessKey: \"` + clusterData["ACCESS_KEY"] + `\"}) {\n   \t projectID,\n     action{\n      k8sManifest,\n      externalData,\n      requestType\n     username\n     namespace\n     }\n  }\n}\n"}`
	serverURL, err := url.Parse(clusterData["SERVER_ADDR"])
	if err != nil {
		logrus.WithError(err).Fatal("Failed to parse URL")
	}
	scheme := "ws"
	if serverURL.Scheme == "https" {
		scheme = "wss"
	}

	u := url.URL{Scheme: scheme, Host: serverURL.Host, Path: serverURL.Path}
	logrus.Info("Connecting to " + u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		logrus.WithError(err).Fatal("Failed to established websocket connection")
	}
	defer c.Close()

	go func() {
		time.Sleep(1 * time.Second)
		payload := types.OperationMessage{
			Type: "connection_init",
		}
		data, err := json.Marshal(payload)
		if err != nil {
			logrus.WithError(err).Fatal("Failed to marshal message")
		}

		err = c.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			logrus.WithError(err).Fatal("Failed to write message after init")
			return
		}

		payload = types.OperationMessage{
			Payload: []byte(query),
			Type:    "start",
		}

		data, err = json.Marshal(payload)
		if err != nil {
			logrus.WithError(err).Fatal("Failed to marshal message")
		}

		err = c.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			logrus.WithError(err).Fatal("Failed to write message after start")
			return
		}
	}()

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			logrus.WithError(err).Fatal("Failed to read message")
		}
		var r types.RawData
		err = json.Unmarshal(message, &r)
		if err != nil {
			logrus.WithError(err).Error("Error while parsing the server response")
			continue
		}

		if r.Type == "connection_ack" {
			logrus.Info("Server connection established, Listening....")
		}
		if r.Type != "data" {
			continue
		}
		if r.Payload.Errors != nil {
			logrus.Error("Error response from the server : ", string(message))
			continue
		}
		err = RequestProcessor(clusterData, r)
		if err != nil {
			logrus.WithError(err).Error("Error on processing request")
		}
	}
}

func RequestProcessor(clusterData map[string]string, r types.RawData) error {
	if strings.Index("kubeobject kubeobjects", strings.ToLower(r.Payload.Data.ClusterConnect.Action.RequestType)) >= 0 {
		KubeObjRequest := types.KubeObjRequest{
			RequestID: r.Payload.Data.ClusterConnect.ProjectID,
		}
		err := json.Unmarshal([]byte(r.Payload.Data.ClusterConnect.Action.ExternalData), &KubeObjRequest)
		if err != nil {
			return errors.New("failed to json unmarshal: " + err.Error())
		}

		err = k8s.SendKubeObjects(clusterData, KubeObjRequest)
		if err != nil {
			return errors.New("error getting kubernetes object data: " + err.Error())
		}
	}
	if strings.ToLower(r.Payload.Data.ClusterConnect.Action.RequestType) == "logs" {
		podRequest := types.PodLogRequest{
			RequestID: r.Payload.Data.ClusterConnect.ProjectID,
		}

		err := json.Unmarshal([]byte(r.Payload.Data.ClusterConnect.Action.ExternalData), &podRequest)
		if err != nil {
			return errors.New("error reading cluster-action request [external-data]: " + err.Error())
		}

		logrus.Print("Log Request: ", r.Payload.Data.ClusterConnect.Action.ExternalData)
		k8s.SendPodLogs(clusterData, podRequest)
	} else if strings.Index("create update delete get", strings.ToLower(r.Payload.Data.ClusterConnect.Action.RequestType)) >= 0 {
		_, err := k8s.ClusterOperations(r.Payload.Data.ClusterConnect.Action)
		if err != nil {
			return errors.New("error performing cluster operation: " + err.Error())
		}
	} else if strings.Index("workflow_delete workflow_sync", strings.ToLower(r.Payload.Data.ClusterConnect.Action.RequestType)) >= 0 {
		err := utils.WorkflowRequest(clusterData, r.Payload.Data.ClusterConnect.Action.RequestType, r.Payload.Data.ClusterConnect.Action.ExternalData, r.Payload.Data.ClusterConnect.Action.Username)
		if err != nil {
			return errors.New("error performing events operation: " + err.Error())
		}
	}

	return nil
}
