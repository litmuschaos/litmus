package v3_8_0

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	log "github.com/sirupsen/logrus"
)

// upgradeWorkflowCollection updated the index related changes in workflow-collection
func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client) error {
	db := dbClient.Database("auth")
	collectionsNames, err := db.ListCollectionNames(context.TODO(), bson.M{"name": "users"})
	if err != nil {
		log.Fatal(err)
	}

	collections, err := db.ListCollectionNames(context.TODO(), bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	logger.WithFields(log.Fields{
		"version":     "3.8.0",
		"collections": collections,
	}).Info("collections in authdb found while upgrading to intermediate version v3.8.0")

	if len(collectionsNames) > 0 {
		res := dbClient.Database("admin").RunCommand(context.Background(), bson.D{{"renameCollection", "auth.users"}, {"to", "auth.admin"}})
		logger.WithFields(log.Fields{
			"version": "3.8.0",
		}).Info("user collection renamed to admin while upgrading to intermediate version v3.8.0")
		if res.Err() != nil {
			return res.Err()
		}
	} else {
		log.Fatal("Users collection not found while upgrading to version v3.8.0")
	}


	return nil
}
