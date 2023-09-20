package grpc_test

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/grpc"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter/protos"
	"github.com/stretchr/testify/assert"
)
var (
	Testgrpc = new(grpc.ServerGrpc)
)
func TestValidateRequest(t *testing.T) {
	ctx := context.Background()
	jwt, projectId, invitation := uuid.NewString(), uuid.NewString(), uuid.NewString()

	testcases := []struct{
		name string
		request *protos.ValidationRequest
		isError bool
	}{
		{
			name: "Validate request",
			request: &protos.ValidationRequest{
				Jwt: jwt,
				ProjectId: projectId,
				Invitation: invitation,
			},
			isError: true,
		},

	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
		    response, err := Testgrpc.ValidateRequest(ctx, tc.request)
			// then
			if tc.isError {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
                assert.NotNil(t, response)
                assert.Equal(t, true, response.IsValid)
                assert.Equal(t, "", response.Error)
            }
		})
	}
}