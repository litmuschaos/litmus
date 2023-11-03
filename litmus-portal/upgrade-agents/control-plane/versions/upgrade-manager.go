package versions

import (
	"fmt"
	"os"

	v2_6_0 "github.com/litmuschaos/litmus/litmus-portal/upgrader-agents/control-plane/versions/v2.6.0"

	v2_4_0 "github.com/litmuschaos/litmus/litmus-portal/upgrader-agents/control-plane/versions/v2.4.0"

	"github.com/litmuschaos/litmus/litmus-portal/upgrader-agents/control-plane/pkg/database"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

// UpgradeExecutor holds the details regarding the version and IVersionManager for a particular version
type UpgradeExecutor struct {
	NextVersion    string
	VersionManager IVersionManager
}

// UpgradeManager provides the functionality required to upgrade from the PreviousVersion to the TargetVersion
type UpgradeManager struct {
	Logger          *zap.Logger
	DBClient        *mongo.Client
	PreviousVersion string
	TargetVersion   string
}

// NewUpgradeManager creates an instance of a upgrade manager with the proper configurations
func NewUpgradeManager(logger *zap.Logger, dbClient *mongo.Client) (*UpgradeManager, error) {
	currentVersion := os.Getenv("VERSION")
	if currentVersion == "" {
		return nil, fmt.Errorf("current version env data missing")
	}
	config, err := database.GetVersion(dbClient)
	if err != nil {
		return nil, fmt.Errorf("failed to get previous version data from db, error=%w", err)
	}
	if config.Value == nil || config.Value.(string) == "" {
		return nil, fmt.Errorf("failed to get previous version data from db, value=%v", config.Value)
	}
	if config.Value.(string) == currentVersion {
		logger.Info("Not upgrading agent plane since current version and desired version are same ")
		return nil, nil
	}

	return &UpgradeManager{
		Logger:          logger,
		DBClient:        dbClient,
		PreviousVersion: config.Value.(string),
		TargetVersion:   currentVersion,
	}, nil
}

// getUpgradePath returns a map that determines the possible upgrade path for any upgrade
func (m *UpgradeManager) getUpgradePath() map[string]UpgradeExecutor {
	// key : previous version,
	// value :{ Version Manger that upgrades the system from priv version to next, NextVersion points to next version in the path}
	return map[string]UpgradeExecutor{
		"2.3.0": {
			NextVersion:    "2.4.0",
			VersionManager: v2_4_0.NewVersionManger(m.Logger, m.DBClient),
		},

		"2.4.0": {
			NextVersion:    "2.5.0",
			VersionManager: nil,
		},

		"2.5.0": {
			NextVersion:    "2.6.0",
			VersionManager: v2_6_0.NewVersionManger(m.Logger, m.DBClient),
		},

		"2.6.0": {
			NextVersion:    "2.7.0",
			VersionManager: nil,
		},

		"2.7.0": {
			NextVersion:    "2.8.0",
			VersionManager: nil,
		},

		"2.8.0": {
			NextVersion:    "2.9.0",
			VersionManager: nil,
		},

		"2.9.0": {
			NextVersion:    "2.10.0",
			VersionManager: nil,
		},

		"2.10.0": {
			NextVersion:    "2.11.0",
			VersionManager: nil,
		},

		"2.11.0": {
			NextVersion:    "2.12.0",
			VersionManager: nil,
		},

		"2.12.0": {
			NextVersion:    "2.13.0",
			VersionManager: nil,
		},

		"2.13.0": {
			NextVersion:    "2.14.0",
			VersionManager: nil,
		},

		"2.14.0": {
			NextVersion:    "3.0-beta1",
			VersionManager: nil,
		},

		"3.0-beta1": {
			NextVersion:    "3.0.0-beta2",
			VersionManager: nil,
		},

		"3.0.0-beta2": {
			NextVersion:    "3.0.0-beta3",
			VersionManager: nil,
		},

		"3.0.0-beta3": {
			NextVersion:    "3.0.0-beta4",
			VersionManager: nil,
		},

		"3.0.0-beta4": {
			NextVersion:    "3.0.0-beta5",
			VersionManager: nil,
		},

		"3.0.0-beta5": {
			NextVersion:    "3.0.0-beta6",
			VersionManager: nil,
		},

		"3.0.0-beta6": {
			NextVersion:    "3.0.0-beta7",
			VersionManager: nil,
		},

		"3.0.0-beta7": {
			NextVersion:    "3.0.0-beta8",
			VersionManager: nil,
		},

		// latest version, no more upgrades available
		"3.0.0-beta8": {
			NextVersion:    "",
			VersionManager: nil,
		},
	}
}

// verifyPath verifies whether the current upgrade from PreviousVersion to TargetVersion
// is possible given the configured upgrade path
func (m *UpgradeManager) verifyPath(upgradePath map[string]UpgradeExecutor) error {

	_, okP := upgradePath[m.PreviousVersion]
	_, okT := upgradePath[m.TargetVersion]

	if !okP && !okT {
		return fmt.Errorf("previous version=%v or target version=%v not found in upgrade path", m.PreviousVersion, m.TargetVersion)
	}
	versionIterator := m.PreviousVersion
	for versionIterator != "" {
		versionIterator = upgradePath[versionIterator].NextVersion
		if versionIterator == m.TargetVersion {
			return nil
		}
	}
	return fmt.Errorf("upgrade path not found from previous version=%v to target version=%v", m.PreviousVersion, m.TargetVersion)
}

// Run executes all the steps required in the upgrade path from PreviousVersion to TargetVersion
func (m *UpgradeManager) Run() error {
	upgradePath := m.getUpgradePath()

	// verify if upgrade possible
	if err := m.verifyPath(upgradePath); err != nil {
		return err
	}

	// start upgrade from previous version to target version
	versionIterator := m.PreviousVersion
	// loop till the target version is reached
	for versionIterator != m.TargetVersion {
		// Skipping schema upgrade, if version manager not available (Only version will be upgraded)
		if upgradePath[versionIterator].VersionManager != nil {
			if err := upgradePath[versionIterator].VersionManager.Run(); err != nil {
				return fmt.Errorf("failed to upgrade to version %v, error : %w", versionIterator, err)
			}
		}
		versionIterator = upgradePath[versionIterator].NextVersion
	}

	err := database.UpdateVersion(m.DBClient, m.TargetVersion)
	if err != nil {
		return fmt.Errorf("failed to update version in server config collection, error=%w", err)
	}

	return nil
}
