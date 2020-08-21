package gql

import (
	"io/ioutil"
	"net/http"
	"strings"
)

func CommonHeaders(req *http.Request) {
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Dnt", "1")
}

func ClusterConfirm(clusterData map[string]string) ([]byte, error) {
	payload := `{"query":"mutation clusterConfirm{\n clusterConfirm(identity: {cluster_id: \"` + clusterData["CID"] + `\", access_key: \"` + clusterData["KEY"] + `\"}){\n \tisClusterConfirmed\n newClusterKey\n \tcluster_id\n }\n}"}`
	req, err := http.NewRequest("POST", clusterData["GQL_SERVER"], strings.NewReader(payload))
	if err != nil {
		return nil, err
	}

	CommonHeaders(req)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	return ioutil.ReadAll(resp.Body)
}
