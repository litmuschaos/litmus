package self_deployer

import (
	"encoding/json"
	"log"
	"os"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/graphql/mutations"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
)

// StartDeployer registers a new internal self-cluster and starts the deployer
func StartDeployer(projectId string) {
	log.Print("STARTING SELF-DEPLOYER")
	DEPLOYER_NAMESPACE := os.Getenv("DEPLOYER_NAMESPACE")

	clusterInput := model.ClusterInput{
		ProjectID:    projectId,
		ClusterName:  "Self-Cluster",
		ClusterType:  "internal",
		PlatformName: "others",
	}
	key, err := mutations.ClusterRegister(clusterInput)
	if err != nil {
		log.Print("SELF CLUSTER REG FAILED[DB-REG] : ", err)
	}
	response, err := k8s.CreateDeployment(DEPLOYER_NAMESPACE, key)
	if err != nil {
		log.Print("SELF CLUSTER REG FAILED[DEPLOY-CREATION] : ", err)
	}
	responseData, err := json.Marshal(response)
	if err != nil {
		log.Print("SELF CLUSTER REG FAILED[JSON-MARSHAL] : ", err)
	}
	log.Print("SELF-DEPLOYER DEPLOYMENT RESPONSE : ", string(responseData))
}
