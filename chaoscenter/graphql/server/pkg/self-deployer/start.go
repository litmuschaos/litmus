package self_deployer

import (
	"context"
	"encoding/json"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	chaos_infra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"

	"log"
	"strings"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/k8s"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
)

// StartDeployer registers a new internal self-infra and starts the deployer
func StartDeployer(projectID string, mongoOp mongodb.MongoOperator) {
	var (
		isAllManifestInstall           = true
		deployerNamespace              = utils.Config.InfraDeployments
		agentScope                     = utils.Config.InfraScope
		skipSSL                        = utils.Config.SkipSslVerify
		selfInfrastructureNodeSelector = utils.Config.SelfInfraNodeSelector
		selfInfrastructureTolerations  = utils.Config.SelfInfraTolerations

		failedManifest string
	)

	tolerations := []*model.Toleration{}
	nodeSelector := &selfInfrastructureNodeSelector

	if selfInfrastructureNodeSelector == "" {
		nodeSelector = nil
	}

	if selfInfrastructureTolerations != "" {
		err := json.Unmarshal([]byte(selfInfrastructureTolerations), &tolerations)
		if err != nil {
			log.Print("SELF CLUSTER REG FAILED[TOLERATION-PARSING] : ", err)
			// if toleration parsing fails skip actual manifest apply
			return
		}
	} else {
		tolerations = nil
	}

	infraInput := model.RegisterInfraRequest{
		Name:               "Self-Infrastructure",
		InfrastructureType: model.InfrastructureTypeInternal,
		PlatformName:       "others",
		InfraScope:         agentScope,
		InfraNamespace:     &deployerNamespace,
		NodeSelector:       nodeSelector,
		Tolerations:        tolerations,
	}

	if strings.ToLower(skipSSL) == "true" {
		skip := true
		infraInput.SkipSsl = &skip
	}

	infraOps := chaos_infrastructure.NewInfrastructureOperator(mongoOp)
	infrastructureService := chaos_infra.NewChaosInfrastructureService(infraOps)
	resp, err := infrastructureService.RegisterInfra(context.Background(), projectID, infraInput)
	if err != nil {
		log.Print("SELF CLUSTER REG FAILED[DB-REG] : ", err)
		// if infra registration fails skip actual manifest apply
		return
	}

	response, statusCode, err := infrastructureService.GetManifest(resp.Token)
	if err != nil {
		log.Print("ERROR", err)
	}

	if statusCode == 200 {
		manifests := strings.Split(string(response), "---")
		for _, manifest := range manifests {
			if len(strings.TrimSpace(manifest)) > 0 {
				_, err = k8s.InfraResource(manifest, deployerNamespace)
				if err != nil {
					log.Print(err)
					failedManifest = failedManifest + manifest
					isAllManifestInstall = false
				}
			}

		}
	}

	if isAllManifestInstall == true {
		log.Print("ALL MANIFESTS HAS BEEN INSTALLED:")
	} else {
		log.Print("SOME MANIFESTS HAS NOT BEEN INSTALLED:", failedManifest)
	}
}
