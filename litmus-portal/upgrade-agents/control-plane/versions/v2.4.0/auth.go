package v2_4_0

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

// upgradeAuthDb: migrates project collection from litmus-db to auth-db, renames usercredentials collection to users"
func upgradeAuthDb(logger *zap.Logger, dbClient *mongo.Client) error {

	// migration of project collection to auth DB
	projectCollection := dbClient.Database("litmus").Collection("project")
	authDBProjectCollection := dbClient.Database("auth").Collection("project")
	cursor, err := projectCollection.Find(context.Background(), bson.M{})
	if err != nil {
		fmt.Errorf("Error in getting project collection: %w", err)
	}

	var result []interface{}
	if err := cursor.All(context.Background(), &result); err != nil {
		fmt.Errorf("Error: %w", err)
	}
	_, err = authDBProjectCollection.InsertMany(context.TODO(), result)
	if err != nil {
		fmt.Errorf("Error: %w", err)
	}
	err = projectCollection.Drop(context.Background())
	if err != nil {
		fmt.Errorf("Error: %w", err)
	}

	// renaming usercredentials collection to users
	dbClient.Database("admin").RunCommand(context.Background(), bson.D{{"renameCollection", "auth.usercredentials"}, {"to", "auth.users"}})
	return err
}
