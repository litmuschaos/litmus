package v3_9_0

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/mongo"

	log "github.com/sirupsen/logrus"
)

// upgradeWorkflowCollection updated the index related changes in workflow-collection
func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client) error {
	projectLitmusCollection := dbClient.Database("litmus").Collection("project")
	err := projectLitmusCollection.Drop(context.Background())
	if err != nil {
		fmt.Errorf("Error: %w", err)
	}
	logger.WithFields(log.Fields{
		"version": "3.9.0",
	}).Info("Deleted project collection while upgrading to intermediate version v3.9.0")
	return nil
}
