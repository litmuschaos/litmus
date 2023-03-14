package cluster

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/ghodss/yaml"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
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

type subscriberConfigurations struct {
	ServerEndpoint string
	TLSCert        string
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
		return nil, fmt.Errorf("ERROR:  CLUSTER_ID MISMATCH")
	}
	return &cluster, nil
}

func GetManifest(token string) ([]byte, int, error) {
	clusterID, err := ClusterValidateJWT(token)
	if err != nil {
		return nil, http.StatusNotFound, err
	}

	reqCluster, err := dbOperationsCluster.GetCluster(clusterID)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	var config subscriberConfigurations
	config.ServerEndpoint, err = GetEndpoint(reqCluster.ClusterType)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	var scope = utils.Config.ChaosCenterScope
	if scope == clusterScope && utils.Config.TlsSecretName != "" {
		config.TLSCert, err = k8s.GetTLSCert(utils.Config.TlsSecretName)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}
	}

	if scope == namespaceScope {
		config.TLSCert = utils.Config.TlsCertB64
	}

	if !reqCluster.IsRegistered {
		var respData []byte
		if reqCluster.AgentScope == "cluster" {
			respData, err = manifestParser(reqCluster, "manifests/cluster", &config)
		} else if reqCluster.AgentScope == "namespace" {
			respData, err = manifestParser(reqCluster, "manifests/namespace", &config)
		} else {
			logrus.Error("AGENT_SCOPE env is empty!")
		}
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		return respData, http.StatusOK, nil
	} else {
		return []byte("Cluster is already registered"), http.StatusConflict, nil
	}
}

func GetEndpoint(agentType string) (string, error) {
	// returns endpoint from env, if provided by user
	if utils.Config.ChaosCenterUiEndpoint != "" {
		return utils.Config.ChaosCenterUiEndpoint + "/ws/query", nil
	}

	// generating endpoint based on ChaosCenter Scope & AgentType (Self or External)
	agentEndpoint, err := k8s.GetServerEndpoint(utils.Config.ChaosCenterScope, agentType)

	if agentEndpoint == "" || err != nil {
		return "", fmt.Errorf("failed to retrieve the server endpoint %v", err)
	}

	return agentEndpoint, err
}

// GetManifestWithClusterID returns manifest for a given cluster
func GetManifestWithClusterID(clusterID string, accessKey string) ([]byte, error) {
	reqCluster, err := dbOperationsCluster.GetCluster(clusterID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve the cluster %v", err)
	}

	// Checking if cluster with given clusterID and accesskey is present
	if reqCluster.AccessKey != accessKey {
		return nil, fmt.Errorf("ACCESS_KEY is invalid")
	}

	var config subscriberConfigurations
	config.ServerEndpoint, err = GetEndpoint(reqCluster.ClusterType)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve the server endpoint %v", err)
	}

	var scope = utils.Config.ChaosCenterScope
	if scope == clusterScope && utils.Config.TlsSecretName != "" {
		config.TLSCert, err = k8s.GetTLSCert(utils.Config.TlsSecretName)
		if err != nil {
			return nil, fmt.Errorf("failed to retrieve the tls cert %v", err)
		}
	}

	if scope == namespaceScope {
		config.TLSCert = utils.Config.TlsCertB64
	}

	var respData []byte
	if reqCluster.AgentScope == clusterScope {
		respData, err = manifestParser(reqCluster, "manifests/cluster", &config)
	} else if reqCluster.AgentScope == namespaceScope {
		respData, err = manifestParser(reqCluster, "manifests/namespace", &config)
	} else {
		logrus.Error("AGENT_SCOPE env is empty")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to parse the manifest %v", err)
	}

	return respData, nil
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
			NodeSelector map[string]string `yaml:"nodeSelector"`
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
			Tolerations []*dbSchemaCluster.Toleration `yaml:"tolerations"`
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

		newContent = strings.Replace(newContent, "#{tolerations}", tolerations, -1)
		newContent = strings.Replace(newContent, "#{CLUSTER_ID}", cluster.ClusterID, -1)
		newContent = strings.Replace(newContent, "#{ACCESS_KEY}", cluster.AccessKey, -1)
		newContent = strings.Replace(newContent, "#{SERVER_ADDR}", config.ServerEndpoint, -1)
		newContent = strings.Replace(newContent, "#{SUBSCRIBER-IMAGE}", utils.Config.SubscriberImage, -1)
		newContent = strings.Replace(newContent, "#{EVENT-TRACKER-IMAGE}", utils.Config.EventTrackerImage, -1)
		newContent = strings.Replace(newContent, "#{AGENT-NAMESPACE}", AgentNamespace, -1)
		newContent = strings.Replace(newContent, "#{SUBSCRIBER-SERVICE-ACCOUNT}", ServiceAccountName, -1)
		newContent = strings.Replace(newContent, "#{AGENT-SCOPE}", cluster.AgentScope, -1)
		newContent = strings.Replace(newContent, "#{ARGO-WORKFLOW-CONTROLLER}", utils.Config.WorkflowHelperImageVersion, -1)
		newContent = strings.Replace(newContent, "#{LITMUS-CHAOS-OPERATOR}", utils.Config.LitmusChaosOperatorImage, -1)
		newContent = strings.Replace(newContent, "#{ARGO-WORKFLOW-EXECUTOR}", utils.Config.ArgoWorkflowExecutorImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS-CHAOS-RUNNER}", utils.Config.LitmusChaosRunnerImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS-CHAOS-EXPORTER}", utils.Config.LitmusChaosExporterImage, -1)
		newContent = strings.Replace(newContent, "#{ARGO-CONTAINER-RUNTIME-EXECUTOR}", utils.Config.ContainerRuntimeExecutor, -1)
		newContent = strings.Replace(newContent, "#{AGENT-DEPLOYMENTS}", utils.Config.AgentDeployments, -1)
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
			newContent = strings.Replace(newContent, "#{nodeselector}", nodeselector, -1)
		}
		generatedYAML = append(generatedYAML, newContent)
	}

	return []byte(strings.Join(generatedYAML, "\n")), nil
}
