package utils

import (
	"context"
	"time"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//DatabaseConnection creates a connection to the mongo database
func DatabaseConnection() (*mongo.Database, error) {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	mongoCredentials := options.Credential{
		Username: DBUser,
		Password: DBPassword,
	}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(DBUrl).SetAuth(mongoCredentials))
	if err != nil {
		return nil, err
	}
	db := client.Database(DBName)
	return db, nil
}

//CreateIndex creates a unique index for the given field in the collectionName
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
