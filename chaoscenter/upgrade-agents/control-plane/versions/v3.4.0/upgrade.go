package v3_4_0

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	log "github.com/sirupsen/logrus"
)

func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client) error {
	workflowCollection := dbClient.Database("litmus").Collection("environment")

	//delete the existing workflow_name index
	_, err := workflowCollection.Indexes().DropOne(context.Background(), "environment_id")
	if err != nil {
		fmt.Errorf("error: %w", err)
	}

	logger.WithFields(log.Fields{
		"version": "3.4.0",
	}).Info("Deleted an existing index environment while upgrading to intermediate v3.4.0")

	//create a new workflow index with partial filter expression
	_, err = workflowCollection.Indexes().CreateOne(context.Background(),
		mongo.IndexModel{Keys: bson.M{"environment_id": 1},
			Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.D{{
				"isRemoved", false,
			}})})

	log.WithFields(log.Fields{
		"version": "3.4.0",
	}).Info("Created a new index with partial filter expresion environment_id while upgrading to intermediate v3.4.0")

	return err
}
