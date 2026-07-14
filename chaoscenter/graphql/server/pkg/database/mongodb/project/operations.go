package project

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Operator is the model for cluster collection
type Operator struct {
	operator mongodb.MongoOperator
}

// NewProjectOperator returns a new instance of Operator
func NewProjectOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

func (c *Operator) WatchProjectEvents(ctx context.Context, pipeline mongo.Pipeline, client *mongo.Client) (*mongo.ChangeStream, error) {
	experimentEvents, err := c.operator.WatchEvents(ctx, client, mongodb.EnvironmentCollection, pipeline, options.ChangeStream().SetFullDocument(options.UpdateLookup))
	if err != nil {
		return nil, err
	}
	return experimentEvents, nil
}
