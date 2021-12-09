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
	projectLitmusCollection := dbClient.Database("litmus").Collection("project") //project collection from litmus DB
	userLitmusCollection := dbClient.Database("litmus").Collection("user")       // user collection from litmus DB
	usersAuthCollection := dbClient.Database("auth").Collection("users")         // users collection from auth DB
	authDBProjectCollection := dbClient.Database("auth").Collection("project")   // project collected in auth DB

	// fetching the projects from project collection in litmus DB
	cursor, err := projectLitmusCollection.Find(context.Background(), bson.M{})
	if err != nil {
		fmt.Errorf("Error in getting project collection: %w", err)
	}

	var result []interface{}
	if err := cursor.All(context.Background(), &result); err != nil {
		fmt.Errorf("Error: %w", err)
	}

	// inserting the project documents in project collection(auth DB)
	_, err = authDBProjectCollection.InsertMany(context.TODO(), result)
	if err != nil {
		fmt.Errorf("Error: %w", err)
	}

	// deleting project collection in litmus DB
	err = projectLitmusCollection.Drop(context.Background())
	if err != nil {
		fmt.Errorf("Error: %w", err)
	}

	// deleting user collection in litmus DB
	err = userLitmusCollection.Drop(context.Background())
	if err != nil {
		fmt.Errorf("Error: %w", err)
	}

	// deleting users collection in auth DB
	err = usersAuthCollection.Drop(context.Background())
	if err != nil {
		fmt.Errorf("Error: %w", err)
	}

	// renaming usercredentials collection to users
	res := dbClient.Database("admin").RunCommand(context.Background(), bson.D{{"renameCollection", "auth.usercredentials"}, {"to", "auth.users"}})
	if res.Err() != nil {
		return res.Err()
	}
	return err
}
