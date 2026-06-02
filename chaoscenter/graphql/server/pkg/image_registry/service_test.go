package image_registry

import (
	"context"
	"errors"
	"strconv"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbImageRegistry "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/image_registry"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// newTestService wires the real image registry Operator on top of a mocked
// MongoOperator and returns both so each test can program the mock and assert
// against the service responses in isolation.
func newTestService() (*dbMocks.MongoOperator, Service) {
	mockOperator := new(dbMocks.MongoOperator)
	operator := dbImageRegistry.NewImageRegistryOperator(mockOperator)
	return mockOperator, NewImageRegistryService(operator)
}

func sampleInput() model.ImageRegistryInput {
	secretName := "my-secret"
	secretNamespace := "litmus"
	enableRegistry := true
	return model.ImageRegistryInput{
		IsDefault:         true,
		ImageRegistryName: "my-registry",
		ImageRepoName:     "litmuschaos",
		ImageRegistryType: "public",
		SecretName:        &secretName,
		SecretNamespace:   &secretNamespace,
		EnableRegistry:    &enableRegistry,
	}
}

// sampleRegistryDoc builds a BSON document matching the image_registry schema so
// it can be decoded back into dbImageRegistry.ImageRegistry by the service.
func sampleRegistryDoc(registryID, projectID string, createdAt, updatedAt int64) bson.D {
	return bson.D{
		{Key: "image_registry_id", Value: registryID},
		{Key: "project_id", Value: projectID},
		{Key: "image_registry_name", Value: "my-registry"},
		{Key: "image_repo_name", Value: "litmuschaos"},
		{Key: "image_registry_type", Value: "public"},
		{Key: "secret_name", Value: "my-secret"},
		{Key: "secret_namespace", Value: "litmus"},
		{Key: "is_default", Value: true},
		{Key: "enable_registry", Value: true},
		{Key: "created_at", Value: createdAt},
		{Key: "updated_at", Value: updatedAt},
		{Key: "is_removed", Value: false},
	}
}

func Test_imageRegistryService_CreateImageRegistry(t *testing.T) {
	projectID := "project-1"
	input := sampleInput()

	t.Run("success: returns mapped response", func(t *testing.T) {
		mockOperator, service := newTestService()
		mockOperator.On("Create", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).Return(nil)

		response, err := service.CreateImageRegistry(context.Background(), projectID, input)

		assert.NoError(t, err)
		assert.NotNil(t, response)
		assert.NotEmpty(t, response.ImageRegistryID)
		assert.Equal(t, projectID, response.ProjectID)
		assert.NotNil(t, response.ImageRegistryInfo)
		assert.Equal(t, input.ImageRegistryName, response.ImageRegistryInfo.ImageRegistryName)
		assert.Equal(t, input.ImageRepoName, response.ImageRegistryInfo.ImageRepoName)
		assert.Equal(t, input.ImageRegistryType, response.ImageRegistryInfo.ImageRegistryType)
		assert.Equal(t, input.SecretName, response.ImageRegistryInfo.SecretName)
		assert.Equal(t, input.SecretNamespace, response.ImageRegistryInfo.SecretNamespace)
		assert.Equal(t, input.EnableRegistry, response.ImageRegistryInfo.EnableRegistry)
		if assert.NotNil(t, response.ImageRegistryInfo.IsDefault) {
			assert.Equal(t, input.IsDefault, *response.ImageRegistryInfo.IsDefault)
		}
		assert.NotNil(t, response.CreatedAt)
		assert.NotNil(t, response.UpdatedAt)
		if assert.NotNil(t, response.IsRemoved) {
			assert.False(t, *response.IsRemoved)
		}
	})

	t.Run("failure: propagates insert error", func(t *testing.T) {
		mockOperator, service := newTestService()
		mockOperator.On("Create", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
			Return(errors.New("insert failed"))

		response, err := service.CreateImageRegistry(context.Background(), projectID, input)

		assert.Error(t, err)
		assert.Nil(t, response)
	})
}

func Test_imageRegistryService_UpdateImageRegistry(t *testing.T) {
	projectID := "project-1"
	registryID := "registry-1"
	input := sampleInput()

	t.Run("success: returns mapped response", func(t *testing.T) {
		mockOperator, service := newTestService()
		mockOperator.On("Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
			Return(&mongo.UpdateResult{}, nil)

		response, err := service.UpdateImageRegistry(context.Background(), registryID, projectID, input)

		assert.NoError(t, err)
		assert.NotNil(t, response)
		assert.Equal(t, registryID, response.ImageRegistryID)
		assert.Equal(t, projectID, response.ProjectID)
		assert.NotNil(t, response.ImageRegistryInfo)
		assert.Equal(t, input.ImageRegistryName, response.ImageRegistryInfo.ImageRegistryName)
		assert.Equal(t, input.ImageRepoName, response.ImageRegistryInfo.ImageRepoName)
		assert.Equal(t, input.ImageRegistryType, response.ImageRegistryInfo.ImageRegistryType)
		if assert.NotNil(t, response.ImageRegistryInfo.IsDefault) {
			assert.Equal(t, input.IsDefault, *response.ImageRegistryInfo.IsDefault)
		}
		assert.NotNil(t, response.UpdatedAt)
	})

	t.Run("failure: propagates update error", func(t *testing.T) {
		mockOperator, service := newTestService()
		mockOperator.On("Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
			Return((*mongo.UpdateResult)(nil), errors.New("update failed"))

		response, err := service.UpdateImageRegistry(context.Background(), registryID, projectID, input)

		assert.Error(t, err)
		assert.Nil(t, response)
	})
}

func Test_imageRegistryService_DeleteImageRegistry(t *testing.T) {
	projectID := "project-1"
	registryID := "registry-1"

	t.Run("success: returns confirmation message", func(t *testing.T) {
		mockOperator, service := newTestService()
		mockOperator.On("Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
			Return(&mongo.UpdateResult{}, nil)

		message, err := service.DeleteImageRegistry(context.Background(), registryID, projectID)

		assert.NoError(t, err)
		assert.Equal(t, "image registry deleted", message)
	})

	t.Run("failure: propagates update error", func(t *testing.T) {
		mockOperator, service := newTestService()
		mockOperator.On("Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
			Return((*mongo.UpdateResult)(nil), errors.New("update failed"))

		message, err := service.DeleteImageRegistry(context.Background(), registryID, projectID)

		assert.Error(t, err)
		assert.Empty(t, message)
	})
}

func Test_imageRegistryService_GetImageRegistry(t *testing.T) {
	projectID := "project-1"
	registryID := "registry-1"
	var createdAt int64 = 1000
	var updatedAt int64 = 2000

	t.Run("success: maps stored document to response", func(t *testing.T) {
		mockOperator, service := newTestService()
		singleResult := mongo.NewSingleResultFromDocument(
			sampleRegistryDoc(registryID, projectID, createdAt, updatedAt), nil, nil)
		mockOperator.On("Get", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
			Return(singleResult, nil)

		response, err := service.GetImageRegistry(context.Background(), projectID)

		assert.NoError(t, err)
		assert.NotNil(t, response)
		assert.Equal(t, registryID, response.ImageRegistryID)
		assert.Equal(t, projectID, response.ProjectID)
		assert.NotNil(t, response.ImageRegistryInfo)
		assert.Equal(t, "my-registry", response.ImageRegistryInfo.ImageRegistryName)
		assert.Equal(t, "litmuschaos", response.ImageRegistryInfo.ImageRepoName)
		assert.Equal(t, "public", response.ImageRegistryInfo.ImageRegistryType)
		if assert.NotNil(t, response.ImageRegistryInfo.IsDefault) {
			assert.True(t, *response.ImageRegistryInfo.IsDefault)
		}
		if assert.NotNil(t, response.CreatedAt) {
			assert.Equal(t, strconv.FormatInt(createdAt, 10), *response.CreatedAt)
		}
		if assert.NotNil(t, response.UpdatedAt) {
			assert.Equal(t, strconv.FormatInt(updatedAt, 10), *response.UpdatedAt)
		}
		if assert.NotNil(t, response.IsRemoved) {
			assert.False(t, *response.IsRemoved)
		}
	})

	t.Run("failure: propagates get error", func(t *testing.T) {
		mockOperator, service := newTestService()
		mockOperator.On("Get", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
			Return((*mongo.SingleResult)(nil), errors.New("not found"))

		response, err := service.GetImageRegistry(context.Background(), projectID)

		assert.Error(t, err)
		assert.Nil(t, response)
	})
}

func Test_imageRegistryService_ListImageRegistries(t *testing.T) {
	projectID := "project-1"

	t.Run("success: maps every document in the result set", func(t *testing.T) {
		mockOperator, service := newTestService()
		docs := []interface{}{
			sampleRegistryDoc("registry-1", projectID, 1000, 2000),
			sampleRegistryDoc("registry-2", projectID, 3000, 4000),
		}
		cursor, err := mongo.NewCursorFromDocuments(docs, nil, nil)
		assert.NoError(t, err)
		mockOperator.On("List", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
			Return(cursor, nil)

		response, err := service.ListImageRegistries(context.Background(), projectID)

		assert.NoError(t, err)
		assert.Len(t, response, 2)
		assert.Equal(t, "registry-1", response[0].ImageRegistryID)
		assert.Equal(t, projectID, response[0].ProjectID)
		assert.NotNil(t, response[0].ImageRegistryInfo)
		assert.Equal(t, "my-registry", response[0].ImageRegistryInfo.ImageRegistryName)
		if assert.NotNil(t, response[0].CreatedAt) {
			assert.Equal(t, strconv.FormatInt(1000, 10), *response[0].CreatedAt)
		}
		assert.Equal(t, "registry-2", response[1].ImageRegistryID)
	})

	t.Run("success: empty result set returns no registries", func(t *testing.T) {
		mockOperator, service := newTestService()
		cursor, err := mongo.NewCursorFromDocuments([]interface{}{}, nil, nil)
		assert.NoError(t, err)
		mockOperator.On("List", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
			Return(cursor, nil)

		response, err := service.ListImageRegistries(context.Background(), projectID)

		assert.NoError(t, err)
		assert.Empty(t, response)
	})

	t.Run("failure: propagates list error", func(t *testing.T) {
		mockOperator, service := newTestService()
		mockOperator.On("List", mock.Anything, mongodb.ImageRegistryCollection, mock.Anything).
			Return((*mongo.Cursor)(nil), errors.New("list failed"))

		response, err := service.ListImageRegistries(context.Background(), projectID)

		assert.Error(t, err)
		assert.Nil(t, response)
	})
}
