package graphql

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"
	"subscriber/pkg/types"

	log "github.com/sirupsen/logrus"
)

func (gql *subscriberGql) SendRequest(server string, payload []byte) (string, error) {
	req, err := http.NewRequest("POST", server, bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}

	body, err := io.ReadAll(resp.Body)
	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.Warnf("failed to close body: %v", err)
		}
	}()

	if err != nil {
		return "", err
	}

	return string(body), nil
}

// MarshalGQLData processes event data into proper format acceptable by graphql
func (gql *subscriberGql) MarshalGQLData(gqlData interface{}) (string, error) {
	data, err := json.Marshal(gqlData)
	if err != nil {
		return "", err
	}

	// process the marshalled data to make it graphql compatible
	processed := strconv.Quote(string(data))
	processed = strings.Replace(processed, `\"`, `\\\"`, -1)
	return processed, nil
}

// Get an experiment run on the GraphQL server
func (gql *subscriberGql) SendExperimentRunRuquest(infraData map[string]string, podLog types.PodLogRequest) (types.ExperimentRunResponse, error) {

	payload, _ := gql.GenerateExperimentRunPayload(infraData["INFRA_ID"], infraData["ACCESS_KEY"], infraData["VERSION"], podLog)

	body, err := gql.SendRequest(infraData["SERVER_ADDR"], payload)
	if err != nil {
		log.WithError(err).Print("Failed to send experiment run request")
	}

	var respsone types.ExperimentRunResponse
	err = json.Unmarshal([]byte(body), &respsone)
	if err != nil {
		log.WithError(err).WithField("data", string(body)).Fatal("Failed to parse ExperimentRun data")
	}

	log.Print("Response from the server: ", body)

	return respsone, nil
}

func (gql *subscriberGql) GenerateExperimentRunPayload(cid, accessKey, version string, podLog types.PodLogRequest) ([]byte, error) {
	infraID := `infraID: {infraID: \"` + cid + `\", version: \"` + version + `\", accessKey: \"` + accessKey + `\"}`
	query := infraID + `, experimentRunID: \"` + podLog.ExperimentRunID + `\", projectID: \"` + podLog.ProjectID + `\", notifyID: \"\"`

	var payload = []byte(`{"query": "query { getExperimentRun(` + query + `) { phase } }"}`)
	return payload, nil
}
