package v0_0_0

import (
	"context"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
)

/* Template for Upgrade Manager to be followed for introducing new upgrade files*/

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
	err := upgradeUsersCollection(vm.Logger, vm.DBClient, ctx)
	if err != nil {
		return err
	}

	err = upgradeEnvironmentCollectionIndexes(vm.Logger, vm.DBClient, ctx)
	if err != nil {
		return err
	}

	err = upgradeWorkflow(vm.Logger, vm.DBClient, ctx)

	if err != nil {
		return err
	}

	return err
}
