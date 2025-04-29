package v3_9_0

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/pkg/database"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
)

// VersionManager implements IVersionManger
type VersionManager struct {
	Logger   *log.Logger
	DBClient *mongo.Client
	Context  *context.Context
}

// NewVersionManger provides a new instance of a new VersionManager
func NewVersionManger(logger *log.Logger, dbClient *mongo.Client) *VersionManager {
	return &VersionManager{Logger: logger, DBClient: dbClient}
}

// Run executes all the steps required for the Version Manger
// to upgrade from the previous version to `this` version
func (vm VersionManager) Run() error {
	ctx := context.Background()
	session, err := vm.DBClient.StartSession()

	defer session.EndSession(ctx)

	logVersion := log.Fields{
		"version":    "3.9.0",
		"database":   database.LitmusDB,
		"collection": database.ProjectCollection,
	}

	if err != nil {
		// log.Fatal(logVersion, err)
		log.WithFields(logVersion).Fatal("Error while starting session")
	}

	defer session.EndSession(ctx)

	err = mongo.WithSession(ctx, session, func(sc mongo.SessionContext) error {
		// Start the transaction
		err := session.StartTransaction()
		if err != nil {
			log.Fatal("error starting transaction: %w", err)
		}

		if err := upgradeProjectCollection(vm.Logger, vm.DBClient, sc); err != nil {
			return err
		}

		if err := upgradeUsersCollection(vm.Logger, vm.DBClient, sc); err != nil {
			return err
		}
		// Commit the transaction
		err = session.CommitTransaction(sc)

		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		// Abort the transaction if it fails
		abortError := session.AbortTransaction(ctx)
		if abortError != nil {
			log.Fatal("error committing transaction: %w", err)
		}
	}
	return err
}
