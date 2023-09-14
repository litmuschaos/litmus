package image_registry

import (
	"context"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/image_registry"
	dbOperationsImageRegistry "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/image_registry"
	"go.mongodb.org/mongo-driver/bson"
)

// Service is the interface for the image registry service
type Service interface {
	CreateImageRegistry(ctx context.Context, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error)
	UpdateImageRegistry(ctx context.Context, imageRegistryID string, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error)
	DeleteImageRegistry(ctx context.Context, imageRegistryID string, projectID string) (string, error)
	GetImageRegistry(ctx context.Context, projectID string) (*model.ImageRegistryResponse, error)
	ListImageRegistries(ctx context.Context, projectID string) ([]*model.ImageRegistryResponse, error)
}

// imageRegistryService is the implementation of Service interface
type imageRegistryService struct {
	imageRegistryOperator *dbOperationsImageRegistry.Operator
}

// NewImageRegistryService returns a new instance of imageRegistryService
func NewImageRegistryService(imageRegistryOperator *dbOperationsImageRegistry.Operator) Service {
	return &imageRegistryService{
		imageRegistryOperator: imageRegistryOperator,
	}
}

func (i *imageRegistryService) CreateImageRegistry(ctx context.Context, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error) {
	var (
		currentTime = time.Now().UnixMilli()
		currTimeStr = strconv.FormatInt(currentTime, 10)
		id          = uuid.New().String()
		isRemoved   = false
	)

	imageRegistry := image_registry.ImageRegistry{
		ImageRegistryID:   id,
		ProjectID:         projectID,
		ImageRegistryName: imageRegistryInfo.ImageRegistryName,
		ImageRepoName:     imageRegistryInfo.ImageRepoName,
		ImageRegistryType: imageRegistryInfo.ImageRegistryType,
		SecretName:        imageRegistryInfo.SecretName,
		SecretNamespace:   imageRegistryInfo.SecretNamespace,
		EnableRegistry:    imageRegistryInfo.EnableRegistry,
		IsDefault:         imageRegistryInfo.IsDefault,
		Audit: mongodb.Audit{
			CreatedAt: currentTime,
			UpdatedAt: currentTime,
			IsRemoved: false,
		},
	}

	err := i.imageRegistryOperator.InsertImageRegistry(ctx, imageRegistry)
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
			IsDefault:         &imageRegistry.IsDefault,
		},

		CreatedAt: &currTimeStr,
		UpdatedAt: &currTimeStr,
		IsRemoved: &isRemoved,
	}, nil
}

func (i *imageRegistryService) UpdateImageRegistry(ctx context.Context, imageRegistryID string, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error) {

	var (
		currentTime = time.Now().UnixMilli()
		currTimeStr = strconv.FormatInt(currentTime, 10)
		bl          = false
	)

	query := bson.D{{"image_registry_id", imageRegistryID}, {"project_id", projectID}}
	update := bson.D{{"$set", bson.D{
		{"image_registry_name", imageRegistryInfo.ImageRegistryName},
		{"image_repo_name", imageRegistryInfo.ImageRepoName},
		{"image_registry_type", imageRegistryInfo.ImageRegistryType},
		{"secret_name", imageRegistryInfo.SecretName},
		{"secret_namespace", imageRegistryInfo.SecretNamespace},
		{"enable_registry", imageRegistryInfo.EnableRegistry},
		{"is_default", imageRegistryInfo.IsDefault},
		{"updated_at", currentTime},
	}}}

	err := i.imageRegistryOperator.UpdateImageRegistry(ctx, query, update)
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
			IsDefault:         &imageRegistryInfo.IsDefault,
		},
		UpdatedAt: &currTimeStr,
		IsRemoved: &bl,
	}, nil
}

func (i *imageRegistryService) DeleteImageRegistry(ctx context.Context, imageRegistryID string, projectID string) (string, error) {
	query := bson.D{{"image_registry_id", imageRegistryID}, {"project_id", projectID}}
	update := bson.D{{"$set", bson.D{{"is_removed", true}}}}

	err := i.imageRegistryOperator.UpdateImageRegistry(ctx, query, update)
	if err != nil {
		return "", err
	}

	return "image registry deleted", nil
}

func (i *imageRegistryService) GetImageRegistry(ctx context.Context, projectID string) (*model.ImageRegistryResponse, error) {
	query := bson.D{{"project_id", projectID}}
	imageRegistry, err := i.imageRegistryOperator.GetImageRegistry(ctx, query)
	if err != nil {
		return nil, err
	}

	updatedAt := strconv.FormatInt(imageRegistry.UpdatedAt, 10)
	createdAt := strconv.FormatInt(imageRegistry.CreatedAt, 10)
	return &model.ImageRegistryResponse{
		ImageRegistryInfo: &model.ImageRegistry{
			IsDefault:         &imageRegistry.IsDefault,
			ImageRegistryName: imageRegistry.ImageRegistryName,
			ImageRepoName:     imageRegistry.ImageRepoName,
			ImageRegistryType: imageRegistry.ImageRegistryType,
			SecretName:        imageRegistry.SecretName,
			SecretNamespace:   imageRegistry.SecretNamespace,
			EnableRegistry:    imageRegistry.EnableRegistry,
		},
		ImageRegistryID: imageRegistry.ImageRegistryID,
		ProjectID:       projectID,
		UpdatedAt:       &updatedAt,
		CreatedAt:       &createdAt,
		IsRemoved:       &imageRegistry.IsRemoved,
	}, nil
}

func (i *imageRegistryService) ListImageRegistries(ctx context.Context, projectID string) ([]*model.ImageRegistryResponse, error) {
	query := bson.D{{"project_id", projectID}}
	imageRegistries, err := i.imageRegistryOperator.ListImageRegistries(ctx, query)
	if err != nil {
		return nil, err
	}

	var irResponse []*model.ImageRegistryResponse

	for _, ir := range imageRegistries {
		updatedAt := strconv.FormatInt(ir.UpdatedAt, 10)
		createdAt := strconv.FormatInt(ir.CreatedAt, 10)
		irResponse = append(irResponse, &model.ImageRegistryResponse{
			ImageRegistryInfo: &model.ImageRegistry{
				IsDefault:         &ir.IsDefault,
				ImageRegistryName: ir.ImageRegistryName,
				ImageRepoName:     ir.ImageRepoName,
				ImageRegistryType: ir.ImageRegistryType,
				SecretName:        ir.SecretName,
				SecretNamespace:   ir.SecretNamespace,
				EnableRegistry:    ir.EnableRegistry,
			},
			ImageRegistryID: ir.ImageRegistryID,
			ProjectID:       projectID,
			UpdatedAt:       &updatedAt,
			CreatedAt:       &createdAt,
			IsRemoved:       &ir.IsRemoved,
		})
	}

	return irResponse, nil
}
