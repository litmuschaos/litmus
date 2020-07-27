package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var clusterCollection *mongo.Collection
var backgroundContext context.Context

//DBInit initializes database connection
func DBInit() {
	dbServer := os.Getenv("DB_SERVER")
	dbName := os.Getenv("DB_NAME")
	collectionName := os.Getenv("COLLECTION_NAME")
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
	clusterCollection = client.Database(dbName).Collection(collectionName)
}

func InsertCluster(cluster model.Cluster) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := clusterCollection.InsertOne(ctx, cluster)
	if err != nil {
		log.Print("ERROR INSERT CLUSTER : ", err)
		return err
	}
	return nil
}

func GetClusters(_pid string) ([]model.Cluster, error) {
	query := bson.D{{"project_id", _pid}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	cursor, err := clusterCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GET CLUSTERS : ", err)
		return []model.Cluster{}, err
	}
	var clusters []model.Cluster
	err = cursor.All(ctx, &clusters)
	if err != nil {
		log.Print("ERROR GET CLUSTERS : ", err)
		return []model.Cluster{}, err
	}
	return clusters, nil
}

func GetCluster(_id string) ([]model.Cluster, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{"cluster_id", _id}}
	cursor, err := clusterCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GET CLUSTER : ", err)
		return []model.Cluster{}, err
	}
	var cluster []model.Cluster
	err = cursor.All(ctx, &cluster)
	if err != nil {
		log.Print("ERROR GET CLUSTER : ", err)
		return []model.Cluster{}, err
	}
	return cluster, nil
}

func UpdateCluster(_id, accessKey string, isRegistered bool, utime string) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{"cluster_id", _id}}
	update := bson.D{{"$set", bson.D{{"access_key", accessKey}, {"is_registered", isRegistered}, {"updated_at", utime}}}}
	_, err := clusterCollection.UpdateOne(ctx, query, update)
	if err != nil {
		log.Print("ERROR UPDATE CLUSTER : ", err)
		return err
	}
	return nil
}

func UpdateClusterData(_id, key string, state bool, utime string) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.D{{"cluster_id", _id}}
	update := bson.D{{"$set", bson.D{{key, state}, {"updated_at", utime}}}}
	_, err := clusterCollection.UpdateOne(ctx, query, update)
	if err != nil {
		log.Print("ERROR UPDATE CLUSTER : ", err)
		return err
	}
	return nil
}
