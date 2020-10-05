package file_handlers

import (
	"log"
	"net/http"
	"os"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/types"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

//FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	subscriberConfiguration := &types.SubscriberConfigurationVars{
		Server:          os.Getenv("SERVICE_ADDRESS") + "/query",
		SubscriberImage: os.Getenv("SUBSCRIBER_IMAGE"),
		SubscriberNS:    os.Getenv("DEPLOYER_NAMESPACE"),
		SubscriberSC:    os.Getenv("SUBSCRIBER_SCOPE"),
		WorkflowSC:      os.Getenv("AGENT_SCOPE"),
		WorkflowNS:      os.Getenv("AGENT_NAMESPACE"),
		ArgoSER:         os.Getenv("ARGO_SERVER_IMAGE"),
		ArgoWFCTRL:      os.Getenv("ARGO_WORKFLOW_CONTROLLER_IMAGE"),
		LitmusCOP:       os.Getenv("LITMUS_CHAOS_OPERATOR_IMAGE"),
		ArgoWFEXEC:      os.Getenv("ARGO_WORKFLOW_EXECUTOR_IMAGE"),
		LitmusCRUN:      os.Getenv("LITMUS_CHAOS_RUNNER_IMAGE"),
	}
	vars := mux.Vars(r)
	token := vars["key"]

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

	if !reqCluster.IsRegistered {
		var respData []byte

		if subscriberConfiguration.SubscriberSC == "cluster" {
			respData, err = utils.ManifestParser(reqCluster.ClusterID, reqCluster.AccessKey, subscriberConfiguration, "manifests/cluster-subscriber.yml")
		} else if subscriberConfiguration.SubscriberSC == "namespace" {
			respData, err = utils.ManifestParser(reqCluster.ClusterID, reqCluster.AccessKey, subscriberConfiguration, "manifests/namespace-subscriber.yml")
		} else {
			log.Print("ERROR- PORTAL SCOPE NOT SELECTED!")
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
