package v2_0_1

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

// upgradeAuthDb example db schema upgrade function
func upgradeAuthDb(logger *zap.Logger, dbClient *mongo.Client) error {
	collection := dbClient.Database("auth").Collection("usercredentials")
	_, err := collection.UpdateMany(context.Background(), bson.D{}, bson.D{{"$set", bson.D{{
		"organization", "litmus"}},
	}})
	return err
}
