package self_deployer

import (
	"encoding/json"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
)

// StartDeployer registers a new internal self-cluster and starts the deployer
func StartDeployer(clusterService cluster.Service, projectID string) {
	var (
		isAllManifestInstall  = true
		deployerNamespace     = utils.Config.AgentNamespace
		agentScope            = utils.Config.AgentScope
		skipSSL               = utils.Config.SkipSslVerify
		selfAgentNodeSelector = utils.Config.SelfAgentNodeSelector
		selfAgentTolerations  = utils.Config.SelfAgentTolerations

		failedManifest string
	)

	tolerations := []*model.Toleration{}
	nodeSelector := &selfAgentNodeSelector

	if selfAgentNodeSelector == "" {
		nodeSelector = nil
	}

	if selfAgentTolerations != "" {
		err := json.Unmarshal([]byte(selfAgentTolerations), &tolerations)
		if err != nil {
			log.Error("self cluster reg failed[toleration-parsing]: ", err)
			// if toleration parsing fails skip actual manifest apply
			return
		}
	} else {
		tolerations = nil
	}

	clusterInput := model.RegisterClusterRequest{
		ProjectID:      projectID,
		ClusterName:    "Self-Agent",
		ClusterType:    "internal",
		PlatformName:   "others",
		AgentScope:     agentScope,
		AgentNamespace: &deployerNamespace,
		NodeSelector:   nodeSelector,
		Tolerations:    tolerations,
	}

	if strings.ToLower(skipSSL) == "true" {
		skip := true
		clusterInput.SkipSsl = &skip
	}

	resp, err := clusterService.RegisterCluster(clusterInput)
	if err != nil {
		log.Error("self cluster reg failed[db-reg]: ", err)
		// if cluster registration fails skip actual manifest apply
		return
	}

	response, statusCode, err := clusterService.GetManifest(resp.Token)
	if err != nil {
		log.Error(err)
	}

	if statusCode == 200 {
		manifests := strings.Split(string(response), "---")
		for _, manifest := range manifests {
			if len(strings.TrimSpace(manifest)) > 0 {
				_, err = clusterService.GetClusterResource(manifest, deployerNamespace)
				if err != nil {
					log.Error(err)
					failedManifest = failedManifest + manifest
					isAllManifestInstall = false
				}
			}

		}
	}

	if isAllManifestInstall == true {
		log.Info("all manifests has been installed")
	} else {
		log.Error("some manifests has not been installed: ", failedManifest)
	}
}
