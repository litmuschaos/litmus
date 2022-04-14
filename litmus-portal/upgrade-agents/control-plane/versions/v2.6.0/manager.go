package v2_6_0

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

// upgradeWorkflowCollection updated the index related changes in workflow-collection
func upgradeWorkflowCollection(logger *zap.Logger, dbClient *mongo.Client) error {
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
