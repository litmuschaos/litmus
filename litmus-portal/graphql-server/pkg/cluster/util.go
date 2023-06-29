package cluster

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

const (
	// CIVersion specifies the version tag used for ci builds
	CIVersion = "ci"
)

// subscriberConfigurations contains the configurations required for the subscriber
type subscriberConfigurations struct {
	ServerEndpoint string
	TLSCert        string
}

// ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func manifestParser(cluster dbSchemaCluster.Cluster, rootPath string, config *subscriberConfigurations) ([]byte, error) {
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
		namespaceConfig   = "---\napiVersion: v1\nkind: Namespace\nmetadata:\n  name: " + AgentNamespace + "\n"
		serviceAccountStr = "---\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: " + ServiceAccountName + "\n  namespace: " + AgentNamespace + "\n"
	)

	// Checking if the agent namespace does not exist and its scope of installation is not namespaced
	if *cluster.AgentNsExists == false && cluster.AgentScope != "namespace" {
		generatedYAML = append(generatedYAML, fmt.Sprintf(namespaceConfig))
	}

	if *cluster.AgentSaExists == false {
		generatedYAML = append(generatedYAML, fmt.Sprintf(serviceAccountStr))
	}

	// File operations
	file, err := os.Open(rootPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open the file %v", err)
	}

	defer file.Close()

	list, err := file.Readdirnames(0) // 0 to read all files and folders
	if err != nil {
		return nil, fmt.Errorf("failed to read the file %v", err)
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
			NodeSelector map[string]string `yaml:"nodeSelector" json:"nodeSelector"`
		}{
			NodeSelector: selectorList,
		}

		byt, err := yaml.Marshal(nodeSelector)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal the node selector %v", err)
		}

		nodeselector = string(utils.AddRootIndent(byt, 6))
	}

	var tolerations string
	if cluster.Tolerations != nil {
		byt, err := yaml.Marshal(struct {
			Tolerations []*dbSchemaCluster.Toleration `yaml:"tolerations" json:"tolerations"`
		}{
			Tolerations: cluster.Tolerations,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to marshal the tolerations %v", err)
		}

		tolerations = string(utils.AddRootIndent(byt, 6))
	}

	for _, fileName := range list {
		fileContent, err := ioutil.ReadFile(rootPath + "/" + fileName)
		if err != nil {
			return nil, fmt.Errorf("failed to read the file %v", err)
		}

		var newContent = string(fileContent)

		newContent = strings.Replace(newContent, "#{TOLERATIONS}", tolerations, -1)
		newContent = strings.Replace(newContent, "#{CLUSTER_ID}", cluster.ClusterID, -1)
		newContent = strings.Replace(newContent, "#{ACCESS_KEY}", cluster.AccessKey, -1)
		newContent = strings.Replace(newContent, "#{SERVER_ADDR}", config.ServerEndpoint, -1)
		newContent = strings.Replace(newContent, "#{SUBSCRIBER_IMAGE}", utils.Config.SubscriberImage, -1)
		newContent = strings.Replace(newContent, "#{EVENT_TRACKER_IMAGE}", utils.Config.EventTrackerImage, -1)
		newContent = strings.Replace(newContent, "#{AGENT_NAMESPACE}", AgentNamespace, -1)
		newContent = strings.Replace(newContent, "#{SUBSCRIBER_SERVICE_ACCOUNT}", ServiceAccountName, -1)
		newContent = strings.Replace(newContent, "#{AGENT_SCOPE}", cluster.AgentScope, -1)
		newContent = strings.Replace(newContent, "#{ARGO_WORKFLOW_CONTROLLER}", utils.Config.ArgoWorkflowControllerImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS_CHAOS_OPERATOR}", utils.Config.LitmusChaosOperatorImage, -1)
		newContent = strings.Replace(newContent, "#{ARGO_WORKFLOW_EXECUTOR}", utils.Config.ArgoWorkflowExecutorImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS_CHAOS_RUNNER}", utils.Config.LitmusChaosRunnerImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS_CHAOS_EXPORTER}", utils.Config.LitmusChaosExporterImage, -1)
		newContent = strings.Replace(newContent, "#{ARGO_CONTAINER_RUNTIME_EXECUTOR}", utils.Config.ContainerRuntimeExecutor, -1)
		newContent = strings.Replace(newContent, "#{AGENT_DEPLOYMENTS}", utils.Config.AgentDeployments, -1)
		newContent = strings.Replace(newContent, "#{VERSION}", utils.Config.Version, -1)
		newContent = strings.Replace(newContent, "#{SKIP_SSL_VERIFY}", skipSSL, -1)
		newContent = strings.Replace(newContent, "#{CUSTOM_TLS_CERT}", config.TLSCert, -1)

		newContent = strings.Replace(newContent, "#{START_TIME}", "\""+cluster.StartTime+"\"", -1)
		if cluster.IsClusterConfirmed == true {
			newContent = strings.Replace(newContent, "#{IS_CLUSTER_CONFIRMED}", "\""+"true"+"\"", -1)
		} else {
			newContent = strings.Replace(newContent, "#{IS_CLUSTER_CONFIRMED}", "\""+"false"+"\"", -1)
		}

		if cluster.NodeSelector != nil {
			newContent = strings.Replace(newContent, "#{NODE_SELECTOR}", nodeselector, -1)
		}
		generatedYAML = append(generatedYAML, newContent)
	}

	return []byte(strings.Join(generatedYAML, "\n")), nil
}

// SendRequestToSubscriber sends events from the graphQL server to the subscribers listening for the requests
func SendRequestToSubscriber(subscriberRequest SubscriberRequests, r store.StateData) {
	if utils.Config.AgentScope == string(utils.AgentScopeCluster) {
		/*
			namespace = Obtain from WorkflowManifest or
			from frontend as a separate workflowNamespace field under ChaosWorkFlowRequest model
			for CreateChaosWorkflow mutation to be passed to this function.
		*/
	}
	newAction := &model.ClusterActionResponse{
		ProjectID: subscriberRequest.ProjectID,
		Action: &model.ActionPayload{
			K8sManifest:  subscriberRequest.K8sManifest,
			Namespace:    subscriberRequest.Namespace,
			RequestType:  subscriberRequest.RequestType,
			ExternalData: subscriberRequest.ExternalData,
			Username:     subscriberRequest.Username,
		},
	}

	r.Mutex.Lock()

	if observer, ok := r.ConnectedCluster[subscriberRequest.ClusterID]; ok {
		observer <- newAction
	}

	r.Mutex.Unlock()
}
