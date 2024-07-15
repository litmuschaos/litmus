package v3_8_0

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	// "go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/pkg/database"
	log "github.com/sirupsen/logrus"
)

func upgradeExecutor(logger *log.Logger, dbClient *mongo.Client, ctx context.Context) error {
	session, err := dbClient.StartSession()
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	err = session.StartTransaction()
	if err != nil {
		return err
	}

	logVersion := log.Fields{
		"version": "3.8.0",
	}

	db := dbClient.Database(database.AuthDB)
	collectionsNames, err := db.ListCollectionNames(ctx, bson.M{"name": "users"})
	if err != nil {
		session.AbortTransaction(context.Background())
		return err
	}

	if len(collectionsNames) > 0 {
		res := dbClient.Database(database.AdminDB).RunCommand(
			context.Background(),
			bson.D{{"renameCollection", "auth.users"}, {"to", "auth.client"}},
		)
		if res.Err() != nil {
			session.AbortTransaction(ctx)
			return res.Err()
		}

		logger.WithFields(logVersion).Info("Users collection renamed to admin while upgrading to intermediate version v3.8.0")
	} else {
		session.AbortTransaction(ctx)
		log.Fatal("Users collection not found while upgrading to version v3.8.0")
	}

	err = session.CommitTransaction(ctx)
	if err != nil {
		return err
	}

	logger.WithFields(logVersion).Info("Collection 'auth.users' renamed to 'auth.client' successfully.")

	return nil
}
