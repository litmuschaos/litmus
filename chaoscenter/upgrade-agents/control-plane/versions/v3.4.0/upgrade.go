package v3_4_0

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	// "github.com/mongodb/mongo-tools/mongodump"
	// "go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/pkg/database"
	log "github.com/sirupsen/logrus"
)

func upgradeMany(logger *log.Logger, dbClient *mongo.Client, ctx context.Context) error {

	// err = session.StartTransaction()
	// if err != nil {
	// 	log.Fatal("error starting transaction: %w", err)
	// }


		var indexes []string
		var environmentIDIndexName string

		environmentCollection := dbClient.Database(database.LitmusDB).Collection(database.EnvironmentCollection)
		indexView := environmentCollection.Indexes()
		cursor, err := indexView.List(ctx)
		if err != nil {
			// session.AbortTransaction(ctx)
			log.Error("error listing indexes: %w", err)
			return err
		}
		defer cursor.Close(ctx)

		environmentIDIndexExists := false

		logVersion := log.Fields{
			"version": "3.4.0",
		}

		for cursor.Next(ctx) {
			var index bson.M
			if err := cursor.Decode(&index); err != nil {
				log.Fatal("error decoding index: %w", err)
			}
			indexes = append(indexes, index["name"].(string))
			if keys, ok := index["key"].(bson.M); ok {
				if _, found := keys["environment_id"]; found {
					environmentIDIndexExists = true
					environmentIDIndexName = index["name"].(string)
				}
			}
		}

		// logIndexes := append(logVersion,)

		logIndexes := log.Fields{
			"version": "3.4.0",
			"indexes": indexes,
		}

		logger.WithFields(logIndexes).Info("Indexes found in environment collection while upgrading to intermediate version v3.4.0")

		logFields := log.Fields{
			"collection": database.EnvironmentCollection,
			"db":         database.LitmusDB,
		}

		if environmentIDIndexExists {
			_, err := environmentCollection.Indexes().DropOne(ctx, environmentIDIndexName)
			if err != nil {
				log.Fatal("error dropping index: %w", err)
			}
			logger.WithFields(logFields).Info("Deleted an existing index in environment collection while upgrading to intermediate v3.4.0")

			indexModel := mongo.IndexModel{
				Keys: bson.M{"environment_id": 1},
				Options: options.Index().
					SetUnique(true).
					SetPartialFilterExpression(bson.D{
						{"isRemoved", false},
					}),
			}

			_, err = environmentCollection.Indexes().CreateOne(ctx, indexModel)
			if err != nil {
				log.Fatal("error creating index: %w", err)
			}

			log.WithFields(logVersion).Info("Created a new index with partial filter expression environment_id while upgrading to intermediate v3.4.0")

		} else {
			log.Fatal("environment id index not found in version v3.4.0")
		}


	// if err != nil {
	// 	log.Fatal("error committing transaction: %w", err)
	// }

	return nil
}
