package projects

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"

	"google.golang.org/protobuf/types/known/wrapperspb"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	imageRegistryOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/image_registry/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
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
	err := ProjectInitializer(ctx, req.ProjectID)
	if err != nil {
		return res, fmt.Errorf("failed to initialize project, %w", err)
	} else {
		return &wrapperspb.BoolValue{Value: true}, nil
	}
}

// ProjectInitializer creates a default hub and default image registry for a new project
func ProjectInitializer(ctx context.Context, projectID string) error {

	var (
		selfCluster = os.Getenv("SELF_CLUSTER")
		bl_true     = true
	)

	// Extracting role from token
	jwtToken := ctx.Value(authorization.AuthKey).(string)
	fmt.Println("token", jwtToken)
	token, _ := jwt.Parse(jwtToken, nil)
	if token == nil {
		fmt.Println("exiting")
		os.Exit(1)
	}
	claims, _ := token.Claims.(jwt.MapClaims)
	role := claims["role"].(string)
	fmt.Println("role", role)

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

	if strings.ToLower(selfCluster) == "true" && strings.ToLower(role) == "admin" {
		log.Print("Starting self deployer")
		go selfDeployer.StartDeployer(projectID)
	}

	return err
}
