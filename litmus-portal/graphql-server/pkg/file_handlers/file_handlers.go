package file_handlers

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

var subscriberConfiguration = &types.SubscriberConfigurationVars{
	AgentNamespace:          os.Getenv("AGENT_NAMESPACE"),
	AgentScope:              os.Getenv("AGENT_SCOPE"),
	SubscriberImage:         os.Getenv("SUBSCRIBER_IMAGE"),
	ArgoServerImage:         os.Getenv("ARGO_SERVER_IMAGE"),
	WorkflowControllerImage: os.Getenv("ARGO_WORKFLOW_CONTROLLER_IMAGE"),
	ChaosOperatorImage:      os.Getenv("LITMUS_CHAOS_OPERATOR_IMAGE"),
	WorkflowExecutorImage:   os.Getenv("ARGO_WORKFLOW_EXECUTOR_IMAGE"),
	ChaosRunnerImage:        os.Getenv("LITMUS_CHAOS_RUNNER_IMAGE"),
}

//FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	var (
		vars           = mux.Vars(r)
		token          = vars["key"]
		portalEndpoint string
	)

	id, err := cluster.ClusterValidateJWT(token)
	if err != nil {
		log.Print("ERROR", err)
		utils.WriteHeaders(&w, 404)
		return
	}

	reqCluster, err := database.GetCluster(id)
	if err != nil {
		log.Print("ERROR", err)
		utils.WriteHeaders(&w, 500)
		return
	}

	if os.Getenv("PORTAL_SCOPE") == "cluster" {
		portalEndpoint, err = k8s.GetPortalEndpoint()
		if err != nil {
			log.Print(err)
		}
	} else if os.Getenv("PORTAL_SCOPE") == "namespace" {
		portalEndpoint = os.Getenv("PORTAL_ENDPOINT")
	}

	subscriberConfiguration.GQLServerURI = portalEndpoint + "/query"

	if !reqCluster.IsRegistered {
		var respData []byte

		if subscriberConfiguration.AgentScope == "cluster" {
			respData, err = utils.ManifestParser(reqCluster.ClusterID, reqCluster.AccessKey, "manifests/cluster-subscriber.yml", subscriberConfiguration)
		} else if subscriberConfiguration.AgentScope == "namespace" {
			respData, err = utils.ManifestParser(reqCluster.ClusterID, reqCluster.AccessKey, "manifests/namespace-subscriber.yml", subscriberConfiguration)
		} else {
			log.Print("ERROR- AGENT SCOPE NOT SELECTED!")
		}

		if err != nil {
			log.Print("ERROR", err)
			utils.WriteHeaders(&w, 500)
			return
		}
		utils.WriteHeaders(&w, 200)
		w.Write(respData)
		return
	}

	utils.WriteHeaders(&w, 404)
}
