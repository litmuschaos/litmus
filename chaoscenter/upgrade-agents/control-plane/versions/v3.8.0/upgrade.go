package v3_8_0

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	log "github.com/sirupsen/logrus"
)

// upgradeWorkflowCollection updated the index related changes in workflow-collection
func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client) error {
	res := dbClient.Database("litmus").RunCommand(context.Background(), bson.D{{"renameCollection", "user"}, {"to", "admin"}})
	logger.WithFields(log.Fields{
		"version": "3.8.0",
	}).Info("user collection renamed to admin while upgrading to intermediate version v3.8.0")
	if res.Err() != nil {
		return res.Err()
	}
	return nil
}
