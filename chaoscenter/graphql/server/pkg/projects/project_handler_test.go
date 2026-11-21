package projects

import (
	"context"
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbSchemaProject "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/project"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/protos"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"google.golang.org/grpc"
)

// fakeAuthClient is an AuthRpcServiceClient whose GetUserById returns a fixed result.
type fakeAuthClient struct {
	protos.AuthRpcServiceClient
	resp *protos.GetUserByIdResponse
	err  error
}

func (f *fakeAuthClient) GetUserById(_ context.Context, _ *protos.GetUserByIdRequest, _ ...grpc.CallOption) (*protos.GetUserByIdResponse, error) {
	return f.resp, f.err
}

func TestCreatorRole(t *testing.T) {
	t.Run("returns the role of the user", func(t *testing.T) {
		client := &fakeAuthClient{resp: &protos.GetUserByIdResponse{Role: "admin"}}

		assert.Equal(t, "admin", creatorRole(client, "user-id"))
	})

	t.Run("returns an empty role when the user cannot be fetched", func(t *testing.T) {
		client := &fakeAuthClient{err: errors.New("authentication server unavailable")}

		assert.Equal(t, "", creatorRole(client, "user-id"))
	})
}

func TestProjectInitializer_Success(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)

	mockOp.On("Create", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
		Return(nil).Once()

	proj := dbSchemaProject.Project{
		ID: "test-project-id",
		Audit: mongodb.Audit{
			CreatedBy: mongodb.UserDetailResponse{Username: "test-user"},
			UpdatedBy: mongodb.UserDetailResponse{Username: "test-user"},
		},
	}

	err := ProjectInitializer(context.Background(), proj, "admin", mockOp)

	assert.NoError(t, err)
	mockOp.AssertExpectations(t)
}

func TestProjectInitializer_DBError(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)

	dbErr := errors.New("failed to insert image registry")
	mockOp.On("Create", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
		Return(dbErr).Once()

	proj := dbSchemaProject.Project{
		ID: "test-project-id",
		Audit: mongodb.Audit{
			CreatedBy: mongodb.UserDetailResponse{Username: "test-user"},
			UpdatedBy: mongodb.UserDetailResponse{Username: "test-user"},
		},
	}

	err := ProjectInitializer(context.Background(), proj, "admin", mockOp)

	assert.Error(t, err)
	assert.Equal(t, dbErr, err)
	mockOp.AssertExpectations(t)
}
