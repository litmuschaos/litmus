package gql

import (
	"encoding/json"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/backend/subscriber/pkg/types"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

func ClusterConnect(clusterData map[string]string) {
	client := &http.Client{}

	query := `{"query":"subscription {\n    clusterConnect(clusterInfo: {cluster_id: \"` + clusterData["CID"] + `\", access_key: \"` + clusterData["KEY"] + `\"}) {\n   \t project_id,\n     action{\n      k8s_manifest,\n      external_data,\n      request_type\n     }\n  }\n}\n"}`
	req, err := http.NewRequest("POST", clusterData["GQL_SERVER"], strings.NewReader(query))
	if err != nil {
		log.Fatal(err)
	}

	// Headers for the calling the server endpoint
	CommonHeaders(req)
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

		var r types.Response

		err = json.Unmarshal(bodyText, &r)
		if err != nil {
			log.Fatal(err)
		}
		_, err = cluster.ClusterOperations(r.Data.ClusterConnect.Action.K8SManifest, r.Data.ClusterConnect.Action.RequestType)
		if err != nil {
			log.Fatal(err)
		}
	}

}
