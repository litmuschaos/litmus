package utils

import (
	"context"
	grpc2 "litmus/litmus-portal/authentication/api/presenter/protos"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

// GetProjectGRPCSvcClient returns an RPC client for Project service
func GetProjectGRPCSvcClient(conn *grpc.ClientConn) (grpc2.ProjectClient, *grpc.ClientConn) {
	conn, err := grpc.Dial(LitmusSvcEndpoint+LitmusSvcGRPCPort, grpc.WithInsecure(), grpc.WithBlock())
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
