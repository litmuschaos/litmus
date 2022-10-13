package utils

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"unicode"

	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"
	"gopkg.in/yaml.v2"
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

// URLDecodeBase64 decader String of type base64 or return the text if error happens
func URLDecodeBase64(enconded string) string {
	decoded, err := base64.RawURLEncoding.DecodeString(enconded)
	if err != nil {
		return enconded
	}
	return string(decoded)
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

	skipSSL := "false"
	if cluster.SkipSSL != nil && *cluster.SkipSSL {
		skipSSL = "true"
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

	var nodeselector string
	if cluster.NodeSelector != nil {
		selector := strings.Split(*cluster.NodeSelector, ",")
		selectorList := make(map[string]string)
		for _, el := range selector {
			kv := strings.Split(el, "=")
			selectorList[kv[0]] = kv[1]
		}

		nodeSelector := struct {
			NodeSelector map[string]string `yaml:"nodeSelector"`
		}{
			NodeSelector: selectorList,
		}

		byt, err := yaml.Marshal(nodeSelector)
		if err != nil {
			return nil, err
		}

		nodeselector = string(addRootIndent(byt, 6))
	}

	var tolerations string
	if cluster.Tolerations != nil {
		byt, err := yaml.Marshal(struct {
			Tolerations []*dbSchemaCluster.Toleration `yaml:"tolerations"`
		}{
			Tolerations: cluster.Tolerations,
		})
		if err != nil {
			return nil, err
		}

		tolerations = string(addRootIndent(byt, 6))
	}

	for _, fileName := range list {
		fileContent, err := ioutil.ReadFile(rootPath + "/" + fileName)
		if err != nil {
			return nil, err
		}

		var newContent = string(fileContent)

		newContent = strings.Replace(newContent, "#{tolerations}", tolerations, -1)
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
		newContent = strings.Replace(newContent, "#{AGENT-DEPLOYMENTS}", subscriberConfig.AgentDeployments, -1)
		newContent = strings.Replace(newContent, "#{VERSION}", subscriberConfig.Version, -1)
		newContent = strings.Replace(newContent, "#{SKIP_SSL_VERIFY}", skipSSL, -1)
		newContent = strings.Replace(newContent, "#{CUSTOM_TLS_CERT}", subscriberConfig.TLSCert, -1)
		newContent = strings.Replace(newContent, "#{START_TIME}", "\""+cluster.StartTime+"\"", -1)
		if cluster.IsClusterConfirmed == true {
			newContent = strings.Replace(newContent, "#{IS_CLUSTER_CONFIRMED}", "\""+"true"+"\"", -1)
		} else {
			newContent = strings.Replace(newContent, "#{IS_CLUSTER_CONFIRMED}", "\""+"false"+"\"", -1)
		}

		if cluster.NodeSelector != nil {
			newContent = strings.Replace(newContent, "#{nodeselector}", nodeselector, -1)
		}
		generatedYAML = append(generatedYAML, newContent)
	}

	return []byte(strings.Join(generatedYAML, "\n")), nil
}

func addRootIndent(b []byte, n int) []byte {
	prefix := append([]byte("\n"), bytes.Repeat([]byte(" "), n)...)
	return bytes.ReplaceAll(b, []byte("\n"), prefix)
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

// Truncate a float to two levels of precision
func Truncate(num float64) float64 {
	return float64(int(num*100)) / 100
}

// Split returns the string in between a before sub-string and an after sub-string
func Split(str, before, after string) string {
	a := strings.SplitAfterN(str, before, 2)
	b := strings.SplitAfterN(a[len(a)-1], after, 2)
	if 1 == len(b) {
		return b[0]
	}
	return b[0][0 : len(b[0])-len(after)]
}

// GetKeyValueMapFromQuotedString returns key value pairs from a string with quotes
func GetKeyValueMapFromQuotedString(quotedString string) map[string]string {
	lastQuote := rune(0)
	f := func(c rune) bool {
		switch {
		case c == lastQuote:
			lastQuote = rune(0)
			return false
		case lastQuote != rune(0):
			return false
		case unicode.In(c, unicode.Quotation_Mark):
			lastQuote = c
			return false
		default:
			return unicode.IsSpace(c)

		}
	}

	// splitting string by space but considering quoted section
	items := strings.FieldsFunc(quotedString, f)

	// create and fill the map
	m := make(map[string]string)
	for _, item := range items {
		x := strings.Split(item, "=")
		m[x[0]] = x[1][1 : len(x[1])-2]
	}

	return m
}
