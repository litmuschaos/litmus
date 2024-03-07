package database

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// ServerConfig stores any server specific configuration in the db
type ServerConfig struct {
	Key   string      `bson:"key"`
	Value interface{} `bson:"value"`
}

// GetVersion returns the control plane version that is stored in the ServerConfig collection
func GetVersion(dbClient *mongo.Client) (ServerConfig, error) {
	collection := dbClient.Database(DbName).Collection(ServerConfigCollection)
	result := collection.FindOne(context.Background(), bson.D{
		{"key", "version"},
	})

	var config ServerConfig
	err := result.Decode(&config)
	return config, err
}

// UpdateVersion updates the control plane version in the ServerConfig collection
func UpdateVersion(dbClient *mongo.Client, version string) error {
	collection := dbClient.Database(DbName).Collection(ServerConfigCollection)
	_, err := collection.UpdateOne(context.Background(), bson.D{
		{"key", "version"},
	}, bson.D{{"$set", bson.D{{
		"value", version}},
	}})
	return err
}
