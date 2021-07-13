package file_handlers

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

var subscriberConfiguration = &types.SubscriberConfigurationVars{
	AgentNamespace:           os.Getenv("AGENT_NAMESPACE"),
	AgentScope:               os.Getenv("AGENT_SCOPE"),
	SubscriberImage:          os.Getenv("SUBSCRIBER_IMAGE"),
	EventTrackerImage:        os.Getenv("EVENT_TRACKER_IMAGE"),
	WorkflowControllerImage:  os.Getenv("ARGO_WORKFLOW_CONTROLLER_IMAGE"),
	ChaosOperatorImage:       os.Getenv("LITMUS_CHAOS_OPERATOR_IMAGE"),
	WorkflowExecutorImage:    os.Getenv("ARGO_WORKFLOW_EXECUTOR_IMAGE"),
	ChaosRunnerImage:         os.Getenv("LITMUS_CHAOS_RUNNER_IMAGE"),
	ChaosExporterImage:       os.Getenv("LITMUS_CHAOS_EXPORTER_IMAGE"),
	ContainerRuntimeExecutor: os.Getenv("CONTAINER_RUNTIME_EXECUTOR"),
}

// FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	var (
		vars  = mux.Vars(r)
		token = vars["key"]
	)

	response, statusCode, err := GetManifest(token)
	if err != nil {
		log.Print("error: ", err)
		utils.WriteHeaders(&w, statusCode)
	}

	utils.WriteHeaders(&w, statusCode)
	w.Write(response)
}

func GetManifest(token string) ([]byte, int, error) {

	id, err := cluster.ClusterValidateJWT(token)
	if err != nil {
		return nil, 404, err
	}

	reqCluster, err := dbOperationsCluster.GetCluster(id)
	if err != nil {
		return nil, 500, err
	}

	if os.Getenv("PORTAL_SCOPE") == "cluster" {
		subscriberConfiguration.GQLServerURI, err = k8s.GetServerEndpoint()
		if err != nil {
			return nil, 500, err
		}
	} else if os.Getenv("PORTAL_SCOPE") == "namespace" {
		subscriberConfiguration.GQLServerURI = os.Getenv("PORTAL_ENDPOINT") + "/query"
	}

	if !reqCluster.IsRegistered {
		var respData []byte

		if reqCluster.AgentScope == "cluster" {
			respData, err = utils.ManifestParser(reqCluster, "manifests/cluster", subscriberConfiguration)
		} else if reqCluster.AgentScope == "namespace" {
			respData, err = utils.ManifestParser(reqCluster, "manifests/namespace", subscriberConfiguration)
		} else {
			log.Print("ERROR- AGENT SCOPE NOT SELECTED!")
		}
		if err != nil {
			return nil, 500, err
		}

		return respData, 200, nil
	} else {
		return []byte("Cluster is already registered"), 409, nil
	}
}
