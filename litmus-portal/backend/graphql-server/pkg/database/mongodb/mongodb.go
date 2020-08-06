package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var clusterCollection *mongo.Collection
var backgroundContext = context.Background()
var err error

var collection = map[string]string{
	"Cluster": "cluster-collection",
}

var dbName = "litmus"

type Cluster struct {
	ClusterID          string  `bson:"cluster_id"`
	ProjectID          string  `bson:"project_id"`
	ClusterName        string  `bson:"cluster_name"`
	Description        *string `bson:"description"`
	PlatformName       string  `bson:"platform_name"`
	AccessKey          string  `bson:"access_key"`
	IsRegistered       bool    `bson:"is_registered"`
	IsClusterConfirmed bool    `bson:"is_cluster_confirmed"`
	IsActive           bool    `bson:"is_active"`
	UpdatedAt          string  `bson:"updated_at"`
	CreatedAt          string  `bson:"created_at"`
	ClusterType        string  `bson:"cluster_type"`
}

//DBInit initializes database connection
func DBInit() error {
	dbServer := os.Getenv("MONGODB_SERVER")
	clientOptions := options.Client().ApplyURI("mongodb://" + dbServer)
	client, err := mongo.Connect(backgroundContext, clientOptions)
	if err != nil {
		return err
	}

	ctx, _ := context.WithTimeout(backgroundContext, 20*time.Second)
	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return err
	} else {
		log.Print("Connected To MONGODB")
	}

	clusterCollection = client.Database(dbName).Collection(collection["Cluster"])
	return nil
}

func InsertCluster(cluster Cluster) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := clusterCollection.InsertOne(ctx, cluster)
	if err != nil {
		return err
	}

	return nil
}

func GetCluster(cluster_id string) (Cluster, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.M{"cluster_id": cluster_id}

	var cluster Cluster
	err = clusterCollection.FindOne(ctx, query).Decode(&cluster)
	if err != nil {
		return Cluster{}, err
	}

	return cluster, nil
}

func UpdateCluster(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := clusterCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}
