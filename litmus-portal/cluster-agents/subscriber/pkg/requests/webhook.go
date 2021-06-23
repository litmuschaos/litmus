package requests

import (
	"encoding/json"
	"errors"
	"net/url"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/utils"

	"github.com/gorilla/websocket"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"
)

func ClusterConnect(clusterData map[string]string) {
	query := `{"query":"subscription {\n    clusterConnect(clusterInfo: {cluster_id: \"` + clusterData["CLUSTER_ID"] + `\", access_key: \"` + clusterData["ACCESS_KEY"] + `\"}) {\n   \t project_id,\n     action{\n      k8s_manifest,\n      external_data,\n      request_type\n     namespace\n     }\n  }\n}\n"}`
	serverURL, err := url.Parse(clusterData["SERVER_ADDR"])
	scheme := "ws"
	if serverURL.Scheme == "https" {
		scheme = "wss"
	}

	u := url.URL{Scheme: scheme, Host: serverURL.Host, Path: serverURL.Path}
	logrus.Info("connecting to " + u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		logrus.Fatal("dial:", err)
	}
	defer c.Close()

	go func() {
		time.Sleep(1 * time.Second)
		payload := types.OperationMessage{
			Type: "connection_init",
		}
		data, err := json.Marshal(payload)
		if err != nil {
			logrus.WithError(err).Fatal("failed to write message")
		}

		err = c.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			logrus.WithError(err).Fatal("failed to write message")
			return
		}

		payload = types.OperationMessage{
			Payload: []byte(query),
			Type:    "start",
		}

		data, err = json.Marshal(payload)
		err = c.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			logrus.WithError(err).Fatal("failed to write message")
			return
		}
	}()

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			logrus.WithError(err).Fatal("failed to read message")
		}

		var r types.RawData
		err = json.Unmarshal(message, &r)
		if err != nil {
			logrus.WithError(err).Fatal("error un-marshaling request payload")
		}

		if r.Type == "connection_ack" {
			logrus.Info("Cluster Connect Established, Listening....")
		}
		if r.Type != "data" {
			continue
		}
		if r.Payload.Errors != nil {
			logrus.Fatal("graphql error : ", string(message))
		}

		err = RequestProcessor(clusterData, r)
		if err != nil {
			logrus.WithError(err).Fatal("error on processing request")
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

		// send pod logs
		logrus.Print("LOG REQUEST ", r.Payload.Data.ClusterConnect.Action.ExternalData)
		k8s.SendPodLogs(clusterData, podRequest)
	} else if strings.Index("create update delete get", strings.ToLower(r.Payload.Data.ClusterConnect.Action.RequestType)) >= 0 {
		_, err := k8s.ClusterOperations(r.Payload.Data.ClusterConnect.Action.K8SManifest, r.Payload.Data.ClusterConnect.Action.RequestType, r.Payload.Data.ClusterConnect.Action.Namespace)
		if err != nil {
			return errors.New("error performing cluster operation: " + err.Error())
		}
	} else if strings.Index("workflow_delete workflow_sync", strings.ToLower(r.Payload.Data.ClusterConnect.Action.RequestType)) >= 0 {
		err := utils.WorkflowRequest(clusterData, r.Payload.Data.ClusterConnect.Action.RequestType, r.Payload.Data.ClusterConnect.Action.ExternalData)
		if err != nil {
			return errors.New("error performing events operation: " + err.Error())
		}
	}

	return nil
}
