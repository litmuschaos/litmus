package database

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"os"
	"time"
)

var clusterCollection *mongo.Collection
var workflowRunCollection *mongo.Collection
var backgroundContext context.Context

//DBInit initializes database connection
func DBInit() {
	dbServer := os.Getenv("DB_SERVER")
	//dbName := os.Getenv("DB_NAME")
	//collectionName := os.Getenv("COLLECTION_NAME")
	clientOptions := options.Client().ApplyURI("mongodb://" + dbServer)
	client, err := mongo.Connect(context.TODO(), clientOptions)

	if err != nil {
		log.Fatal(err)
	}
	backgroundContext = context.Background()
	ctx, _ := context.WithTimeout(backgroundContext, 20*time.Second)
	// Check the connection
	err = client.Ping(ctx, nil)

	if err != nil {
		log.Fatal(err)
	}
	log.Print("Connected To DB")
	clusterCollection = client.Database("litmus").Collection("cluster")
	workflowRunCollection = client.Database("litmus").Collection("workflow_run")
}
