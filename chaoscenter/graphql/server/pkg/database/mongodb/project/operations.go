package project

import (
	"context"
	"fmt"
	"github.com/harness/hce-saas/graphql/server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func WatchProjectEvents(ctx context.Context, pipeline mongo.Pipeline, client *mongo.Client) (*mongo.ChangeStream, error) {
	fmt.Println("here1")
	experimentEvents, err := mongodb.Operator.WatchEvents(ctx, client, mongodb.EnvironmentCollection, pipeline, options.ChangeStream().SetFullDocument(options.UpdateLookup))
	if err != nil {
		return nil, err
	}
	return experimentEvents, nil
}
