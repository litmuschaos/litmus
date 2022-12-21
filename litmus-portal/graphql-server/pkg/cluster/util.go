package cluster

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/sirupsen/logrus"

	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

const (
	// CIVersion specifies the version tag used for ci builds
	CIVersion             = "ci"
	clusterScope   string = "cluster"
	namespaceScope string = "namespace"
)

var (
	endpoint      = utils.Config.ChaosCenterUiEndpoint
	scope         = utils.Config.ChaosCenterScope
	tlsCert       = utils.Config.TlsCertB64
	tlsSecretName = utils.Config.TlsSecretName
)

var subscriberConfiguration = &types.SubscriberConfigurationVars{
	AgentNamespace:           utils.Config.AgentNamespace,
	AgentScope:               utils.Config.AgentScope,
	AgentDeployments:         utils.Config.AgentDeployments,
	SubscriberImage:          utils.Config.SubscriberImage,
	EventTrackerImage:        utils.Config.EventTrackerImage,
	WorkflowControllerImage:  utils.Config.ArgoWorkflowControllerImage,
	ChaosOperatorImage:       utils.Config.LitmusChaosOperatorImage,
	WorkflowExecutorImage:    utils.Config.ArgoWorkflowExecutorImage,
	ChaosRunnerImage:         utils.Config.LitmusChaosRunnerImage,
	ChaosExporterImage:       utils.Config.LitmusChaosExporterImage,
	ContainerRuntimeExecutor: utils.Config.ContainerRuntimeExecutor,
	Version:                  utils.Config.Version,
}

// VerifyCluster utils function used to verify cluster identity
func VerifyCluster(identity model.ClusterIdentity) (*dbSchemaCluster.Cluster, error) {
	currentVersion := utils.Config.Version
	if strings.Contains(strings.ToLower(currentVersion), CIVersion) {
		if currentVersion != identity.Version {
			return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v got %v)", currentVersion, identity.Version)
		}
	} else {
		splitCPVersion := strings.Split(currentVersion, ".")
		splitSubVersion := strings.Split(identity.Version, ".")
		if len(splitSubVersion) != 3 || splitSubVersion[0] != splitCPVersion[0] || splitSubVersion[1] != splitCPVersion[1] {
			return nil, fmt.Errorf("ERROR: CLUSTER VERSION MISMATCH (need %v.%v.x got %v)", splitCPVersion[0], splitCPVersion[1], identity.Version)
		}
	}
	cluster, err := dbOperationsCluster.GetCluster(identity.ClusterID)
	if err != nil {
		return nil, err
	}

	if !(cluster.AccessKey == identity.AccessKey && cluster.IsRegistered) {
		return nil, errors.New("ERROR:  CLUSTER ID MISMATCH")
	}
	return &cluster, nil
}

func GetManifest(token string) ([]byte, int, error) {
	clusterID, err := ClusterValidateJWT(token)
	if err != nil {
		return nil, 404, err
	}

	reqCluster, err := dbOperationsCluster.GetCluster(clusterID)
	if err != nil {
		return nil, 500, err
	}

	subscriberConfiguration.GQLServerURI, err = GetEndpoint(reqCluster.ClusterType)
	if err != nil {
		return nil, 500, err
	}

	if scope == clusterScope && tlsSecretName != "" {
		subscriberConfiguration.TLSCert, err = k8s.GetTLSCert(tlsSecretName)
		if err != nil {
			return nil, 500, err
		}
	}

	if scope == namespaceScope {
		subscriberConfiguration.TLSCert = tlsCert
	}

	if !reqCluster.IsRegistered {
		var respData []byte
		if reqCluster.AgentScope == "cluster" {
			respData, err = manifestParser(reqCluster, "manifests/cluster", subscriberConfiguration)
		} else if reqCluster.AgentScope == "namespace" {
			respData, err = manifestParser(reqCluster, "manifests/namespace", subscriberConfiguration)
		} else {
			logrus.Print("ERROR- AGENT_SCOPE env is empty!")
		}
		if err != nil {
			return nil, 500, err
		}

		return respData, 200, nil
	} else {
		return []byte("Cluster is already registered"), 409, nil
	}
}

func GetEndpoint(agentType string) (string, error) {
	// returns endpoint from env, if provided by user
	if endpoint != "" {
		return endpoint + "/ws/query", nil
	}

	// generating endpoint based on ChaosCenter Scope & AgentType (Self or External)
	agentEndpoint, err := k8s.GetServerEndpoint(scope, agentType)

	if agentEndpoint == "" || err != nil {
		return "", errors.New("failed to retrieve the server endpoint")
	}

	return agentEndpoint, err
}

// GetManifestWithClusterID returns manifest for a given cluster
func GetManifestWithClusterID(clusterID string, accessKey string) ([]byte, error) {
	reqCluster, err := dbOperationsCluster.GetCluster(clusterID)
	if err != nil {
		return nil, err
	}

	// Checking if cluster with given clusterID and accesskey is present
	if reqCluster.AccessKey != accessKey {
		return nil, errors.New("Access Key is invalid")
	}

	subscriberConfiguration.GQLServerURI, err = GetEndpoint(reqCluster.ClusterType)
	if err != nil {
		return nil, err
	}

	if scope == clusterScope && tlsSecretName != "" {
		subscriberConfiguration.TLSCert, err = k8s.GetTLSCert(tlsSecretName)
		if err != nil {
			return nil, err
		}
	}

	if scope == namespaceScope {
		subscriberConfiguration.TLSCert = tlsCert
	}

	var respData []byte
	if reqCluster.AgentScope == clusterScope {
		respData, err = manifestParser(reqCluster, "manifests/cluster", subscriberConfiguration)
	} else if reqCluster.AgentScope == namespaceScope {
		respData, err = manifestParser(reqCluster, "manifests/namespace", subscriberConfiguration)
	} else {
		logrus.Print("ERROR- AGENT_SCOPE env is empty!")
	}
	if err != nil {
		return nil, err
	}

	return respData, nil
}

// ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func manifestParser(cluster dbSchemaCluster.Cluster, rootPath string, subscriberConfig *types.SubscriberConfigurationVars) ([]byte, error) {
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

		nodeselector = string(utils.AddRootIndent(byt, 6))
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

		tolerations = string(utils.AddRootIndent(byt, 6))
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
