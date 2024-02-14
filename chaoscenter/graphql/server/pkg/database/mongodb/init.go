package mongodb

import (
	"context"
	"errors"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Enum for Database collections
const (
	ChaosInfraCollection = iota
	ChaosExperimentCollection
	ChaosExperimentRunsCollection
	ChaosHubCollection
	ImageRegistryCollection
	ServerConfigCollection
	GitOpsCollection
	UserCollection
	ProjectCollection
	EnvironmentCollection
	ChaosProbeCollection
)

// MongoInterface requires a MongoClient that implements the Initialize method to create the Mongo DB client
// and a initAllCollection method to initialize all DB Collections
type MongoInterface interface {
	Initialize(client *mongo.Client) *MongoClient
	initAllCollection()
}

// MongoClient structure contains all the Database collections and the instance of the Database
type MongoClient struct {
	Database                      *mongo.Database
	ChaosInfraCollection          *mongo.Collection
	ChaosExperimentCollection     *mongo.Collection
	ChaosExperimentRunsCollection *mongo.Collection
	ChaosHubCollection            *mongo.Collection
	ChaosServerConfigCollection   *mongo.Collection
	ImageRegistryCollection       *mongo.Collection
	ServerConfigCollection        *mongo.Collection
	GitOpsCollection              *mongo.Collection
	UserCollection                *mongo.Collection
	ProjectCollection             *mongo.Collection
	EnvironmentCollection         *mongo.Collection
	ChaosProbeCollection          *mongo.Collection
}

var (
	Client      MongoInterface = &MongoClient{}
	MgoClient   *mongo.Client
	Collections = map[int]string{
		ChaosInfraCollection:          "chaosInfrastructures",
		ChaosExperimentCollection:     "chaosExperiments",
		ChaosExperimentRunsCollection: "chaosExperimentRuns",
		ChaosProbeCollection:          "chaosProbes",
		ChaosHubCollection:            "chaosHubs",
		ImageRegistryCollection:       "imageRegistry",
		ServerConfigCollection:        "serverConfig",
		GitOpsCollection:              "gitops",
		UserCollection:                "user",
		ProjectCollection:             "project",
		EnvironmentCollection:         "environment",
	}

	DbName            = "litmus"
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
		return nil, errors.New("DB configuration failed")
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

	ctx, cancel := context.WithTimeout(backgroundContext, ConnectionTimeout)
	defer cancel()

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	logrus.Infof("connected to mongo")

	return client, nil
}

// Initialize initializes database connection
func (m *MongoClient) Initialize(client *mongo.Client) *MongoClient {
	m.Database = client.Database(DbName)
	m.initAllCollection()

	return m
}

// initAllCollection initializes all the database collections
func (m *MongoClient) initAllCollection() {
	m.UserCollection = m.Database.Collection(Collections[UserCollection])
	m.ProjectCollection = m.Database.Collection(Collections[ProjectCollection])

	// Initialize chaos infra collection
	err := m.Database.CreateCollection(context.TODO(), Collections[ChaosInfraCollection], nil)
	if err != nil {
		logrus.WithError(err).Error("failed to create chaosInfrastructures collection")
	}

	m.ChaosInfraCollection = m.Database.Collection(Collections[ChaosInfraCollection])
	_, err = m.ChaosInfraCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"infra_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.M{
				"name": 1,
			},
		},
	})
	if err != nil {
		logrus.WithError(err).Error("failed to create indexes for chaosInfrastructures collection")
	}

	// Initialize chaos experiment collection
	err = m.Database.CreateCollection(context.TODO(), Collections[ChaosExperimentCollection], nil)
	if err != nil {
		logrus.WithError(err).Error("failed to create chaosExperiments collection")
	}

	m.ChaosExperimentCollection = m.Database.Collection(Collections[ChaosExperimentCollection])
	_, err = m.ChaosExperimentCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"experiment_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.M{
				"name": 1,
			},
		},
	})
	if err != nil {
		logrus.WithError(err).Error("failed to create indexes for chaosExperiments collection")
	}

	// Initialize chaos experiment runs collection
	err = m.Database.CreateCollection(context.TODO(), Collections[ChaosExperimentRunsCollection], nil)
	if err != nil {
		logrus.WithError(err).Error("failed to create chaosExperimentRuns collection")
	}

	m.ChaosExperimentRunsCollection = m.Database.Collection(Collections[ChaosExperimentRunsCollection])
	_, err = m.ChaosExperimentRunsCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"experiment_run_id": 1,
			},
		},
	})
	if err != nil {
		logrus.WithError(err).Fatal("failed to create indexes for chaosExperimentRuns collection")
	}

	// Initialize chaos hubs collection
	err = m.Database.CreateCollection(context.TODO(), Collections[ChaosHubCollection], nil)
	if err != nil {
		logrus.WithError(err).Error("failed to create chaosHubs collection")
	}

	m.ChaosHubCollection = m.Database.Collection(Collections[ChaosHubCollection])
	_, err = m.ChaosHubCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"hub_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.M{
				"name": 1,
			},
		},
	})
	if err != nil {
		logrus.WithError(err).Fatal("failed to create indexes for chaosHubs collection")
	}

	m.GitOpsCollection = m.Database.Collection(Collections[GitOpsCollection])
	_, err = m.GitOpsCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"project_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		logrus.WithError(err).Fatal("Error Creating Index for GitOps Collection")
	}
	m.ImageRegistryCollection = m.Database.Collection(Collections[ImageRegistryCollection])
	_, err = m.ImageRegistryCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"project_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		logrus.WithError(err).Fatal("Error Creating Index for Image Registry Collection")
	}
	m.ServerConfigCollection = m.Database.Collection(Collections[ServerConfigCollection])
	_, err = m.ServerConfigCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"key": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		logrus.WithError(err).Fatal("Error Creating Index for Server Config Collection")
	}
	m.EnvironmentCollection = m.Database.Collection(Collections[EnvironmentCollection])
	_, err = m.EnvironmentCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"environment_id": 1,
			},
			Options: options.Index().SetUnique(true).SetPartialFilterExpression(bson.D{{
				"is_removed", false,
			}}),
		},
		{
			Keys: bson.M{
				"name": 1,
			},
		},
	})
	if err != nil {
		logrus.WithError(err).Fatal("failed to create indexes for environments collection")
	}
	// Initialize chaos probes collection
	err = m.Database.CreateCollection(context.TODO(), Collections[ChaosProbeCollection], nil)
	if err != nil {
		logrus.WithError(err).Error("failed to create chaosProbes collection")
	}

	m.ChaosProbeCollection = m.Database.Collection(Collections[ChaosProbeCollection])
	_, err = m.ChaosProbeCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"name": 1,
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{
				{"project_id", 1},
			},
		},
	})
	if err != nil {
		logrus.WithError(err).Error("failed to create indexes for chaosProbes collection")
	}
}
