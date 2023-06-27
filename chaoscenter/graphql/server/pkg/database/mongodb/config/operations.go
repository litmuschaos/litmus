package config

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateConfig creates a new server config with unique key
func CreateConfig(ctx context.Context, config *ServerConfig) error {
	err := mongodb.Operator.Create(ctx, mongodb.ServerConfigCollection, config)
	if err != nil {
		return err
	}
	return nil
}

// GetConfig returns the requested server config
func GetConfig(ctx context.Context, key string) (*ServerConfig, error) {
	query := bson.D{
		{"key", key},
	}
	results, err := mongodb.Operator.Get(ctx, mongodb.ServerConfigCollection, query)
	if err != nil {
		return nil, err
	}
	var config ServerConfig
	err = results.Decode(&config)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &config, nil
}

// UpdateConfig updates the required server config
func UpdateConfig(ctx context.Context, key string, value interface{}) error {
	query := bson.D{
		{"key", key},
	}
	update := bson.D{{"$set", bson.D{{
		"value", value}},
	}}
	_, err := mongodb.Operator.Update(ctx, mongodb.ServerConfigCollection, query, update)
	if err != nil {
		return err
	}
	return nil
}
