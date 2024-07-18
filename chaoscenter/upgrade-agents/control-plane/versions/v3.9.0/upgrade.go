package v3_9_0

import (
	"context"
	"fmt"

	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	log "github.com/sirupsen/logrus"
)

func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client, ctx context.Context) error {

	var err error
	db := dbClient.Database("auth")
	collectionsNames, err := db.ListCollectionNames(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}

	logFields := log.Fields{
		"version":     "3.9.0",
		"collections": collectionsNames,
	}

	logVersion := log.Fields{
		"version": "3.9.0",
	}

	logger.WithFields(logFields).Info("Collections found in auth DB while upgrading to intermediate version v3.9.0")

	projectCollection, err := db.ListCollectionNames(ctx, bson.M{"name": database.ProjectCollection})
	if err != nil {
		log.Fatal(err)
	}

	if len(projectCollection) > 0 {

		projectLitmusCollection := dbClient.Database(database.AuthDB).Collection(database.ProjectCollection)

		RawArgs := []string{
			fmt.Sprintf("--uri=%s", database.DBUri),
			"--db=post",
			"--collection=test",
			fmt.Sprintf("--out=%s", "test.txt"),
			"--jsonArray",
		}

		err := database.Export("test.txt", RawArgs)
		if err != nil {
			log.Fatal(err)
		}

		err = projectLitmusCollection.Drop(ctx)
		if err != nil {
			log.Fatal(err)
		}

		logger.WithFields(logVersion).Info("Deleted project collection while upgrading to intermediate version v3.9.0")

	} else {
		log.Fatal("Project collection not found while upgrading to version v3.9.0")
	}

	return nil
}
