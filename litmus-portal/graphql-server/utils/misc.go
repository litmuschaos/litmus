package utils

import (
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"os"
	"strings"

	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"
)

// WriteHeaders adds important headers to API responses
func WriteHeaders(w *http.ResponseWriter, statusCode int) {
	(*w).Header().Set("Content-Type", "application/json; charset=utf-8")
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).WriteHeader(statusCode)
}

// RandomString generates random strings, can be used to create ids or random secrets
func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-")
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

// ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func ManifestParser(cluster dbSchemaCluster.Cluster, rootPath string, subscriberConfig *types.SubscriberConfigurationVars) ([]byte, error) {
	var (
		generatedYAML             []string
		defaultState              = false
		AgentNamespace            string
		ServiceAccountName        string
		DefaultAgentNamespace     = "litmus"
		DefaultServiceAccountName = "litmus"
	)

	if cluster.AgentNsExists == nil {
		cluster.AgentNsExists = &defaultState
	}
	if cluster.AgentSaExists == nil {
		cluster.AgentSaExists = &defaultState
	}

	if cluster.AgentNamespace != nil && *cluster.AgentNamespace != "" {
		AgentNamespace = *cluster.AgentNamespace
	} else {
		AgentNamespace = DefaultAgentNamespace
	}

	if cluster.Serviceaccount != nil && *cluster.Serviceaccount != "" {
		ServiceAccountName = *cluster.Serviceaccount
	} else {
		ServiceAccountName = DefaultServiceAccountName
	}

	var (
		namspaceStr       = "---\napiVersion: v1\nkind: Namespace\nmetadata:\n  name: " + AgentNamespace + "\n"
		serviceAccountStr = "---\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: " + ServiceAccountName + "\n  namespace: " + AgentNamespace + "\n"
	)

	// Checking if the agent namespace does not exist and its scope of installation is not namespaced
	if *cluster.AgentNsExists == false && cluster.AgentScope != "namespace" {
		generatedYAML = append(generatedYAML, fmt.Sprintf(namspaceStr))
	}

	if *cluster.AgentSaExists == false {
		generatedYAML = append(generatedYAML, fmt.Sprintf(serviceAccountStr))
	}

	// File operations
	file, err := os.Open(rootPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	list, err := file.Readdirnames(0) // 0 to read all files and folders
	if err != nil {
		return nil, err
	}

	for _, fileName := range list {

		fileContent, err := ioutil.ReadFile(rootPath + "/" + fileName)
		if err != nil {
			return nil, err
		}

		var newContent = string(fileContent)

		newContent = strings.Replace(newContent, "#{CLUSTER_ID}", cluster.ClusterID, -1)
		newContent = strings.Replace(newContent, "#{ACCESS_KEY}", cluster.AccessKey, -1)
		newContent = strings.Replace(newContent, "#{SERVER_ADDR}", subscriberConfig.GQLServerURI, -1)
		newContent = strings.Replace(newContent, "#{SUBSCRIBER-IMAGE}", subscriberConfig.SubscriberImage, -1)
		newContent = strings.Replace(newContent, "#{EVENT-TRACKER-IMAGE}", subscriberConfig.EventTrackerImage, -1)
		newContent = strings.Replace(newContent, "#{AGENT-NAMESPACE}", AgentNamespace, -1)
		newContent = strings.Replace(newContent, "#{SUBSCRIBER-SERVICE-ACCOUNT}", ServiceAccountName, -1)
		newContent = strings.Replace(newContent, "#{AGENT-SCOPE}", cluster.AgentScope, -1)
		newContent = strings.Replace(newContent, "#{ARGO-WORKFLOW-CONTROLLER}", subscriberConfig.WorkflowControllerImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS-CHAOS-OPERATOR}", subscriberConfig.ChaosOperatorImage, -1)
		newContent = strings.Replace(newContent, "#{ARGO-WORKFLOW-EXECUTOR}", subscriberConfig.WorkflowExecutorImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS-CHAOS-RUNNER}", subscriberConfig.ChaosRunnerImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS-CHAOS-EXPORTER}", subscriberConfig.ChaosExporterImage, -1)
		newContent = strings.Replace(newContent, "#{ARGO-CONTAINER-RUNTIME-EXECUTOR}", subscriberConfig.ContainerRuntimeExecutor, -1)

		generatedYAML = append(generatedYAML, newContent)
	}

	return []byte(strings.Join(generatedYAML, "\n")), nil
}

// ContainsString checks if a string is present in an array of strings
func ContainsString(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}

	return false
}
