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
	var (
		lines                     []string
		defaultState              = false
		AgentNamespace            string
		ServiceAccountName        string
		DefaultAgentNamespace     = "litmus"
		DefaultServiceAccountName = "litmus"
	)

	file, err := os.Open(template)
	if err != nil {
		return []byte{}, err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)

	if cluster.AgentNsExists == nil {
		cluster.AgentNsExists = &defaultState
	}
	if cluster.AgentSaExists == nil {
		cluster.AgentSaExists = &defaultState
	}

	if !*cluster.AgentNsExists && cluster.AgentNamespace != nil && *cluster.AgentNamespace != "" {
		AgentNamespace = *cluster.AgentNamespace
	} else {
		AgentNamespace = DefaultAgentNamespace
	}

	if !*cluster.AgentSaExists && cluster.Serviceaccount != nil && *cluster.Serviceaccount != "" {
		ServiceAccountName = *cluster.Serviceaccount
	} else {
		ServiceAccountName = DefaultServiceAccountName
	}

	var (
		headerStr         = "# This is an auto-generated file. DO NOT EDIT\n"
		namspaceStr       = "\napiVersion: v1\nkind: Namespace\nmetadata:\n  name: " + AgentNamespace + "\n"
		serviceAccountStr = "---\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: " + ServiceAccountName + "\n  namespace: " + AgentNamespace + "\n---"
	)

	saYaml := fmt.Sprintf(headerStr)
	lines = append(lines, saYaml)

	if *cluster.AgentNsExists == false {
		saYaml := fmt.Sprintf(namspaceStr)
		lines = append(lines, saYaml)
	}

	if *cluster.AgentSaExists == false {
		saYaml := fmt.Sprintf(serviceAccountStr)
		lines = append(lines, saYaml)
	}

	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "#{CID}") {
			line = strings.Replace(line, "#{CID}", cluster.ClusterID, -1)
		} else if strings.Contains(line, "#{KEY}") {
			line = strings.Replace(line, "#{KEY}", cluster.AccessKey, -1)
		} else if strings.Contains(line, "#{SERVER}") {
			line = strings.Replace(line, "#{SERVER}", subscriberConfig.GQLServerURI, -1)
		} else if strings.Contains(line, "#{SUB-IMAGE}") {
			line = strings.Replace(line, "#{SUB-IMAGE}", subscriberConfig.SubscriberImage, -1)
		} else if strings.Contains(line, "#{AGENT-NAMESPACE}") {
			line = strings.Replace(line, "#{AGENT-NAMESPACE}", AgentNamespace, -1)
		} else if strings.Contains(line, "#{SUBSCRIBER-SERVICE-ACCOUNT}") {
			line = strings.Replace(line, "#{SUBSCRIBER-SERVICE-ACCOUNT}", ServiceAccountName, -1)
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
