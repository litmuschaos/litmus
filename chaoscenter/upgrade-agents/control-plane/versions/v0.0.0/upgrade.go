package v0_0_0

// remove
import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/pkg/database"
	log "github.com/sirupsen/logrus"
)

/* This example upgrade renames auth collection users to client*/

func upgradeUsersCollection(logger *log.Logger, dbClient *mongo.Client, ctx context.Context) error {

	logVersion := log.Fields{
		"version": "0.0.0",
	}

	res := dbClient.Database(database.AdminDB).RunCommand(
		context.Background(),
		bson.D{{"renameCollection", "auth.users"}, {"to", "auth.client"}},
	)
	if res.Err() != nil {
		log.WithFields(logVersion).Fatal("Error while renaming collection 'auth.users' to 'auth.client'")
		return res.Err()
	}

	logger.WithFields(logVersion).Info("Users collection renamed to admin while upgrading to intermediate version v3.8.0")

	logger.WithFields(logVersion).Info("Collection 'auth.users' renamed to 'auth.client' successfully.")

	return nil
}

func upgradeEnvironmentCollectionIndexes(logger *log.Logger, dbClient *mongo.Client, ctx context.Context) error {
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
		"version": "0.0.0",
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

	return nil
}

func upgradeWorkflow(logger *log.Logger, dbClient *mongo.Client, ctx context.Context) error {
	workflowCollection := dbClient.Database("litmus").Collection("workflow-collection")

	logVersion := log.Fields{
		"version": "0.0.0",
	}

	//delete the existing workflow_name index
	_, err := workflowCollection.Indexes().DropOne(context.Background(), "workflow_name_1")
	if err != nil {
		logger.WithFields(logVersion).Fatal("Error while dropping workflow")
	}

	//create a new workflow index with partial filter expression
	_, err = workflowCollection.Indexes().CreateOne(context.Background(),
		mongo.IndexModel{Keys: bson.M{"workflow_name": 1},
			Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.D{{
				"isRemoved", false,
			}})})

	return err
}
