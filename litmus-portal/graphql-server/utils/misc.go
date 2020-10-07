package utils

import (
	"bufio"
	"math/rand"
	"net/http"
	"os"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"
)

//WriteHeaders adds important headers to API responses
func WriteHeaders(w *http.ResponseWriter, statusCode int) {
	(*w).Header().Set("Content-Type", "application/json; charset=utf-8")
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).WriteHeader(statusCode)
}

//RandomString generates random strings, can be used to create ids or random secrets
func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-")
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

//ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func ManifestParser(id, key, template string, subscriberConfig *types.SubscriberConfigurationVars) ([]byte, error) {
	file, err := os.Open(template)
	if err != nil {
		return []byte{}, err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	var lines []string

	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "#{CID}") {
			line = strings.Replace(line, "#{CID}", id, -1)
		} else if strings.Contains(line, "#{KEY}") {
			line = strings.Replace(line, "#{KEY}", key, -1)
		} else if strings.Contains(line, "#{SERVER}") {
			line = strings.Replace(line, "#{SERVER}", subscriberConfig.GQLServerURI, -1)
		} else if strings.Contains(line, "#{SUB-IMAGE}") {
			line = strings.Replace(line, "#{SUB-IMAGE}", subscriberConfig.SubscriberImage, -1)
		} else if strings.Contains(line, "#{AGENT-NAMESPACE}") {
			line = strings.Replace(line, "#{AGENT-NAMESPACE}", subscriberConfig.AgentNamespace, -1)
		} else if strings.Contains(line, "#{AGENT-SCOPE}") {
			line = strings.Replace(line, "#{AGENT-SCOPE}", subscriberConfig.AgentScope, -1)
		} else if strings.Contains(line, "#{ARGO-SERVER}") {
			line = strings.Replace(line, "#{ARGO-SERVER}", subscriberConfig.ArgoServerImage, -1)
		} else if strings.Contains(line, "#{ARGO-WORKFLOW-CONTROLLER}") {
			line = strings.Replace(line, "#{ARGO-WORKFLOW-CONTROLLER}", subscriberConfig.WorkflowControllerImage, -1)
		} else if strings.Contains(line, "#{LITMUS-CHAOS-OPERATOR}") {
			line = strings.Replace(line, "#{LITMUS-CHAOS-OPERATOR}", subscriberConfig.ChaosOperatorImage, -1)
		} else if strings.Contains(line, "#{ARGO-WORKFLOW-EXECUTOR}") {
			line = strings.Replace(line, "#{ARGO-WORKFLOW-EXECUTOR}", subscriberConfig.WorkflowExecutorImage, -1)
		} else if strings.Contains(line, "#{LITMUS-CHAOS-RUNNER}") {
			line = strings.Replace(line, "#{LITMUS-CHAOS-RUNNER}", subscriberConfig.ChaosRunnerImage, -1)
		}
		lines = append(lines, line)
	}

	if err := scanner.Err(); err != nil {
		return []byte{}, err
	}

	return []byte(strings.Join(lines, "\n")), nil
}
