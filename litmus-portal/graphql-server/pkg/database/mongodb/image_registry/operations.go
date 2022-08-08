package image_registry

import (
	"context"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

func InsertImageRegistry(ctx context.Context, imageRegistry ImageRegistry) error {
	err := mongodb.Operator.Create(ctx, mongodb.ImageRegistryCollection, imageRegistry)
	if err != nil {
		return err
	}

	return nil
}

func UpdateImageRegistry(ctx context.Context, query bson.D, update bson.D) error {
	_, err := mongodb.Operator.Update(ctx, mongodb.ImageRegistryCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

func ListImageRegistries(ctx context.Context, query bson.D) ([]ImageRegistry, error) {
	results, err := mongodb.Operator.List(ctx, mongodb.ImageRegistryCollection, query)
	if err != nil {
		return nil, err
	}

	var imageRegistries []ImageRegistry
	err = results.All(ctx, &imageRegistries)
	if err != nil {
		return nil, err
	}

	return imageRegistries, nil
}

func GetImageRegistry(ctx context.Context, query bson.D) (ImageRegistry, error) {
	result, err := mongodb.Operator.Get(ctx, mongodb.ImageRegistryCollection, query)
	if err != nil {
		return ImageRegistry{}, err
	}

	var imageRegistry ImageRegistry
	err = result.Decode(&imageRegistry)
	if err != nil {
		return ImageRegistry{}, err
	}

	return imageRegistry, nil
}
