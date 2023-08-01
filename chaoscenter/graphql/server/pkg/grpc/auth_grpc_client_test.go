package grpc

import (
	"context"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/protos"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
)

type MockAuthRpcServiceClient struct{}

func (m *MockAuthRpcServiceClient) ValidateRequest(ctx context.Context, req *protos.ValidationRequest, opts ...grpc.CallOption) (*protos.ValidationResponse, error) {
	// You can implement custom logic here for the mock, based on the input req
	if req.Invitation == "invalid-invitation" {
		return &protos.ValidationResponse{
			IsValid: false,
			Error:   "Invalid invitation",
		}, nil
	}
	return &protos.ValidationResponse{
		IsValid: true,
	}, nil
}

func (m *MockAuthRpcServiceClient) GetProjectById(ctx context.Context, req *protos.GetProjectByIdRequest, opts ...grpc.CallOption) (*protos.GetProjectByIdResponse, error) {
	// Mock implementation for GetProjectById if needed
	return nil, nil
}

func (m *MockAuthRpcServiceClient) GetUserById(ctx context.Context, req *protos.GetUserByIdRequest, opts ...grpc.CallOption) (*protos.GetUserByIdResponse, error) {
	// Mock implementation for GetUserById if needed
	return nil, nil
}

func TestValidatorGRPCRequest_Valid(t *testing.T) {
	// Create a mock client
	mockClient := &MockAuthRpcServiceClient{}

	// Call the ValidatorGRPCRequest function with the mock client
	err := ValidatorGRPCRequest(mockClient, "mock-jwt", "mock-project-id", []string{"role1", "role2"}, "invitation")
	assert.NoError(t, err, "Expected no error when validation is successful")
}

func TestValidatorGRPCRequest_Invalid(t *testing.T) {
	// Create a mock client
	mockClient := &MockAuthRpcServiceClient{}

	// Call the ValidatorGRPCRequest function with the mock client, making it fail
	err := ValidatorGRPCRequest(mockClient, "mock-jwt", "mock-project-id", []string{"role1", "role2"}, "invalid-invitation")
	assert.Error(t, err, "Expected an error when validation fails")
}

// Additional tests can be written for other functions in the grpc package if required.
