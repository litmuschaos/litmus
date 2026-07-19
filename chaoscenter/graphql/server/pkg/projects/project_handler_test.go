package projects

import (
	"context"
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/project"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestProjectInitializer_Success(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	
	// ProjectInitializer calls irOp.InsertImageRegistry which eventually calls MongoOperator.Create
	mockOp.On("Create", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
		Return(nil).Once()

	proj := project.Project{
		ID:        "project-1",
		Audit: mongodb.Audit{
			CreatedBy: mongodb.UserDetailResponse{UserID: "user-1"},
			UpdatedBy: mongodb.UserDetailResponse{UserID: "user-1"},
		},
	}

	err := ProjectInitializer(context.Background(), proj, "admin", mockOp)
	
	assert.NoError(t, err)
	mockOp.AssertExpectations(t)
}

func TestProjectInitializer_Error(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	
	dbErr := errors.New("db error while creating registry")
	mockOp.On("Create", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
		Return(dbErr).Once()

	proj := project.Project{
		ID: "project-2",
	}

	err := ProjectInitializer(context.Background(), proj, "admin", mockOp)
	
	assert.Error(t, err)
	assert.Equal(t, dbErr, err)
	mockOp.AssertExpectations(t)
}
