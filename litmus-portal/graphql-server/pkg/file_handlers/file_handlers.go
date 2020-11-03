package file_handlers

import (
	"log"
	"net/http"
	"os"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"

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
	)
	log.Print("here")
	log.Print(token)

	response, statusCode, err := GetManifest(token)
	if err != nil{
		log.Print("error", err)
		utils.WriteHeaders(&w, statusCode)
	}
	//log.Print(response)
	log.Print("here")

	utils.WriteHeaders(&w, statusCode)
	w.Write(response)
}

func GetManifest(token string) ([]byte, int, error) {
	var (
		portalEndpoint string
	)

	id, err := cluster.ClusterValidateJWT(token)
	if err != nil {
		log.Print("ERROR", err)
		return nil, 404, err
	}

	reqCluster, err := database.GetCluster(id)
	if err != nil {
		log.Print("ERROR", err)
		return nil, 500, err
	}

	if os.Getenv("PORTAL_SCOPE") == "cluster" {
		portalEndpoint, err = k8s.GetPortalEndpoint()
		if err != nil {
			return nil, 500, err
		}
	} else if os.Getenv("PORTAL_SCOPE") == "namespace" {
		portalEndpoint = os.Getenv("PORTAL_ENDPOINT")
	}

	subscriberConfiguration.GQLServerURI = portalEndpoint + "/query"
	log.Print(reqCluster)
	if !reqCluster.IsRegistered {
		var respData []byte

		if reqCluster.AgentScope == "cluster" {
			respData, err = utils.ManifestParser(reqCluster, "manifests/cluster-subscriber.yml", subscriberConfiguration)
				log.Print("found it")

			//log.Print(respData)
			//log.Print(err)
			//if err != nil {
			//	log.Print("found it")
			//	return nil, 500, err
			//}
		} else if reqCluster.AgentScope == "namespace" {
			respData, err = utils.ManifestParser(reqCluster, "manifests/namespace-subscriber.yml", subscriberConfiguration)
			if err != nil {
				return nil, 500, err
			}
		} else {
			log.Print("ERROR- AGENT SCOPE NOT SELECTED!")
		}

		//utils.WriteHeaders(&w, 200)
		//w.Write(respData)
		return respData, 200, nil
	} else {
		return []byte("Cluster is already registered"), 200, nil
	}

}