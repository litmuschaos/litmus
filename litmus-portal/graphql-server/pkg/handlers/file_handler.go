package handlers

import (
	"errors"
	"github.com/sirupsen/logrus"
	"net/http"
	"os"

	"github.com/gorilla/mux"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

const (
	clusterScope   string = "cluster"
	namespaceScope string = "namespace"
)

var (
	endpoint      = os.Getenv("CHAOS_CENTER_UI_ENDPOINT")
	scope         = os.Getenv("CHAOS_CENTER_SCOPE")
	tlsCert       = os.Getenv("TLS_CERT_B64")
	tlsSecretName = os.Getenv("TLS_SECRET_NAME")
)

var subscriberConfiguration = &types.SubscriberConfigurationVars{
	AgentNamespace:           os.Getenv("AGENT_NAMESPACE"),
	AgentScope:               os.Getenv("AGENT_SCOPE"),
	AgentDeployments:         os.Getenv("AGENT_DEPLOYMENTS"),
	SubscriberImage:          os.Getenv("SUBSCRIBER_IMAGE"),
	EventTrackerImage:        os.Getenv("EVENT_TRACKER_IMAGE"),
	WorkflowControllerImage:  os.Getenv("ARGO_WORKFLOW_CONTROLLER_IMAGE"),
	ChaosOperatorImage:       os.Getenv("LITMUS_CHAOS_OPERATOR_IMAGE"),
	WorkflowExecutorImage:    os.Getenv("ARGO_WORKFLOW_EXECUTOR_IMAGE"),
	ChaosRunnerImage:         os.Getenv("LITMUS_CHAOS_RUNNER_IMAGE"),
	ChaosExporterImage:       os.Getenv("LITMUS_CHAOS_EXPORTER_IMAGE"),
	ContainerRuntimeExecutor: os.Getenv("CONTAINER_RUNTIME_EXECUTOR"),
	Version:                  os.Getenv("VERSION"),
}

// FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	var (
		vars  = mux.Vars(r)
		token = vars["key"]
	)

	response, statusCode, err := GetManifest(token)
	if err != nil {
		logrus.Print("error: ", err)
		utils.WriteHeaders(&w, statusCode)
	}

	utils.WriteHeaders(&w, statusCode)
	w.Write(response)
}

func GetManifest(token string) ([]byte, int, error) {
	clusterID, err := cluster.ClusterValidateJWT(token)
	if err != nil {
		return nil, 404, err
	}

	reqCluster, err := dbOperationsCluster.GetCluster(clusterID)
	if err != nil {
		return nil, 500, err
	}

	if scope == namespaceScope && endpoint == "" {
		return nil, 500, errors.New("CHAOS_CENTER_UI_ENDPOINT env is empty for namespace scope installation")
	}

	if endpoint != "" {
		subscriberConfiguration.GQLServerURI = endpoint + "/query"
	} else if scope == clusterScope {
		subscriberConfiguration.GQLServerURI, err = k8s.GetServerEndpoint()
		if err != nil {
			return nil, 500, err
		}

		if tlsSecretName != "" {
			subscriberConfiguration.TLSCert, err = k8s.GetTLSCert(tlsSecretName)
			if err != nil {
				return nil, 500, err
			}
		}
	}

	if scope == namespaceScope {
		subscriberConfiguration.TLSCert = tlsCert
	}

	if !reqCluster.IsRegistered {
		var respData []byte
		if reqCluster.AgentScope == "cluster" {
			respData, err = utils.ManifestParser(reqCluster, "manifests/cluster", subscriberConfiguration)
		} else if reqCluster.AgentScope == "namespace" {
			respData, err = utils.ManifestParser(reqCluster, "manifests/namespace", subscriberConfiguration)
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

	if scope == namespaceScope && endpoint == "" {
		return nil, errors.New("CHAOS_CENTER_UI_ENDPOINT env is empty for namespace scope installation")
	}

	if endpoint != "" {
		subscriberConfiguration.GQLServerURI = endpoint + "/query"
	} else if scope == clusterScope {
		subscriberConfiguration.GQLServerURI, err = k8s.GetServerEndpoint()
		if err != nil {
			return nil, err
		}

		if tlsSecretName != "" {
			subscriberConfiguration.TLSCert, err = k8s.GetTLSCert(tlsSecretName)
			if err != nil {
				return nil, err
			}
		}
	}

	if scope == namespaceScope {
		subscriberConfiguration.TLSCert = tlsCert
	}

	var respData []byte
	if reqCluster.AgentScope == clusterScope {
		respData, err = utils.ManifestParser(reqCluster, "manifests/cluster", subscriberConfiguration)
	} else if reqCluster.AgentScope == namespaceScope {
		respData, err = utils.ManifestParser(reqCluster, "manifests/namespace", subscriberConfiguration)
	} else {
		logrus.Print("ERROR- AGENT_SCOPE env is empty!")
	}
	if err != nil {
		return nil, err
	}

	return respData, nil
}
