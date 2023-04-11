package projects

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/chaoshub"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsImageRegistry "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/image_registry"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	imageRegistry "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/image_registry"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"

	"google.golang.org/protobuf/types/known/wrapperspb"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub"
	selfDeployer "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/self-deployer"
	pb "github.com/litmuschaos/litmus/litmus-portal/graphql-server/protos"
)

// InitializeProject implements project.ProjectServer
func (s *ProjectServer) InitializeProject(ctx context.Context, req *pb.ProjectInitializationRequest) (*wrapperspb.BoolValue, error) {
	res := &wrapperspb.BoolValue{Value: false}

	// Check request
	if req == nil {
		return res, fmt.Errorf("request must not be nil")
	}

	if req.ProjectID == "" {
		return res, fmt.Errorf("empty field in the request")
	}

	// ProjectInitializer initializes the project by creating instances for required stateful services
	err := ProjectInitializer(ctx, req.ProjectID, req.Role, s.Operator)
	if err != nil {
		return res, fmt.Errorf("failed to initialize project, %w", err)
	} else {
		return &wrapperspb.BoolValue{Value: true}, nil
	}
}

// ProjectInitializer creates a default hub and default image registry for a new project
func ProjectInitializer(ctx context.Context, projectID string, role string, operator mongodb.MongoOperator) error {

	var (
		selfCluster = utils.Config.SelfAgent
		bl_true     = true
	)

	defaultHub := model.CreateChaosHubRequest{
		ProjectID:  projectID,
		HubName:    "Litmus ChaosHub",
		RepoURL:    "https://github.com/litmuschaos/chaos-charts",
		RepoBranch: utils.Config.HubBranchName,
	}

	log.Print("Cloning https://github.com/litmuschaos/chaos-charts")

	//TODO: Remove goroutine after adding hub optimisations
	go chaoshub.NewService(dbSchemaChaosHub.NewChaosHubOperator(operator)).AddChaosHub(context.Background(), defaultHub)

	_, err := imageRegistry.NewService(
		dbOperationsImageRegistry.NewImageRegistryOperator(operator),
	).CreateImageRegistry(ctx, projectID, model.ImageRegistryInput{
		IsDefault:         bl_true,
		ImageRegistryName: "docker.io",
		ImageRepoName:     "litmuschaos",
		ImageRegistryType: "public",
		SecretName:        nil,
		SecretNamespace:   nil,
		EnableRegistry:    &bl_true,
	})

	if strings.ToLower(selfCluster) == "true" && strings.ToLower(role) == "admin" {
		log.Print("Starting self deployer")
		go selfDeployer.StartDeployer(cluster.NewService(
			dbSchemaCluster.NewClusterOperator(operator),
			dbOperationsWorkflow.NewChaosWorkflowOperator(operator),
		), projectID)
	}

	return err
}
