package handler_test

import (
	"context"
	"errors"
	"strconv"
	"testing"

	"fortio.org/assert"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/environment/handler"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	mongodbMockOperator    = new(dbMocks.MongoOperator)
	envOperator            = environments.NewEnvironmentOperator(mongodbMockOperator)
	environmentTestHandler = handler.NewEnvironmentService(envOperator)
)

func strPtr(s string) *string {
	return &s
}

func TestCreateEnvironment(t *testing.T) {
	//given
	ctx := context.Background()
	projectID := uuid.NewString()
	newEnvironment := &model.CreateEnvironmentRequest{
		EnvironmentID: uuid.NewString(),
		Name:          uuid.NewString(),
		Description:   strPtr(uuid.NewString()),
		Tags:          []string{uuid.NewString()},
	}
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success update new environment",
			given: func() {
				mongodbMockOperator.On("Create", mock.Anything, mongodb.EnvironmentCollection, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
			},
		},
		{
			name: "failure: mongo update error",
			given: func() {
				mongodbMockOperator.On("Create", mock.Anything, mongodb.EnvironmentCollection, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			//given
			tc.given()
			//when
			_, err := environmentTestHandler.CreateEnvironment(ctx, projectID, newEnvironment)
			//then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}

}

func TestUpdateEnvironment(t *testing.T) {
	//given
	ctx := context.Background()
	projectID := uuid.NewString()
	newEnvironment := &model.UpdateEnvironmentRequest{
		EnvironmentID: uuid.NewString(),
		Name:          strPtr(uuid.NewString()),
		Description:   strPtr(uuid.NewString()),
	}
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success update new environment",
			given: func() {
				mongodbMockOperator.On("Update", mock.Anything, mongodb.EnvironmentCollection, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
			},
		},
		{
			name: "failure: mongo update error",
			given: func() {
				mongodbMockOperator.On("Update", mock.Anything, mongodb.EnvironmentCollection, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			//given
			tc.given()
			//when
			_, err := environmentTestHandler.UpdateEnvironment(ctx, projectID, newEnvironment)
			//then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}

}

func TestDeleteEnvironment(t *testing.T) {
	ctx := context.Background()
	projectID := uuid.NewString()
	environmentID := uuid.NewString()
	//given
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success deleting environment",
			given: func() {
				mongodbMockOperator.On("Update", mock.Anything, mongodb.EnvironmentCollection, mock.Anything, mock.Anything, mock.Anything).Return(nil).Once()
			},
		},
		{
			name: "failure: mongo delete error",
			given: func() {
				mongodbMockOperator.On("Update", mock.Anything, mongodb.EnvironmentCollection, mock.Anything, mock.Anything, mock.Anything).Return(errors.New("")).Once()
			},
			isError: true,
		},
	}

	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := environmentTestHandler.DeleteEnvironment(ctx, projectID, environmentID)
			if err == nil {
				t.Errorf("Deleted environment got %v but want %v", err, tc.isError)
				return
			}
		})
	}
}

func TestGetEnvironment(t *testing.T) {
	projectID := uuid.NewString()
	environmentID := uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success getting environment",
			given: func() {
				findResult := bson.D{{"environment_id", environmentID}, {"project_id", projectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.EnvironmentCollection, mock.Anything).Return(singleResult, nil).Once()
			},
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongodbMockOperator.On("Get", mock.Anything, mongodb.EnvironmentCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := environmentTestHandler.GetEnvironment(projectID, environmentID)
			if err == nil {
				t.Errorf("Got environment")
			}
		})
	}
}

func TestListEnvironment(t *testing.T) {
	projectID := uuid.NewString()
	environmentID := uuid.NewString()
	envRequest := &model.ListEnvironmentRequest{
		EnvironmentIDs: []string{uuid.NewString()},
	}
	testcases := []struct {
		name    string
		given   func()
		isError bool
	}{
		{
			name: "success getting environment",
			given: func() {
				imageRegistries := make([]interface{}, 10)
				for i := 0; i < 10; i++ {
					imageRegistries[i] = environments.Environment{EnvironmentID: environmentID + strconv.Itoa(i), ProjectID: projectID}
				}
				cursor, _ := mongo.NewCursorFromDocuments(imageRegistries, nil, nil)
				mongodbMockOperator.On("List", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "failure: mongo list error",
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongodbMockOperator.On("List", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			isError: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			result, err := environmentTestHandler.ListEnvironments(projectID, envRequest)
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				for i, envResponse := range result.Environments {
					assert.Equal(t, projectID, envResponse.ProjectID)
					assert.Equal(t, envResponse.EnvironmentID+strconv.Itoa(i), envResponse.EnvironmentID)
				}
			}
		})
	}
}
