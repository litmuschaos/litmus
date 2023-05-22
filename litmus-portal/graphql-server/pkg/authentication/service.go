// Package authentication contains the service methods to validate user permissions
package authentication

import (
	"context"
	"errors"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/protos"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

// Service defines the authentication service methods
type Service interface {
	ValidatorGRPCRequest(jwt string, projectID string, requiredRoles []string, invitation string) error
	GetProjectById(projectId string) (*protos.GetProjectByIdResponse, error)
}

// authenticationService implements the Service interface
type authenticationService struct{}

// NewService returns a new instance of authentication service
func NewService() Service {
	return &authenticationService{}
}

// getGRPCAuthClient returns an GRPC client for Authentication service
func (a *authenticationService) getGRPCAuthClient() (protos.AuthRpcServiceClient, *grpc.ClientConn) {
	conn, err := grpc.Dial(utils.Config.LitmusAuthGrpcEndpoint+utils.Config.LitmusAuthGrpcPort, grpc.WithInsecure(),
		grpc.WithBlock())
	if err != nil {
		log.Fatalf("did not connect: %s", err)
	}
	return protos.NewAuthRpcServiceClient(conn), conn
}

// ValidatorGRPCRequest sends a request to Authentication server to ensure
// user permission over the project
func (a *authenticationService) ValidatorGRPCRequest(jwt string, projectID string, requiredRoles []string, invitation string) error {
	client, conn := a.getGRPCAuthClient()
	defer conn.Close()

	resp, err := client.ValidateRequest(context.Background(),
		&protos.ValidationRequest{
			Jwt:           jwt,
			ProjectId:     projectID,
			RequiredRoles: requiredRoles,
			Invitation:    invitation,
		})
	if err != nil {
		return err
	}
	if resp.Error != "" || !resp.IsValid {
		return errors.New(resp.Error)
	}
	return nil
}

// GetProjectById returns the project details based on its uid
func (a *authenticationService) GetProjectById(projectId string) (*protos.GetProjectByIdResponse, error) {
	client, conn := a.getGRPCAuthClient()
	defer conn.Close()

	resp, err := client.GetProjectById(context.Background(), &protos.GetProjectByIdRequest{ProjectID: projectId})
	if err != nil {
		return nil, err
	}
	return resp, nil
}
