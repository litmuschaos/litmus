package chaos_infrastructure

import (
	"fmt"

	"github.com/ghodss/yaml"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/k8s"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	"github.com/sirupsen/logrus"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	"io/ioutil"
	"os"
	"strings"
)

type SubscriberConfigurations struct {
	ServerEndpoint string
	TLSCert        string
}

func GetEndpoint(agentType string) (string, error) {
	// returns endpoint from env, if provided by user
	if utils.Config.ChaosCenterUiEndpoint != "" {
		return utils.Config.ChaosCenterUiEndpoint + "/ws/query", nil
	}

	// generating endpoint based on ChaosCenter Scope & InfraType (Self or External)
	agentEndpoint, err := k8s.GetServerEndpoint(utils.Config.ChaosCenterScope, agentType)

	if agentEndpoint == "" || err != nil {
		return "", fmt.Errorf("failed to retrieve the server endpoint %v", err)
	}

	return agentEndpoint, err
}

func GetK8sInfraYaml(infra dbChaosInfra.ChaosInfra) ([]byte, error) {

	var config SubscriberConfigurations
	endpoint, err := GetEndpoint(infra.InfraType)
	if err != nil {
		return nil, err
	}
	config.ServerEndpoint = endpoint

	var scope = utils.Config.ChaosCenterScope
	if scope == ClusterScope && utils.Config.TlsSecretName != "" {
		config.TLSCert, err = k8s.GetTLSCert(utils.Config.TlsSecretName)
		if err != nil {
			return nil, err
		}
	}

	if scope == NamespaceScope {
		config.TLSCert = utils.Config.TlsCertB64
	}

	var respData []byte
	if infra.InfraScope == ClusterScope {
		respData, err = ManifestParser(infra, "manifests/cluster", &config)
	} else if infra.InfraScope == NamespaceScope {
		respData, err = ManifestParser(infra, "manifests/namespace", &config)
	} else {
		logrus.Error("INFRA_SCOPE env is empty!")
	}
	if err != nil {
		return nil, err
	}

	return respData, nil
}

// ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func ManifestParser(infra dbChaosInfra.ChaosInfra, rootPath string, config *SubscriberConfigurations) ([]byte, error) {
	var (
		generatedYAML             []string
		defaultState              = false
		InfraNamespace            string
		ServiceAccountName        string
		DefaultInfraNamespace     = "litmus"
		DefaultServiceAccountName = "litmus"
	)

	if infra.InfraNsExists == nil {
		infra.InfraNsExists = &defaultState
	}
	if infra.InfraSaExists == nil {
		infra.InfraSaExists = &defaultState
	}

	if infra.InfraNamespace != nil && *infra.InfraNamespace != "" {
		InfraNamespace = *infra.InfraNamespace
	} else {
		InfraNamespace = DefaultInfraNamespace
	}

	if infra.ServiceAccount != nil && *infra.ServiceAccount != "" {
		ServiceAccountName = *infra.ServiceAccount
	} else {
		ServiceAccountName = DefaultServiceAccountName
	}

	skipSSL := "false"
	if infra.SkipSSL != nil && *infra.SkipSSL {
		skipSSL = "true"
	}

	var (
		namespaceConfig   = "---\napiVersion: v1\nkind: Namespace\nmetadata:\n  name: " + InfraNamespace + "\n"
		serviceAccountStr = "---\napiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: " + ServiceAccountName + "\n  namespace: " + InfraNamespace + "\n"
	)

	// Checking if the agent namespace does not exist and its scope of installation is not namespaced
	if *infra.InfraNsExists == false && infra.InfraScope != "namespace" {
		generatedYAML = append(generatedYAML, fmt.Sprintf(namespaceConfig))
	}

	if *infra.InfraSaExists == false {
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
	if infra.NodeSelector != nil {
		selector := strings.Split(*infra.NodeSelector, ",")
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
	if infra.Tolerations != nil {
		byt, err := yaml.Marshal(struct {
			Tolerations []*dbChaosInfra.Toleration `yaml:"tolerations" json:"tolerations"`
		}{
			Tolerations: infra.Tolerations,
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
		newContent = strings.Replace(newContent, "#{INFRA_ID}", infra.InfraID, -1)
		newContent = strings.Replace(newContent, "#{ACCESS_KEY}", infra.AccessKey, -1)
		newContent = strings.Replace(newContent, "#{SERVER_ADDR}", config.ServerEndpoint, -1)
		newContent = strings.Replace(newContent, "#{SUBSCRIBER_IMAGE}", utils.Config.SubscriberImage, -1)
		newContent = strings.Replace(newContent, "#{EVENT_TRACKER_IMAGE}", utils.Config.EventTrackerImage, -1)
		newContent = strings.Replace(newContent, "#{INFRA_NAMESPACE}", InfraNamespace, -1)
		newContent = strings.Replace(newContent, "#{SUBSCRIBER_SERVICE_ACCOUNT}", ServiceAccountName, -1)
		newContent = strings.Replace(newContent, "#{INFRA_SCOPE}", infra.InfraScope, -1)
		newContent = strings.Replace(newContent, "#{ARGO_WORKFLOW_CONTROLLER}", utils.Config.ArgoWorkflowControllerImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS_CHAOS_OPERATOR}", utils.Config.LitmusChaosOperatorImage, -1)
		newContent = strings.Replace(newContent, "#{ARGO_WORKFLOW_EXECUTOR}", utils.Config.ArgoWorkflowExecutorImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS_CHAOS_RUNNER}", utils.Config.LitmusChaosRunnerImage, -1)
		newContent = strings.Replace(newContent, "#{LITMUS_CHAOS_EXPORTER}", utils.Config.LitmusChaosExporterImage, -1)
		newContent = strings.Replace(newContent, "#{ARGO_CONTAINER_RUNTIME_EXECUTOR}", utils.Config.ContainerRuntimeExecutor, -1)
		newContent = strings.Replace(newContent, "#{INFRA_DEPLOYMENTS}", utils.Config.InfraDeployments, -1)
		newContent = strings.Replace(newContent, "#{VERSION}", utils.Config.Version, -1)
		newContent = strings.Replace(newContent, "#{SKIP_SSL_VERIFY}", skipSSL, -1)
		newContent = strings.Replace(newContent, "#{CUSTOM_TLS_CERT}", config.TLSCert, -1)

		newContent = strings.Replace(newContent, "#{START_TIME}", "\""+infra.StartTime+"\"", -1)
		if infra.IsInfraConfirmed == true {
			newContent = strings.Replace(newContent, "#{IS_INFRA_CONFIRMED}", "\""+"true"+"\"", -1)
		} else {
			newContent = strings.Replace(newContent, "#{IS_INFRA_CONFIRMED}", "\""+"false"+"\"", -1)
		}

		if infra.NodeSelector != nil {
			newContent = strings.Replace(newContent, "#{NODE_SELECTOR}", nodeselector, -1)
		}
		generatedYAML = append(generatedYAML, newContent)
	}

	return []byte(strings.Join(generatedYAML, "\n")), nil
}

// SendRequestToSubscriber sends events from the graphQL server to the subscribers listening for the requests
func SendRequestToSubscriber(subscriberRequest SubscriberRequests, r store.StateData) {
	if utils.Config.ChaosCenterScope == string(model.InfraScopeCluster) {
		/*
			namespace = Obtain from WorkflowManifest or
			from frontend as a separate workflowNamespace field under ChaosWorkFlowRequest model
			for CreateChaosWorkflow mutation to be passed to this function.
		*/
	}
	newAction := &model.InfraActionResponse{
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
	if observer, ok := r.ConnectedInfra[subscriberRequest.InfraID]; ok {
		observer <- newAction
	}
	r.Mutex.Unlock()
}

// SendExperimentToSubscriber sends the workflow to the subscriber to be handled
func SendExperimentToSubscriber(projectID string, workflow *model.ChaosExperimentRequest, username *string, externalData *string, reqType string, r *store.StateData) {

	var workflowObj unstructured.Unstructured
	err := yaml.Unmarshal([]byte(workflow.ExperimentManifest), &workflowObj)
	if err != nil {
		fmt.Errorf("error while parsing experiment manifest %v", err)
	}

	SendRequestToSubscriber(SubscriberRequests{
		K8sManifest:  workflow.ExperimentManifest,
		RequestType:  reqType,
		ProjectID:    projectID,
		InfraID:      workflow.InfraID,
		Namespace:    workflowObj.GetNamespace(),
		ExternalData: externalData,
		Username:     username,
	}, *r)
}
