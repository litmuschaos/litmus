package v3_4_0

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	// "go.mongodb.org/mongo-driver/mongo/options"

	log "github.com/sirupsen/logrus"
)

func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client) error {

	var indexes []string
	var environmentIDIndexName string

	environmentCollection := dbClient.Database("litmus").Collection("environment")
	indexView := environmentCollection.Indexes()
	cursor, err := indexView.List(context.TODO())
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.TODO())

	environmentIDIndexExists := false

	for cursor.Next(context.TODO()) {
		var index bson.M
		if err := cursor.Decode(&index); err != nil {
			log.Fatal(err)
		}
		indexes = append(indexes, index["name"].(string))
		if keys, ok := index["key"].(bson.M); ok {
			if _, found := keys["environment_id"]; found {
				environmentIDIndexExists = true
				environmentIDIndexName = index["name"].(string)
			}
		}
	}

	logger.WithFields(log.Fields{
		"version": "3.4.0",
		"indexes": indexes,
	}).Info("Indexes found in environment collection while upgrading to intermediate version v3.4.0")

	if environmentIDIndexExists {
		// delete the existing workflow_name index
		_, err := environmentCollection.Indexes().DropOne(context.Background(), environmentIDIndexName)
		if err != nil {
			fmt.Errorf("error: %w", err)
		}
		logger.WithFields(log.Fields{
			"version": "3.4.0",
		}).Info("Deleted an existing index in environment collection while upgrading to intermediate v3.4.0")

		//create a new workflow index with partial filter expression
		indexModel := mongo.IndexModel{
			Keys: bson.M{"environment_id": 1},
			Options: options.Index().
				SetUnique(true).
				SetPartialFilterExpression(bson.D{
					{"isRemoved", false},
				}),
		}

		_, err = environmentCollection.Indexes().CreateOne(context.Background(), indexModel)
		if err != nil {
			log.Fatalf("error creating index: %v", err)
		}

		log.WithFields(log.Fields{
			"version": "3.4.0",
		}).Info("Created a new index with partial filter expresion environment_id while upgrading to intermediate v3.4.0")

	} else {
		log.Fatal("environment id index not found in version v3.4.0")
	}

	return err
}
