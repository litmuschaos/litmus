package mocks

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/stretchr/testify/mock"
)

// ServerGrpc is a mock type for the ServerGrpc type
type ServerGrpc struct {
	mock.Mock
}

// ValidateRequuest mock version with given ctx, inputRequest
func (s *ServerGrpc) ValidateRequest(ctx context.Context, inputRequest *protos.ValidationRequest) (*protos.ValidationResponse, error) {
	args := s.Called(ctx, inputRequest)
	return args.Get(0).(*protos.ValidationResponse), args.Error(1)
}

// GetProjectById mock version with given ctx, inputRequest
func (s *ServerGrpc) GetProjectById(ctx context.Context, inputRequest *protos.GetProjectByIdRequest) (*protos.GetProjectByIdResponse, error) {
	args := s.Called(ctx, inputRequest)
	return args.Get(0).(*protos.GetProjectByIdResponse), args.Error(1)
}

// GetUserById mock version with given ctx, inputRequest
func (s *ServerGrpc) GetUserById(ctx context.Context, inputRequest *protos.GetUserByIdRequest) (*protos.GetUserByIdResponse, error) {
	args := s.Called(ctx, inputRequest)
	return args.Get(0).(*protos.GetUserByIdResponse), args.Error(1)
}
