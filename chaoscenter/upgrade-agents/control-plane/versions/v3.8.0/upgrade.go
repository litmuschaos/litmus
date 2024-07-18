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

	logVersion := log.Fields{
		"version": "3.8.0",
	}

	res := dbClient.Database(database.AdminDB).RunCommand(
		context.Background(),
		bson.D{{"renameCollection", "auth.users"}, {"to", "auth.client"}},
	)
	if res.Err() != nil {
		log.Fatal(res.Err().Error())
		return res.Err()
	}

	logger.WithFields(logVersion).Info("Users collection renamed to admin while upgrading to intermediate version v3.8.0")

	logger.WithFields(logVersion).Info("Collection 'auth.users' renamed to 'auth.client' successfully.")

	return nil
}
