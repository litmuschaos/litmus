package image_registry

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	"go.mongodb.org/mongo-driver/bson"
)

// Operator is used to perform operations on the database
type Operator struct {
	operator mongodb.MongoOperator
}

// NewImageRegistryOperator returns a new instance of Operator
func NewImageRegistryOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

func (i *Operator) InsertImageRegistry(ctx context.Context, imageRegistry ImageRegistry) error {
	err := i.operator.Create(ctx, mongodb.ImageRegistryCollection, imageRegistry)
	if err != nil {
		return err
	}

	return nil
}

func (i *Operator) UpdateImageRegistry(ctx context.Context, query bson.D, update bson.D) error {
	_, err := i.operator.Update(ctx, mongodb.ImageRegistryCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

func (i *Operator) ListImageRegistries(ctx context.Context, query bson.D) ([]ImageRegistry, error) {

	results, err := i.operator.List(ctx, mongodb.ImageRegistryCollection, query)
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

func (i *Operator) GetImageRegistry(ctx context.Context, query bson.D) (ImageRegistry, error) {
	result, err := i.operator.Get(ctx, mongodb.ImageRegistryCollection, query)
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
