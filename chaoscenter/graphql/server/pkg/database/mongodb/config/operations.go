package config

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Operator struct {
	operator mongodb.MongoOperator
}

func NewConfigOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}


// CreateConfig creates a new server config with unique key
func (o *Operator) CreateConfig(ctx context.Context, config *ServerConfig) error {
	err := o.operator.Create(ctx, mongodb.ServerConfigCollection, config)
	if err != nil {
		return err
	}
	return nil
}

// GetConfig returns the requested server config
func (o *Operator) GetConfig(ctx context.Context, key string) (*ServerConfig, error) {
	query := bson.D{
		{"key", key},
	}
	results, err := o.operator.Get(ctx, mongodb.ServerConfigCollection, query)
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
func (o *Operator) UpdateConfig(ctx context.Context, key string, value interface{}) error {
	query := bson.D{
		{"key", key},
	}
	update := bson.D{{"$set", bson.D{{
		"value", value}},
	}}
	_, err := o.operator.Update(ctx, mongodb.ServerConfigCollection, query, update)
	if err != nil {
		return err
	}
	return nil
}
