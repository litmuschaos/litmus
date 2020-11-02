package utils

import (
	"bufio"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strings"

	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
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
func ManifestParser(cluster database.Cluster, template string, subscriberConfig *types.SubscriberConfigurationVars) ([]byte, error) {
	defaultState := false
	if cluster.AgentNsExists == nil {
		cluster.AgentNsExists = &defaultState
	}
	if cluster.AgentSaExists == nil {
		cluster.AgentSaExists = &defaultState
	}
	file, err := os.Open(template)
	if err != nil {
		return []byte{}, err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	var lines []string

	if !*cluster.AgentNsExists || !*cluster.AgentSaExists {
		comment := fmt.Sprintf("# This is an auto-generated file. DO NOT EDIT")
		lines = append(lines, comment)
	}
	if !*cluster.AgentNsExists {
		var nsYaml string
		if cluster.AgentNamespace != nil {
			nsYaml = fmt.Sprintf("apiVersion: v1\nkind: Namespace\nmetadata:\n  name: %s\n---", *cluster.AgentNamespace)
		} else {
			nsYaml = fmt.Sprintf("apiVersion: v1\nkind: Namespace\nmetadata:\n  name: litmus\n---")
		}
		lines = append(lines, nsYaml)
	}
	if !*cluster.AgentSaExists {
		var saYaml string
		if cluster.Serviceaccount != nil && cluster.AgentNamespace != nil {
			saYaml = fmt.Sprintf("apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: %s\n  namespace: %s\n---", *cluster.Serviceaccount, *cluster.AgentNamespace)
		} else if cluster.Serviceaccount == nil && cluster.AgentNamespace != nil {
			saYaml = fmt.Sprintf("apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: litmus\n  namespace: %s\n---", *cluster.AgentNamespace)
		} else if cluster.Serviceaccount != nil && cluster.AgentNamespace == nil {
			saYaml = fmt.Sprintf("apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: %s\n  namespace: litmus\n---", *cluster.Serviceaccount)
		} else {
			saYaml = fmt.Sprintf("apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: litmus\n  namespace: litmus\n---")
		}
		lines = append(lines, saYaml)
	}

	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "# This is an auto-generated file. DO NOT EDIT") {
			if !*cluster.AgentNsExists || !*cluster.AgentSaExists {
				line = strings.Replace(line, "# This is an auto-generated file. DO NOT EDIT", "", -1)
			}
		} else if strings.Contains(line, "#{CID}") {
			line = strings.Replace(line, "#{CID}", cluster.ClusterID, -1)
		} else if strings.Contains(line, "#{KEY}") {
			line = strings.Replace(line, "#{KEY}", cluster.AccessKey, -1)
		} else if strings.Contains(line, "#{SERVER}") {
			line = strings.Replace(line, "#{SERVER}", subscriberConfig.GQLServerURI, -1)
		} else if strings.Contains(line, "#{SUB-IMAGE}") {
			line = strings.Replace(line, "#{SUB-IMAGE}", subscriberConfig.SubscriberImage, -1)
		} else if strings.Contains(line, "#{AGENT-NAMESPACE}") {
			if cluster.AgentNamespace != nil && *cluster.AgentNamespace != "" {
				line = strings.Replace(line, "#{AGENT-NAMESPACE}", *cluster.AgentNamespace, -1)
			} else {
				line = strings.Replace(line, "#{AGENT-NAMESPACE}", "litmus", -1)
			}
		} else if strings.Contains(line, "#{SUBSCRIBER-SERVICE-ACCOUNT}") {
			if cluster.Serviceaccount != nil && *cluster.Serviceaccount != "" {
				line = strings.Replace(line, "#{SUBSCRIBER-SERVICE-ACCOUNT}", *cluster.Serviceaccount, -1)
			} else {
				line = strings.Replace(line, "#{SUBSCRIBER-SERVICE-ACCOUNT}", "litmus", -1)
			}
		} else if strings.Contains(line, "#{AGENT-SCOPE}") {
			line = strings.Replace(line, "#{AGENT-SCOPE}", cluster.AgentScope, -1)
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
