package v3_9_0

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	log "github.com/sirupsen/logrus"
)

const (
	oldRole = "Editor"
	newRole = "Executor"
)

func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client, ctx context.Context) error {

	var err error
	collection := dbClient.Database(database.AuthDB).Collection(database.ProjectCollection)

	// Update the role from Editor to Executor
	filter := bson.M{"members.role": oldRole}
	update := bson.M{
		"$set": bson.M{"members.$[elem].role": newRole},
	}
	arrayFilters := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.M{"elem.role": oldRole},
		},
	})

	logVersion := log.Fields{
		"version": "3.9.0",
	}
	updateResult, err := collection.UpdateMany(ctx, filter, update, arrayFilters)
	if err != nil {
		logger.WithFields(logVersion).Fatal("Error while updating documents in intermediate version v3.9.0")
		return err
	}

	logUpdateDocuments := log.Fields{
		"documents_matched": updateResult.MatchedCount,
		"documents_updated": updateResult.ModifiedCount,
		"version":           "3.9.0",
	}

	logger.WithFields(logUpdateDocuments).Infof("Matched %v documents and updated %v documents in project collection", updateResult.MatchedCount, updateResult.ModifiedCount)

	usersCollection := dbClient.Database(database.AuthDB).Collection(database.UsersCollection)

	// Add the new field is_initial_lgin to all documents in Users Collection
	filter = bson.M{}
	update = bson.M{
		"$set": bson.M{"is_initial_login": false},
	}

	updateResult, err = usersCollection.UpdateMany(ctx, filter, update)
	if err != nil {
		logger.WithFields(logVersion).Fatal("Error while updating documents in intermediate version v3.9.0: ", err)
		return err
	}
	logDocumentsCount := log.Fields{
		"documents_matched": updateResult.MatchedCount,
		"documents_updated": updateResult.ModifiedCount,
		"version":           "3.9.0",
	}

	logger.WithFields(logDocumentsCount).Infof("Matched %v documents and updated %v documents in users collection.", updateResult.MatchedCount, updateResult.ModifiedCount)
	return nil
}
