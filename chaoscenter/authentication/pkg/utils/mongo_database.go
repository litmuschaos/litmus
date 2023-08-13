package utils

import (
	"context"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoConnection creates a connection to the mongo
func MongoConnection() (*mongo.Client, error) {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	mongoCredentials := options.Credential{
		Username: DBUser,
		Password: DBPassword,
	}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(DBUrl).SetAuth(mongoCredentials))
	if err != nil {
		return nil, err
	}

	return client, nil
}

// CreateIndex creates a unique index for the given field in the collectionName
func CreateIndex(collectionName string, field string, db *mongo.Database) error {
	mod := mongo.IndexModel{
		Keys:    bson.M{field: 1},
		Options: options.Index().SetUnique(true),
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := db.Collection(collectionName)
	_, err := collection.Indexes().CreateOne(ctx, mod)
	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

// CreateTTLIndex creates a TTL index for the given field in the collectionName
func CreateTTLIndex(collectionName string, db *mongo.Database) error {
	// more info: https://www.mongodb.com/docs/manual/tutorial/expire-data/#expire-documents-at-a-specific-clock-time
	mod := mongo.IndexModel{
		Keys:    bson.M{ExpiresAtField: 1},
		Options: options.Index().SetExpireAfterSeconds(0),
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := db.Collection(collectionName)
	_, err := collection.Indexes().CreateOne(ctx, mod)
	if err != nil {
		log.Error(err)
		return err
	}
	return nil
}

// CreateCollection creates a new mongo collection if it does not exist
func CreateCollection(collectionName string, db *mongo.Database) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := db.CreateCollection(ctx, collectionName)
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			log.Info(collectionName + "'s collection already exists, continuing with the existing mongo collection")
			return nil
		} else {
			return err
		}
	}

	log.Info(collectionName + "'s mongo collection created")
	return nil
}
