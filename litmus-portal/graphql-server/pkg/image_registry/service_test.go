// Package image_registry_test contains tests for the image_registry package.
package image_registry_test

import (
	"context"
	"errors"
	"strconv"
	"testing"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbOperationsImageRegistry "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/image_registry"
	mongodbMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/image_registry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	mongoOperator         = new(mongodbMocks.MongoOperator)
	imageRegistryOperator = dbOperationsImageRegistry.NewImageRegistryOperator(mongoOperator)
	imageRegistryService  = image_registry.NewService(imageRegistryOperator)
)

// TestImageRegistryService_CreateImageRegistry tests the CreateImageRegistry method of imageRegistryService
func TestImageRegistryService_CreateImageRegistry(t *testing.T) {
	// given
	ctx := context.Background()
	projectID := uuid.NewString()
	imageRegistryInfo := model.ImageRegistryInput{
		ImageRegistryName: uuid.NewString(),
		ImageRepoName:     uuid.NewString(),
		ImageRegistryType: uuid.NewString(),
		IsDefault:         true,
	}
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				mongoOperator.On("Create", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(nil).Once()
			},
		},
		{
			name: "failure: mongo create error",
			given: func() {
				mongoOperator.On("Create", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			result, err := imageRegistryService.CreateImageRegistry(ctx, projectID, imageRegistryInfo)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, imageRegistryInfo.ImageRegistryName, result.ImageRegistryInfo.ImageRegistryName)
				assert.Equal(t, imageRegistryInfo.ImageRepoName, result.ImageRegistryInfo.ImageRepoName)
				assert.Equal(t, imageRegistryInfo.ImageRegistryType, result.ImageRegistryInfo.ImageRegistryType)
				assert.Equal(t, projectID, result.ProjectID)
			}
		})
	}
}

// TestImageRegistryService_UpdateImageRegistry tests the UpdateImageRegistry method of imageRegistryService
func TestImageRegistryService_UpdateImageRegistry(t *testing.T) {
	// given
	ctx := context.Background()
	projectID, imageRegistryID := uuid.NewString(), uuid.NewString()
	imageRegistryInfo := model.ImageRegistryInput{
		ImageRegistryName: uuid.NewString(),
		ImageRepoName:     uuid.NewString(),
		ImageRegistryType: uuid.NewString(),
		IsDefault:         true,
	}
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
			},
		},
		{
			name: "failure: mongo update error",
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 0}, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			result, err := imageRegistryService.UpdateImageRegistry(ctx, imageRegistryID, projectID, imageRegistryInfo)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, imageRegistryInfo.ImageRegistryName, result.ImageRegistryInfo.ImageRegistryName)
				assert.Equal(t, imageRegistryInfo.ImageRepoName, result.ImageRegistryInfo.ImageRepoName)
				assert.Equal(t, imageRegistryInfo.ImageRegistryType, result.ImageRegistryInfo.ImageRegistryType)
				assert.Equal(t, projectID, result.ProjectID)
			}
		})
	}
}

// TestImageRegistryService_DeleteImageRegistry tests the DeleteImageRegistry method of imageRegistryService
func TestImageRegistryService_DeleteImageRegistry(t *testing.T) {
	// given
	ctx := context.Background()
	projectID, imageRegistryID := uuid.NewString(), uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
			},
		},
		{
			name: "failure: mongo delete error",
			given: func() {
				mongoOperator.On("Update", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 0}, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := imageRegistryService.DeleteImageRegistry(ctx, imageRegistryID, projectID)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestImageRegistryService_GetImageRegistry tests the GetImageRegistry method of imageRegistryService
func TestImageRegistryService_GetImageRegistry(t *testing.T) {
	// given
	ctx := context.Background()
	projectID, imageRegistryID := uuid.NewString(), uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"image_registry_id", imageRegistryID}, {"project_id", projectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(singleResult, nil).Once()
			},
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := imageRegistryService.GetImageRegistry(ctx, imageRegistryID, projectID)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestImageRegistryService_ListImageRegistries tests the ListImageRegistries method of imageRegistryService
func TestImageRegistryService_ListImageRegistries(t *testing.T) {
	// given
	ctx := context.Background()
	projectID, imageRegistryID := uuid.NewString(), uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				imageRegistries := make([]interface{}, 10)
				for i := 0; i < 10; i++ {
					imageRegistries[i] = dbOperationsImageRegistry.ImageRegistry{ImageRegistryID: imageRegistryID + strconv.Itoa(i), ProjectID: projectID}
				}
				cursor, _ := mongo.NewCursorFromDocuments(imageRegistries, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(cursor, nil).Once()
			},
		},
		{
			name: "failure: mongo list error",
			given: func() {
				cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(cursor, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			result, err := imageRegistryService.ListImageRegistries(ctx, projectID)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				for i, imageRegistry := range result {
					assert.Equal(t, projectID, imageRegistry.ProjectID)
					assert.Equal(t, imageRegistryID+strconv.Itoa(i), imageRegistry.ImageRegistryID)
				}
			}
		})
	}
}
