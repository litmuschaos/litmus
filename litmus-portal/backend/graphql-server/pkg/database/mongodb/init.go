package mongodb

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	collections = map[string]string{
		"Cluster":     "cluster-collection",
		"WorkflowRun": "workflow-run",
		"User":        "user",
		"Project":     "project",
		"Workflow":    "workflow-collection",
	}
	//Database ...
	Database *mongo.Database
	dbName   = "litmus"

	//Collections ...
	clusterCollection     *mongo.Collection
	workflowRunCollection *mongo.Collection
	workflowCollection    *mongo.Collection
	backgroundContext     = context.Background()
	err                   error
)

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

type ChaosWorkFlowInput struct {
	WorkflowID          string             `bson:"workflow_id"`
	WorkflowManifest    string             `bson:"workflow_manifest"`
	CronSyntax          string             `bson:"cronSyntax"`
	WorkflowName        string             `bson:"Workflow_name"`
	WorkflowDescription string             `bson:"Workflow_description"`
	Weightages          []*WeightagesInput `bson:"Weightages"`
	IsCustomWorkflow    bool               `bson:"isCustomWorkflow"`
	UpdatedAt           string             `bson:"updated_at"`
	CreatedAt           string             `bson:"created_at"`
	ProjectID           string             `bson:"project_id"`
	ClusterID           string             `bson:"cluster_id"`
}

type WeightagesInput struct {
	ExperimentName string `bson:"experiment_name"`
	Weightage      int    `bson:"weightage"`
}

//init initializes database connection
func init() {

	dbServer := os.Getenv("DB_SERVER")
	if dbServer == "" {
		log.Fatal("Environment Variable DB_SERVER is not present")
	}
	clientOptions := options.Client().ApplyURI("mongodb://" + dbServer)
	client, err := mongo.Connect(backgroundContext, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	ctx, _ := context.WithTimeout(backgroundContext, 20*time.Second)

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	} else {
		log.Print("Connected To MONGODB")
	}

	Database = client.Database(dbName)
	initAllCollections()

}

func initAllCollections() {
	clusterCollection = Database.Collection(collections["Cluster"])
	workflowRunCollection = Database.Collection(collections["WorkflowRun"])
	workflowCollection = Database.Collection(collections["Workflow"])
}
