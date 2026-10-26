package mocks

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/stretchr/testify/mock"
	"google.golang.org/grpc"
)

// ServerGrpc is a mock type for the ServerGrpc type
type MockAuthRpcServiceClient struct {
	mock.Mock
}

func (m *MockAuthRpcServiceClient) ValidateRequest(ctx context.Context, in *protos.ValidationRequest, opts ...grpc.CallOption) (*protos.ValidationResponse, error) {
	args := m.Called(ctx, in, opts)
	if vr, ok := args.Get(0).(*protos.ValidationResponse); ok {
		return vr, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockAuthRpcServiceClient) GetProjectById(ctx context.Context, in *protos.GetProjectByIdRequest, opts ...grpc.CallOption) (*protos.GetProjectByIdResponse, error) {
	args := m.Called(ctx, in, opts)
	if gpir, ok := args.Get(0).(*protos.GetProjectByIdResponse); ok {
		return gpir, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockAuthRpcServiceClient) GetUserById(ctx context.Context, in *protos.GetUserByIdRequest, opts ...grpc.CallOption) (*protos.GetUserByIdResponse, error) {
	args := m.Called(ctx, in, opts)
	if guir, ok := args.Get(0).(*protos.GetUserByIdResponse); ok {
		return guir, args.Error(1)
	}
	return nil, args.Error(1)
}
