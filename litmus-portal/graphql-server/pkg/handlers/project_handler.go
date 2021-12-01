package handlers

import (
	"context"
	"fmt"
	"log"
	"os"

	"google.golang.org/protobuf/types/known/wrapperspb"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	imageRegistryOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/image_registry/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
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
	err := ProjectInitializer(ctx, req.ProjectID)
	if err != nil {
		return res, fmt.Errorf("failed to initialize project, %w", err)
	} else {
		return &wrapperspb.BoolValue{Value: true}, nil
	}
}

// ProjectInitializer creates a default hub and default image registry for a new project
func ProjectInitializer(ctx context.Context, projectID string) error {

	var bl_true = true

	defaultHub := model.CreateMyHub{
		HubName:    "Litmus ChaosHub",
		RepoURL:    "https://github.com/litmuschaos/chaos-charts",
		RepoBranch: os.Getenv("HUB_BRANCH_NAME"),
	}

	log.Print("Cloning https://github.com/litmuschaos/chaos-charts")
	//TODO: Remove goroutine after adding hub optimisations
	go myhub.AddMyHub(context.Background(), defaultHub, projectID)

	_, err := imageRegistryOps.CreateImageRegistry(ctx, projectID, model.ImageRegistryInput{
		IsDefault:         bl_true,
		ImageRegistryName: "docker.io",
		ImageRepoName:     "litmuschaos",
		ImageRegistryType: "public",
		SecretName:        nil,
		SecretNamespace:   nil,
		EnableRegistry:    &bl_true,
	})

	return err
}
