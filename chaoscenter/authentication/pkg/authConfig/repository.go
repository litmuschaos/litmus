package authConfig

import (
	"context"
	"encoding/base64"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository interface {
	CreateConfig(config AuthConfig) error
	GetConfig(key string) (*AuthConfig, error)
	UpdateConfig(ctx context.Context, key string, value interface{}) error
}

type repository struct {
	Collection *mongo.Collection
}

func (r repository) CreateConfig(config AuthConfig) error {
	_, err := r.Collection.InsertOne(context.Background(), config)
	if err != nil {
		return err
	}

	return nil
}

func (r repository) GetConfig(key string) (*AuthConfig, error) {
	results := r.Collection.FindOne(context.Background(), bson.D{
		{"key", key},
	})

	var config AuthConfig
	err := results.Decode(&config)
	if err != nil {
		return nil, err
	}
	decodedValue, err := base64.URLEncoding.DecodeString(config.Value)
	if err != nil {
		return nil, err
	}
	config.Value = string(decodedValue)
	return &config, nil
}

func (r repository) UpdateConfig(ctx context.Context, key string, value interface{}) error {
	query := bson.D{
		{"key", key},
	}
	update := bson.D{{"$set", bson.D{{
		"value", value}},
	}}
	_, err := r.Collection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}
	return nil
}

// NewAuthConfigRepo creates a new instance of this repository
func NewAuthConfigRepo(collection *mongo.Collection) Repository {
	return &repository{
		Collection: collection,
	}
}
