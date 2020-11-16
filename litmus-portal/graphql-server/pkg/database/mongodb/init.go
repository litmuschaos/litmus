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
		"Cluster":  "cluster-collection",
		"User":     "user",
		"Project":  "project",
		"Workflow": "workflow-collection",
	}
	//Database ...
	Database *mongo.Database
	dbName   = "litmus"

	//Collections ...
	clusterCollection  *mongo.Collection
	workflowCollection *mongo.Collection
	backgroundContext  = context.Background()
	err                error
)

type Cluster struct {
	ClusterID          string  `bson:"cluster_id"`
	ProjectID          string  `bson:"project_id"`
	ClusterName        string  `bson:"cluster_name"`
	Description        *string `bson:"description"`
	PlatformName       string  `bson:"platform_name"`
	AgentNamespace     *string `bson:"agent_namespace"`
	Serviceaccount     *string `bson:"serviceaccount"`
	AgentScope         string  `bson:"agent_scope"`
	AgentNsExists      *bool   `bson:"agent_ns_exists"`
	AgentSaExists      *bool   `bson:"agent_sa_exists"`
	AccessKey          string  `bson:"access_key"`
	IsRegistered       bool    `bson:"is_registered"`
	IsClusterConfirmed bool    `bson:"is_cluster_confirmed"`
	IsActive           bool    `bson:"is_active"`
	UpdatedAt          string  `bson:"updated_at"`
	CreatedAt          string  `bson:"created_at"`
	ClusterType        string  `bson:"cluster_type"`
	Token              string  `bson:"token"`
	IsRemoved          bool    `bson:"is_removed"`
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
	WorkflowRuns        []*WorkflowRun     `bson:"workflow_runs"`
	IsRemoved           bool               `bson:"isRemoved"`
}

type WorkflowRun struct {
	WorkflowRunID string `bson:"workflow_run_id"`
	LastUpdated   string `bson:"last_updated"`
	ExecutionData string `bson:"execution_data"`
	Completed     bool   `bson:"completed"`
}

type WeightagesInput struct {
	ExperimentName string `bson:"experiment_name"`
	Weightage      int    `bson:"weightage"`
}

//init initializes database connection
func init() {

	var (
		dbServer = os.Getenv("DB_SERVER")
		username = os.Getenv("DB_USER")
		pwd      = os.Getenv("DB_PASSWORD")
	)

	if dbServer == "" || username == "" || pwd == "" {
		log.Fatal("DB configuration failed")
	}

	credential := options.Credential{
		Username: username,
		Password: pwd,
	}

	clientOptions := options.Client().ApplyURI(dbServer).SetAuth(credential)
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
	workflowCollection = Database.Collection(collections["Workflow"])
}
