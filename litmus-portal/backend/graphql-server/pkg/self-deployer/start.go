package self_deployer

import (
	"encoding/json"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/graphql/mutations"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/k8s"
)

// StartDeployer registers a new internal self-cluster and starts the deployer
func StartDeployer(projectId string) {
	log.Print("STARTING SELF-DEPLOYER")
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
	response, err := k8s.CreateDeployment("litmus", key)
	if err != nil {
		log.Print("SELF CLUSTER REG FAILED[DEPLOY-CREATION] : ", err)
	}
	responseData, err := json.Marshal(response)
	if err != nil {
		log.Print("SELF CLUSTER REG FAILED[JSON-MARSHAL] : ", err)
	}
	log.Print("SELF-DEPLOYER DEPLOYMENT RESPONSE : ", string(responseData))
}
