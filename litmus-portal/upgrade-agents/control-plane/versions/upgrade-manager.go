package versions

import (
	"errors"
	"fmt"
	v2_0_0 "github.com/litmuschaos/litmus/litmus-portal/upgrader-agents/control-plane/versions/v2.0.0"
	v2_0_0_beta9 "github.com/litmuschaos/litmus/litmus-portal/upgrader-agents/control-plane/versions/v2.0.0-beta9"
	"go.uber.org/zap"
)

const FALLBACK_PREVIOUS_VERSION = "v2.0.0-beta8"

type UpgradeExecutor struct {
	NextVersion string
	VersionManager IVersionManager
}

type UpgradeManager struct {
	Logger zap.Logger
	PreviousVersion string
	TargetVersion string
}

func NewUpgradeManager(logger zap.Logger) (UpgradeManager, error){
	return UpgradeManager{
		Logger: logger,
		PreviousVersion: "",
		TargetVersion: "",
	}, nil
}

func (m UpgradeManager) getUpgradePath() map[string]UpgradeExecutor {
	// key : previous version,
	// value :{ Version Manger that upgrades the system from priv version to next, NextVersion points to next version in the path}
	return map[string]UpgradeExecutor{
		"v2.0.0-beta8": {
			NextVersion: "v2.0.0-beta9",
			VersionManager : v2_0_0_beta9.NewVersionManger(m.Logger),
		},
		"v2.0.0-beta9": {
			NextVersion: "2.0.0",
			VersionManager : v2_0_0.NewVersionManger(m.Logger),
		},
		// latest version no more upgrades available
		"v2.0.0": {
			NextVersion: "",
			VersionManager : nil,
		},
	}
}

func (m UpgradeManager) verifyPath(upgradePath map[string]UpgradeExecutor) error {
	if m.PreviousVersion == m.TargetVersion {
		return errors.New("previous version and current version are same")
	}

	_, okP := upgradePath[m.PreviousVersion]
	_, okT := upgradePath[m.TargetVersion]

	if !okP && !okT {
		return fmt.Errorf("previous veriosn=%v or target version=%v not found in upgrade path", m.PreviousVersion, m.TargetVersion)
	}
	versionIterator := m.PreviousVersion
	for versionIterator!=""{
		versionIterator = upgradePath[versionIterator].NextVersion
		if versionIterator == m.TargetVersion{
			return nil
		}
	}
	return fmt.Errorf("upgrade path not found from previous veriosn=%v to target version=%v", m.PreviousVersion, m.TargetVersion)
}

func (m UpgradeManager) Run() error{
	upgradePath := m.getUpgradePath()

	// verify if upgrade possible
	if err:=m.verifyPath(upgradePath);err!=nil{
		return err
	}

	// start upgrade from previous version to target version
	versionIterator := m.PreviousVersion
	// loop till the target version is reached
	for versionIterator != m.TargetVersion{
		if err:= upgradePath[versionIterator].VersionManager.Run(); err!=nil{
			return fmt.Errorf("failed to upgrade to version %v, error : %w", versionIterator, err)
		}
		versionIterator = upgradePath[versionIterator].NextVersion
	}

	return nil
}