package v2_6_0

import (
	"context"
	"fmt"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client) error {
	workflowCollection := dbClient.Database("litmus").Collection("workflow-collection")

	//delete the existing workflow_name index
	_, err := workflowCollection.Indexes().DropOne(context.Background(), "workflow_name_1")
	if err != nil {
		fmt.Errorf("error: %w", err)
	}

	//create a new workflow index with partial filter expression
	_, err = workflowCollection.Indexes().CreateOne(context.Background(),
		mongo.IndexModel{Keys: bson.M{"workflow_name": 1},
			Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.D{{
				"isRemoved", false,
			}})})

	return err
}
