package v0_0_0

import (
	// "context"
	// "fmt"

	// "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	log "github.com/sirupsen/logrus"
)

// upgradeWorkflowCollection updated the index related changes in workflow-collection
func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client) error {

	// var err error
	// db := dbClient.Database("auth")
	// collectionsNames, err := db.ListCollectionNames(context.TODO(), bson.M{})
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// logger.WithFields(log.Fields{
	// 	"version":     "3.9.0",
	// 	"collections": collectionsNames,
	// }).Info("Collections found in auth DB while upgrading to intermediate version v3.9.0")

	// projectCollection, err := db.ListCollectionNames(context.TODO(), bson.M{"name": "project"})
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// if len(projectCollection) > 0 {

	// 	projectLitmusCollection := dbClient.Database("auth").Collection("project")

	// 	err = projectLitmusCollection.Drop(context.Background())
	// 	if err != nil {
	// 		fmt.Errorf("Error: %w", err)
	// 	}

	// 	logger.WithFields(log.Fields{
	// 		"version": "3.9.0",
	// 	}).Info("Deleted project collection while upgrading to intermediate version v3.9.0")

	// } else {
	// 	log.Fatal("Project collection not found while upgrading to version v3.9.0")
	// }

	return nil
}
