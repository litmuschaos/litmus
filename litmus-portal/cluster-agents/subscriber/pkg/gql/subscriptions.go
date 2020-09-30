package gql

import (
	"encoding/json"

	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/k8s"

	"github.com/gorilla/websocket"
	"github.com/litmuschaos/litmus/litmus-portal/cluster-agents/subscriber/pkg/types"
	"github.com/sirupsen/logrus"

	"log"
	"net/url"
	"strings"
	"time"
)

func ClusterConnect(clusterData map[string]string) {
	query := `{"query":"subscription {\n    clusterConnect(clusterInfo: {cluster_id: \"` + clusterData["CID"] + `\", access_key: \"` + clusterData["KEY"] + `\"}) {\n   \t project_id,\n     action{\n      k8s_manifest,\n      external_data,\n      request_type\n     namespace\n     }\n  }\n}\n"}`
	serverURL, err := url.Parse(clusterData["GQL_SERVER"])
	scheme := "ws"
	if serverURL.Scheme == "https" {
		scheme = "wss"
	}
	u := url.URL{Scheme: scheme, Host: serverURL.Host, Path: "/query"}
	log.Printf("connecting to %s", u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	go func() {
		time.Sleep(1 * time.Second)
		payload := types.OperationMessage{
			Type: "connection_init",
		}
		data, err := json.Marshal(payload)
		err = c.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			log.Println("write:", err)
			return
		}
		payload = types.OperationMessage{
			Payload: []byte(query),
			Type:    "start",
		}
		data, err = json.Marshal(payload)
		err = c.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			log.Println("write:", err)
			return
		}
	}()
	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Fatal("SUBSCRIPTION ERROR : ", err)
		}
		var r types.RawData
		err = json.Unmarshal(message, &r)
		if err != nil {
			logrus.WithError(err).Fatal("error un-marshaling request payload")
		}
		if r.Type == "connection_ack" {
			log.Print("Cluster Connect Established, Listening....")
		}
		if r.Type != "data" {
			continue
		}
		if r.Payload.Errors != nil {
			logrus.Fatal("gql error : ", string(message))
		}

		if strings.ToLower(r.Payload.Data.ClusterConnect.Action.RequestType) == "logs" {
			podRequest := types.PodLogRequest{
				RequestID: r.Payload.Data.ClusterConnect.ProjectID,
			}
			err = json.Unmarshal([]byte(r.Payload.Data.ClusterConnect.Action.ExternalData.(string)), &podRequest)
			if err != nil {
				logrus.WithError(err).Print("error reading cluster-action request [external-data]")
				continue
			}
			// send pod logs
			logrus.Print("LOG REQUEST ", podRequest)
			SendPodLogs(clusterData, podRequest)
		} else if strings.Index("create update delete get", strings.ToLower(r.Payload.Data.ClusterConnect.Action.RequestType)) >= 0 {
			logrus.Print("WORKFLOW REQUEST ", r.Payload.Data.ClusterConnect.Action)
			_, err = k8s.ClusterOperations(r.Payload.Data.ClusterConnect.Action.K8SManifest, r.Payload.Data.ClusterConnect.Action.RequestType, r.Payload.Data.ClusterConnect.Action.Namespace)
			if err != nil {
				logrus.WithError(err).Print("error performing cluster operation")
				continue
			}
		}
	}
}
