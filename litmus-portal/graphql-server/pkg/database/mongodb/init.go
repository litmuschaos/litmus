package mongodb

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Enum for Database collections
const (
	ClusterCollection = iota
	UserCollection
	ProjectCollection
	WorkflowCollection
	GitOpsCollection
	MyHubCollection
	DataSourceCollection
	PanelCollection
	DashboardCollection
)

// MongoInterface requires a MongoClient that implements the Initialize method to create the Mongo DB client
// and a initAllCollection method to initialize all DB Collections
type MongoInterface interface {
	Initialize() *MongoClient
	initAllCollection()
}

// MongoClient structure contains all the Database collections and the instance of the Database
type MongoClient struct {
	Database             *mongo.Database
	ClusterCollection    *mongo.Collection
	UserCollection       *mongo.Collection
	ProjectCollection    *mongo.Collection
	WorkflowCollection   *mongo.Collection
	GitOpsCollection     *mongo.Collection
	MyHubCollection      *mongo.Collection
	DataSourceCollection *mongo.Collection
	PanelCollection      *mongo.Collection
	DashboardCollection  *mongo.Collection
}

var (
	Client MongoInterface = &MongoClient{}

	collections = map[int]string{
		ClusterCollection:    "cluster-collection",
		UserCollection:       "user",
		ProjectCollection:    "project",
		WorkflowCollection:   "workflow-collection",
		GitOpsCollection:     "gitops-collection",
		MyHubCollection:      "myhub",
		DataSourceCollection: "datasource-collection",
		PanelCollection:      "panel-collection",
		DashboardCollection:  "dashboard-collection",
	}
	// TODO: remove this
	Database *mongo.Database
	dbName   = "litmus"

	ConnectionTimeout = 20 * time.Second
	backgroundContext = context.Background()
	err               error
)

// Initialize initializes database connection
func (m *MongoClient) Initialize() *MongoClient {
	var (
		dbServer = os.Getenv("DB_SERVER")
		dbUser = os.Getenv("DB_USER")
		dbPassword      = os.Getenv("DB_PASSWORD")
	)

	if dbServer == "" || dbUser == "" || dbPassword == "" {
		log.Fatal("DB configuration failed")
	}

	credential := options.Credential{
		Username: dbUser,
		Password: dbPassword,
	}

	clientOptions := options.Client().ApplyURI(dbServer).SetAuth(credential)
	client, err := mongo.Connect(backgroundContext, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	ctx, _ := context.WithTimeout(backgroundContext, ConnectionTimeout)

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	} else {
		log.Print("Connected To MONGODB")
	}

	m.Database = client.Database(dbName)
	m.initAllCollection()
	return m
}

// initAllCollection initializes all the database collections
func (m *MongoClient) initAllCollection() {
	m.ClusterCollection = m.Database.Collection(collections[ClusterCollection])
	m.UserCollection = m.Database.Collection(collections[UserCollection])
	m.ProjectCollection = m.Database.Collection(collections[ProjectCollection])
	m.WorkflowCollection = m.Database.Collection(collections[WorkflowCollection])
	m.GitOpsCollection = m.Database.Collection(collections[GitOpsCollection])
	m.MyHubCollection = m.Database.Collection(collections[MyHubCollection])
	m.DataSourceCollection = m.Database.Collection(collections[DataSourceCollection])
	m.PanelCollection = m.Database.Collection(collections[PanelCollection])
	m.DashboardCollection = m.Database.Collection(collections[DashboardCollection])
}
