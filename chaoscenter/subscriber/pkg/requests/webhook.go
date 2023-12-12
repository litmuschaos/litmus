package requests

import (
	"encoding/json"
	"errors"
	"net/url"
	"strings"
	"time"

	"subscriber/pkg/types"

	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

func (req *subscriberRequests) AgentConnect(infraData map[string]string) {
	query := `{"query":"subscription {\n    infraConnect(request: {infraID: \"` + infraData["INFRA_ID"] + `\", version: \"` + infraData["VERSION"] + `\", accessKey: \"` + infraData["ACCESS_KEY"] + `\"}) {\n     action{\n      k8sManifest,\n      externalData,\n      requestID\n requestType\n     username\n     namespace\n     }\n  }\n}\n"}`
	serverURL, err := url.Parse(infraData["SERVER_ADDR"])
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

		err = req.RequestProcessor(infraData, r)
		if err != nil {
			logrus.WithError(err).Error("Error on processing request")
		}
	}
}

func (req *subscriberRequests) RequestProcessor(infraData map[string]string, r types.RawData) error {
	if strings.Index("kubeobject kubeobjects", strings.ToLower(r.Payload.Data.InfraConnect.Action.RequestType)) >= 0 {
		KubeObjRequest := types.KubeObjRequest{
			RequestID: r.Payload.Data.InfraConnect.Action.RequestID,
		}

		err := json.Unmarshal([]byte(r.Payload.Data.InfraConnect.Action.ExternalData), &KubeObjRequest)
		if err != nil {
			return errors.New("failed to json unmarshal: " + err.Error())
		}

		err = req.subscriberK8s.SendKubeObjects(infraData, KubeObjRequest)
		if err != nil {
			return errors.New("error getting kubernetes object data: " + err.Error())
		}
	}
	if strings.ToLower(r.Payload.Data.InfraConnect.Action.RequestType) == "logs" {
		podRequest := types.PodLogRequest{
			RequestID: r.Payload.Data.InfraConnect.Action.RequestID,
		}
		err := json.Unmarshal([]byte(r.Payload.Data.InfraConnect.Action.ExternalData), &podRequest)
		if err != nil {
			return errors.New("error reading infra-action request [external-data]: " + err.Error())
		}

		logrus.Print("Log Request: ", r.Payload.Data.InfraConnect.Action.ExternalData)
		req.subscriberK8s.SendPodLogs(infraData, podRequest)
	} else if strings.Index("create update delete get", strings.ToLower(r.Payload.Data.InfraConnect.Action.RequestType)) >= 0 {
		_, err := req.subscriberK8s.AgentOperations(r.Payload.Data.InfraConnect.Action)
		if err != nil {
			return errors.New("error performing infra operation: " + err.Error())
		}
	} else if strings.Index("workflow_delete workflow_run_delete workflow_run_stop ", strings.ToLower(r.Payload.Data.InfraConnect.Action.RequestType)) >= 0 {

		err := req.subscriberUtils.WorkflowRequest(infraData, r.Payload.Data.InfraConnect.Action.RequestType, r.Payload.Data.InfraConnect.Action.ExternalData, r.Payload.Data.InfraConnect.Action.Username)
		if err != nil {
			return errors.New("error performing events operation: " + err.Error())
		}
	}

	return nil
}
