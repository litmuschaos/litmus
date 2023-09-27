package grpc_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/stretchr/testify/assert"
)

var (
	testGrpc = new(mocks.ServerGrpc)
)

func TestValidateRequest(t *testing.T) {
	ctx := context.Background()
	input := &protos.ValidationRequest{
		Jwt:           uuid.NewString(),
		ProjectId:     uuid.NewString(),
		RequiredRoles: []string{uuid.NewString()},
		Invitation:    uuid.NewString(),
	}
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				testGrpc.On("ValidateRequest", ctx, input).Return(&protos.ValidationResponse{}, nil)
			},
			isError: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			response, err := testGrpc.ValidateRequest(ctx, input)
			// then
			if err != nil {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, response)
			}
		})
	}

}

func TestGetProjectById(t *testing.T) {
	ctx := context.Background()
	input := &protos.GetProjectByIdRequest{
		ProjectID: uuid.NewString(),
	}
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				testGrpc.On("GetProjectById", ctx, input).Return(&protos.GetProjectByIdResponse{}, nil)
			},
			isError: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			//when
			response, err := testGrpc.GetProjectById(ctx, input)
			// then
			if err != nil {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, response)
			}
		})
	}
}

func TestGetUserById(t *testing.T) {
	ctx := context.Background()
	input := &protos.GetUserByIdRequest{
		UserID: uuid.NewString(),
	}
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success",
			given: func() {
				testGrpc.On("GetUserById", ctx, input).Return(&protos.GetUserByIdResponse{}, nil)
			},
			isError: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			response, err := testGrpc.GetUserById(ctx, input)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, response)
			}
		})
	}
}
