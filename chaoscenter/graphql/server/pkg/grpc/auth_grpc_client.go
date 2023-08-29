package grpc

import (
	"context"
	"errors"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/protos"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

// GetAuthGRPCSvcClient returns an RPC client for Authentication service
func GetAuthGRPCSvcClient(conn *grpc.ClientConn) (protos.AuthRpcServiceClient, *grpc.ClientConn) {
	conn, err := grpc.Dial(utils.Config.LitmusAuthGrpcEndpoint+utils.Config.LitmusAuthGrpcPort, grpc.WithBlock(), grpc.WithInsecure())
	if err != nil {
		logrus.Fatalf("did not connect: %s", err)
	}
	return protos.NewAuthRpcServiceClient(conn), conn
}

// ValidatorGRPCRequest sends a request to Authentication server to ensure
// user permission over the project
func ValidatorGRPCRequest(client protos.AuthRpcServiceClient,
	jwt string, projectID string, requiredRoles []string, invitation string) error {

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
func GetProjectById(client protos.AuthRpcServiceClient,
	projectId string) (*protos.GetProjectByIdResponse, error) {
	resp, err := client.GetProjectById(context.Background(), &protos.GetProjectByIdRequest{ProjectID: projectId})
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// GetUserById returns the project details based on its uid
func GetUserById(client protos.AuthRpcServiceClient,
	userId string) (*protos.GetUserByIdResponse, error) {
	resp, err := client.GetUserById(context.Background(), &protos.GetUserByIdRequest{UserID: userId})
	if err != nil {
		return nil, err
	}
	return resp, nil
}
