package self_deployer

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/file_handlers"
	"log"
	"os"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/graphql/mutations"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
)

// StartDeployer registers a new internal self-cluster and starts the deployer
func StartDeployer(projectID string) {
	var (
		isAllManifestInstall = true
		deployerNamespace    = os.Getenv("AGENT_NAMESPACE")
		agentScope           = os.Getenv("AGENT_SCOPE")
		failedManifest       string
	)

	clusterInput := model.ClusterInput{
		ProjectID:      projectID,
		ClusterName:    "Self-Cluster",
		ClusterType:    "internal",
		PlatformName:   "others",
		AgentScope:     agentScope,
		AgentNamespace: &deployerNamespace,
	}

	resp, err := mutations.ClusterRegister(clusterInput)
	if err != nil {
		log.Print("SELF CLUSTER REG FAILED[DB-REG] : ", err)
	}

	response, statusCode, err := file_handlers.GetManifest(resp.Token)
	if err != nil {
		log.Print("ERROR", err)
	}

	if statusCode == 200 {
		manifests := strings.Split(string(response), "---")
		for _, manifest := range manifests {
			_, err = k8s.ClusterResource(manifest, deployerNamespace)
			if err != nil {
				log.Print(err)
				failedManifest = failedManifest + manifest
				isAllManifestInstall = false
			}
		}
	}

	if isAllManifestInstall == true {
		log.Print("ALL MANIFESTS HAS BEEN INSTALLED:")
	} else {
		log.Print("SOME MANIFESTS HAS NOT BEEN INSTALLED:", failedManifest)
	}
}
