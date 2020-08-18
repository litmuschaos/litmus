package main

import (
	"encoding/json"
	"flag"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/cluster"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

var GRAPHQL_SERVER_ADDRESS = os.Getenv("GQL_SERVER") // Format: http://IP:PORT/query
var newSubscriber = cluster.New()

func init() {
	newSubscriber.ClusterKey = os.Getenv("KEY")
	newSubscriber.ClusterID = os.Getenv("CID")
	newSubscriber.KubeConfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	
	bool, err := newSubscriber.IsClusterConfirmed()
	if err != nil {
		log.Fatal(err)
	}

	if bool == false {
		payload := `{"query":"mutation clusterConfirm{\n clusterConfirm(identity: {cluster_id: \"` + newSubscriber.ClusterID + `\", access_key: \"` + newSubscriber.ClusterKey + `\"}){\n \tisClusterConfirmed\n newClusterKey\n \tcluster_id\n }\n}"}`
		req, err := http.NewRequest("POST", GRAPHQL_SERVER_ADDRESS, strings.NewReader(payload))
		if err != nil {
			log.Println(err)
		}

		req.Header.Set("Accept-Encoding", "gzip, deflate, br")
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")
		req.Header.Set("Connection", "keep-alive")
		req.Header.Set("Dnt", "1")

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Fatal(err)
		}

		bodyText, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}

		var responseInterface map[string]map[string]map[string]interface{}
		json.Unmarshal([]byte(bodyText), &responseInterface)

		if responseInterface["data"]["clusterConfirm"]["isClusterConfirmed"] == true {
			log.Println("cluster confirmed")

			newSubscriber.ClusterKey = strings.TrimSpace(responseInterface["data"]["clusterConfirm"]["newClusterKey"].(string))
			newSubscriber.ClusterRegister(newSubscriber.ClusterKey, newSubscriber.ClusterID)
		} else {
			log.Fatal("Cluster not confirmed")
		}
	}
}

func main() {
	client := &http.Client{}

	query := `{"query":"subscription {\n    clusterConnect(clusterInfo: {cluster_id: \"` + newSubscriber.ClusterID + `\", access_key: \"` + newSubscriber.ClusterKey + `\"}) {\n   \t project_id,\n     action{\n      k8s_manifest,\n      external_data,\n      request_type\n     }\n  }\n}\n"}`
	req, err := http.NewRequest("POST", GRAPHQL_SERVER_ADDRESS, strings.NewReader(query))
	if err != nil {
		log.Fatal(err)
	}

	// Headers for the calling the server endpoint
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("DNT", "1")

	for {
		log.Println("Waiting for the subscription...")
		resp, err := client.Do(req)
		if err != nil {
			log.Fatal(err)
		}

		bodyText, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}

		var r cluster.Response

		json.Unmarshal(bodyText, &r)
		_, err = newSubscriber.ClusterOperations(r.Data.ClusterConnect.Action.K8SManifest, r.Data.ClusterConnect.Action.RequestType)
		if err != nil {
			log.Fatal(err)
		}
	}
}
