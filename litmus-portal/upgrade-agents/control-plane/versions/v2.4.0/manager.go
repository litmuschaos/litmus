package v2_4_0

import (
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

// VersionManager implements IVersionManger
type VersionManager struct {
	Logger   *zap.Logger
	DBClient *mongo.Client
}

// NewVersionManger provides a new instance of a new VersionManager
func NewVersionManger(logger *zap.Logger, dbClient *mongo.Client) *VersionManager {
	return &VersionManager{Logger: logger, DBClient: dbClient}
}

// Run executes all the steps required for the Version Manger
// to upgrade from the previous version to `this` version
func (vm VersionManager) Run() error {
	if err := upgradeAuthDb(vm.Logger, vm.DBClient); err != nil {
		return err
	}
	// other upgrade step .....
	return nil
}
