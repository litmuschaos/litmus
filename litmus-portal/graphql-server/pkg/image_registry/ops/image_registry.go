package ops

import (
	"context"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/image_registry"
	"go.mongodb.org/mongo-driver/bson"
	"strconv"
	"time"
)

func CreateImageRegistry(ctx context.Context, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error) {
	var (
		currentTime = strconv.FormatInt(time.Now().Unix(), 10)
		id          = uuid.New().String()
		irType      image_registry.ImageRegistryType
	)

	err := json.Unmarshal([]byte(imageRegistryInfo.ImageRegistryType), &irType)
	if err != nil {
		return nil, err
	}

	imageRegistry := image_registry.ImageRegistry{
		ImageRegistryID:   id,
		ProjectID:         projectID,
		ImageRegistryName: imageRegistryInfo.ImageRegistryName,
		ImageRepoName:     imageRegistryInfo.ImageRepoName,
		ImageRegistryType: irType,
		SecretName:        imageRegistryInfo.SecretName,
		SecretNamespace:   imageRegistryInfo.SecretNamespace,
		EnableRegistry:    imageRegistryInfo.EnableRegistry,
		CreatedAt:         &currentTime,
		UpdatedAt:         currentTime,
	}

	err = image_registry.InsertImageRegistry(ctx, imageRegistry)
	if err != nil {
		return nil, err
	}

	return &model.ImageRegistryResponse{
		ImageRegistryID: id,
		ProjectID:       projectID,
		ImageRegistryInfo: &model.ImageRegistry{
			ImageRegistryName: imageRegistryInfo.ImageRegistryName,
			ImageRepoName:     imageRegistryInfo.ImageRepoName,
			ImageRegistryType: imageRegistryInfo.ImageRegistryType,
			SecretName:        imageRegistryInfo.SecretName,
			SecretNamespace:   imageRegistryInfo.SecretNamespace,
			EnableRegistry:    imageRegistryInfo.EnableRegistry,
		},
		UpdatedAt: &currentTime,
		CreatedAt: &currentTime,
	}, nil
}

func UpdateImageRegistry(ctx context.Context, imageRegistryID string, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error) {

	var currentTime = strconv.FormatInt(time.Now().Unix(), 10)

	query := bson.D{{"image_registry_id", imageRegistryID}, {"project_id", projectID}}
	update := bson.D{{"$set", bson.D{
		{"image_registry_name", imageRegistryInfo.ImageRegistryName},
		{"image_repo_name", imageRegistryInfo.ImageRepoName},
		{"image_registry_type", imageRegistryInfo.ImageRegistryType},
		{"secret_name", imageRegistryInfo.SecretName},
		{"secret_namespace", imageRegistryInfo.SecretNamespace},
		{"enable_registry", imageRegistryInfo.EnableRegistry},
		{"updated_at", currentTime},
	}}}

	err := image_registry.UpdateImageRegistry(ctx, query, update)
	if err != nil {
		return nil, err
	}

	return &model.ImageRegistryResponse{
		ImageRegistryID: imageRegistryID,
		ProjectID:       projectID,
		ImageRegistryInfo: &model.ImageRegistry{
			ImageRegistryName: imageRegistryInfo.ImageRegistryName,
			ImageRepoName:     imageRegistryInfo.ImageRepoName,
			ImageRegistryType: imageRegistryInfo.ImageRegistryType,
			SecretName:        imageRegistryInfo.SecretName,
			SecretNamespace:   imageRegistryInfo.SecretNamespace,
			EnableRegistry:    imageRegistryInfo.EnableRegistry,
		},
		UpdatedAt: &currentTime,
	}, nil
}

func DeleteImageRegistry(ctx context.Context, imageRegistryID string, projectID string) (string, error) {
	query := bson.D{{"image_registry_id", imageRegistryID}, {"project_id", projectID}}
	update := bson.D{{"$set", bson.D{{"isRemoved", true}}}}

	err := image_registry.UpdateImageRegistry(ctx, query, update)
	if err != nil {
		return "", err
	}

	return "image registry deleted", nil

}

func GetImageRegistry(ctx context.Context, imageRegistryID string, projectID string) (*model.ImageRegistryResponse, error) {
	query := bson.D{{"image_registry_id", imageRegistryID}, {"project_id", projectID}}
	imageRegistry, err := image_registry.GetImageRegistry(ctx, query)
	if err != nil {
		return nil, err
	}

	var irType model.ImageRegistryType
	err = json.Unmarshal([]byte(imageRegistry.ImageRegistryType), &irType)
	if err != nil {
		return nil, err
	}

	return &model.ImageRegistryResponse{
		ImageRegistryInfo: &model.ImageRegistry{
			ImageRegistryName: imageRegistry.ImageRegistryName,
			ImageRepoName:     imageRegistry.ImageRegistryName,
			ImageRegistryType: irType,
			SecretName:        imageRegistry.SecretName,
			SecretNamespace:   imageRegistry.SecretNamespace,
			EnableRegistry:    imageRegistry.EnableRegistry,
		},
		ImageRegistryID: imageRegistry.ImageRegistryID,
		ProjectID:       projectID,
		UpdatedAt:       &imageRegistry.UpdatedAt,
		CreatedAt:       imageRegistry.CreatedAt,
	}, nil
}

func ListImageRegistries(ctx context.Context, projectID string) ([]*model.ImageRegistryResponse, error) {
	query := bson.D{{"project_id", projectID}}
	imageRegistries, err := image_registry.ListImageRegistries(ctx, query)
	if err != nil {
		return nil, err
	}

	var irResponse []*model.ImageRegistryResponse
	for _, ir := range imageRegistries {
		var irType model.ImageRegistryType
		err = json.Unmarshal([]byte(ir.ImageRegistryType), &irType)
		if err != nil {
			return nil, err
		}

		irResponse = append(irResponse, &model.ImageRegistryResponse{
			ImageRegistryInfo: &model.ImageRegistry{
				ImageRegistryName: ir.ImageRegistryName,
				ImageRepoName:     ir.ImageRegistryName,
				ImageRegistryType: irType,
				SecretName:        ir.SecretName,
				SecretNamespace:   ir.SecretNamespace,
				EnableRegistry:    ir.EnableRegistry,
			},
			ImageRegistryID: ir.ImageRegistryID,
			ProjectID:       projectID,
			UpdatedAt:       &ir.UpdatedAt,
			CreatedAt:       ir.CreatedAt,
		})
	}

	return irResponse, nil
}
