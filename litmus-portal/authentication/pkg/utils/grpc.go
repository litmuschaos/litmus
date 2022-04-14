package utils

import (
	"context"
	grpc2 "litmus/litmus-portal/authentication/api/presenter/protos"
	"os"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

// GetProjectGRPCSvcClient returns an RPC client for Project service
func GetProjectGRPCSvcClient(conn *grpc.ClientConn) (grpc2.ProjectClient, *grpc.ClientConn) {
	litmusGqlGrpcEndpoint := os.Getenv("LITMUS_GQL_GRPC_ENDPOINT")
	litmusGqlGrpcPort := os.Getenv("LITMUS_GQL_GRPC_PORT")

	if litmusGqlGrpcEndpoint == "" {
		litmusGqlGrpcEndpoint = DefaultLitmusGqlGrpcEndpoint
	}
	if litmusGqlGrpcPort == "" {
		litmusGqlGrpcPort = DefaultLitmusGqlGrpcPort
	}

	conn, err := grpc.Dial(litmusGqlGrpcEndpoint+litmusGqlGrpcPort, grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		logrus.Fatalf("did not connect: %s", err)
	}

	return grpc2.NewProjectClient(conn), conn
}

// ProjectInitializer initializes a new project with default hub and image registry
func ProjectInitializer(context context.Context, client grpc2.ProjectClient, projectID string, role string) error {

	_, err := client.InitializeProject(context,
		&grpc2.ProjectInitializationRequest{
			ProjectID: projectID,
			Role:      role,
		})

	return err
}
