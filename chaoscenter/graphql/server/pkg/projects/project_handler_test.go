package projects

import (
	"context"
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbSchemaProject "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/project"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

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