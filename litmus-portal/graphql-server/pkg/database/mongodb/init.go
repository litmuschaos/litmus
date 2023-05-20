package mongodb

import (
	"context"
	"fmt"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Enum for Database collections
const (
	ClusterCollection = iota
	UserCollection
	ProjectCollection
	WorkflowCollection
	WorkflowTemplateCollection
	GitOpsCollection
	ChaosHubCollection
	DataSourceCollection
	PanelCollection
	DashboardCollection
	ImageRegistryCollection
	ServerConfigCollection
)

// MongoInterface requires a MongoClient that implements the Initialize method to create the Mongo DB client
// and a initAllCollection method to initialize all DB Collections
type MongoInterface interface {
	initAllCollection()
}

// MongoClient structure contains all the Database collections and the instance of the Database
type MongoClient struct {
	Database                   *mongo.Database
	ClusterCollection          *mongo.Collection
	UserCollection             *mongo.Collection
	ProjectCollection          *mongo.Collection
	WorkflowCollection         *mongo.Collection
	WorkflowTemplateCollection *mongo.Collection
	GitOpsCollection           *mongo.Collection
	ChaosHubCollection         *mongo.Collection
	DataSourceCollection       *mongo.Collection
	PanelCollection            *mongo.Collection
	DashboardCollection        *mongo.Collection
	ImageRegistryCollection    *mongo.Collection
	ServerConfigCollection     *mongo.Collection
}

var (
	collections = map[int]string{
		ClusterCollection:          "cluster-collection",
		UserCollection:             "user",
		ProjectCollection:          "project",
		WorkflowCollection:         "workflow-collection",
		WorkflowTemplateCollection: "workflow-template",
		GitOpsCollection:           "gitops-collection",
		ChaosHubCollection:         "chaoshub",
		DataSourceCollection:       "datasource-collection",
		PanelCollection:            "panel-collection",
		DashboardCollection:        "dashboard-collection",
		ImageRegistryCollection:    "image-registry-collection",
		ServerConfigCollection:     "server-config-collection",
	}

	dbName            = "litmus"
	ConnectionTimeout = 20 * time.Second
	backgroundContext = context.Background()
)

func MongoConnection() (*mongo.Client, error) {
	var (
		dbServer   = utils.Config.DbServer
		dbUser     = utils.Config.DbUser
		dbPassword = utils.Config.DbPassword
	)

	if dbServer == "" || dbUser == "" || dbPassword == "" {
		return nil, fmt.Errorf("missing required DB configuration")
	}

	credential := options.Credential{
		Username: dbUser,
		Password: dbPassword,
	}

	clientOptions := options.Client().ApplyURI(dbServer).SetAuth(credential)
	client, err := mongo.Connect(backgroundContext, clientOptions)
	if err != nil {
		return nil, err
	}

	ctx, _ := context.WithTimeout(backgroundContext, ConnectionTimeout)

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	} else {
		log.Infof("connected To MongoDB")
	}

	return client, nil
}

// Initialize initializes database connection
func Initialize(client *mongo.Client) *MongoClient {
	mongodbClient := &MongoClient{
		Database: client.Database(dbName),
	}
	mongodbClient.initAllCollection()

	return mongodbClient
}

// initAllCollection initializes all the database collections
func (m *MongoClient) initAllCollection() {
	m.ClusterCollection = m.Database.Collection(collections[ClusterCollection])
	m.UserCollection = m.Database.Collection(collections[UserCollection])
	m.ProjectCollection = m.Database.Collection(collections[ProjectCollection])

	m.WorkflowCollection = m.Database.Collection(collections[WorkflowCollection])
	_, err := m.WorkflowCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
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
			Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.D{{
				"isRemoved", false,
			}}),
		},
	})
	if err != nil {
		log.Fatal("error Creating Index for Workflow Collection: ", err)
	}

	m.WorkflowTemplateCollection = m.Database.Collection(collections[WorkflowTemplateCollection])
	m.GitOpsCollection = m.Database.Collection(collections[GitOpsCollection])
	_, err = m.GitOpsCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"project_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		log.Fatal("error Creating Index for GitOps Collection : ", err)
	}

	m.ChaosHubCollection = m.Database.Collection(collections[ChaosHubCollection])
	m.DataSourceCollection = m.Database.Collection(collections[DataSourceCollection])
	m.PanelCollection = m.Database.Collection(collections[PanelCollection])
	m.DashboardCollection = m.Database.Collection(collections[DashboardCollection])
	m.ImageRegistryCollection = m.Database.Collection(collections[ImageRegistryCollection])
	m.ServerConfigCollection = m.Database.Collection(collections[ServerConfigCollection])
	_, err = m.ServerConfigCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"key": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		log.Fatal("error Creating Index for Server Config Collection : ", err)
	}
}
