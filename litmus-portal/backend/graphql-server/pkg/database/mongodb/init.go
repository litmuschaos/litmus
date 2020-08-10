package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var clusterCollection *mongo.Collection
var workflowRunCollection *mongo.Collection
var backgroundContext = context.Background()
var err error

var collections = map[string]string{
	"Cluster":     "cluster-collection",
	"WorkflowRun": "workflow-run",
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

type WorkflowRun struct {
	WorkflowRunID string `bson:"workflow_run_id"`
	WorkflowID    string `bson:"workflow_id"`
	ClusterName   string `bson:"cluster_name"`
	LastUpdated   string `bson:"last_updated"`
	ProjectID     string `bson:"project_id"`
	ClusterID     string `bson:"cluster_id"`
	WorkflowName  string `bson:"workflow_name"`
	ExecutionData string `bson:"execution_data"`
}

//DBInit initializes database connection
func DBInit() error {
	dbServer := os.Getenv("DB_SERVER")
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

	clusterCollection = client.Database(dbName).Collection(collections["Cluster"])
	workflowRunCollection = client.Database(dbName).Collection(collections["WorkflowRun"])
	return nil
}
