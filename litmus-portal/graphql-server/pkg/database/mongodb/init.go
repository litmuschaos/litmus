package mongodb

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	collections = map[string]string{
		"Cluster":    "cluster-collection",
		"User":       "user",
		"Project":    "project",
		"Workflow":   "workflow-collection",
		"DataSource": "datasource-collection",
		"Panel":      "panel-collection",
		"DashBoard":  "dashboard-collection",
	}
	//Database ...
	Database *mongo.Database
	dbName   = "litmus"

	//Collections ...
	clusterCollection    *mongo.Collection
	workflowCollection   *mongo.Collection
	dataSourceCollection *mongo.Collection
	panelCollection      *mongo.Collection
	dashBoardCollection  *mongo.Collection
	backgroundContext    = context.Background()
	err                  error
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
	WorkflowName        string             `bson:"workflow_name"`
	WorkflowDescription string             `bson:"workflow_description"`
	Weightages          []*WeightagesInput `bson:"weightages"`
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

type DataSource struct {
	DsID              string  `bson:"ds_id"`
	DsName            string  `bson:"ds_name"`
	DsType            string  `bson:"ds_type"`
	DsURL             string  `bson:"ds_url"`
	AccessType        string  `bson:"access_type"`
	AuthType          string  `bson:"auth_type"`
	BasicAuthUsername *string `bson:"basic_auth_username"`
	BasicAuthPassword *string `bson:"basic_auth_password"`
	ScrapeInterval    int     `bson:"scrape_interval"`
	QueryTimeout      int     `bson:"query_timeout"`
	HTTPMethod        string  `bson:"http_method"`
	CreatedAt         string  `bson:"created_at"`
	UpdatedAt         string  `bson:"updated_at"`
	ProjectID         string  `bson:"project_id"`
	IsRemoved         bool    `bson:"is_removed"`
}

type DashBoard struct {
	DbID        string       `bson:"db_id"`
	DsID        string       `bson:"ds_id"`
	DbName      string       `bson:"db_name"`
	DbType      string       `bson:"db_type"`
	CreatedAt   string       `bson:"created_at"`
	UpdatedAt   string       `bson:"updated_at"`
	ClusterID   string       `bson:"cluster_id"`
	ProjectID   string       `bson:"project_id"`
	EndTime     string       `bson:"end_time"`
	StartTime   string       `bson:"start_time"`
	RefreshRate string       `bson:"refresh_rate"`
	PanelGroups []PanelGroup `bson:"panel_groups"`
	IsRemoved   bool         `bson:"is_removed"`
}

type PanelGroup struct {
	PanelGroupName string `bson:"panel_group_name"`
	PanelGroupID   string `bson:"panel_group_id"`
}

type Panel struct {
	PanelID      string       `bson:"panel_id"`
	PanelOptions *PanelOption `bson:"panel_options"`
	PanelName    string       `bson:"panel_name"`
	PanelGroupID string       `bson:"panel_group_id"`
	PromQueries  []*PromQuery `bson:"prom_queries"`
	YAxisLeft    *string      `bson:"y_axis_left"`
	YAxisRight   *string      `bson:"y_axis_right"`
	XAxisDown    *string      `bson:"x_axis_down"`
	Unit         *string      `bson:"unit"`
	CreatedAt    string       `bson:"created_at"`
	UpdatedAt    string       `bson:"updated_at"`
	IsRemoved    bool         `bson:"is_removed"`
}

type PanelOption struct {
	Points   *bool `bson:"points"`
	Grids    *bool `bson:"grids"`
	LeftAxis *bool `bson:"left_axis"`
}

type PromQuery struct {
	Queryid       string  `bson:"queryid"`
	PromQueryName *string `bson:"prom_query_name"`
	Legend        *string `bson:"Legend"`
	Resolution    *string `bson:"resolution"`
	Minstep       *string `bson:"minstep"`
	Line          *bool   `bson:"line"`
	CloseArea     *bool   `bson:"close_area"`
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
	_, err := workflowCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"workflow_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.M{
				"workflow_name": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		log.Fatal("Error Creating Index for Workflow Collection: ", err)
	}
	dataSourceCollection = Database.Collection(collections["DataSource"])
	panelCollection = Database.Collection(collections["Panel"])
	dashBoardCollection = Database.Collection(collections["DashBoard"])
}
