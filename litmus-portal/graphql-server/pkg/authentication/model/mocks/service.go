// Package mocks contains mocks for testing.
package mocks

import (
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/protos"
	"github.com/stretchr/testify/mock"
)

// AuthenticationService is a mock type for the AuthenticationService type
type AuthenticationService struct {
	mock.Mock
}

// ValidatorGRPCRequest mocks the ValidatorGRPCRequest function
func (a *AuthenticationService) ValidatorGRPCRequest(jwt string, projectID string, requiredRoles []string, invitation string) error {
	args := a.Called(jwt, projectID, requiredRoles, invitation)
	return args.Error(0)
}

// GetProjectById mocks the GetProjectById function
func (a *AuthenticationService) GetProjectById(projectId string) (*protos.GetProjectByIdResponse, error) {
	args := a.Called(projectId)
	return args.Get(0).(*protos.GetProjectByIdResponse), args.Error(1)
}
