package versions

import (
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"

	v2_6_0 "github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/versions/v2.6.0"

	v2_4_0 "github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/versions/v2.4.0"

	v3_4_0 "github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/versions/v3.4.0"

	v3_8_0 "github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/versions/v3.8.0"

	v3_9_0 "github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/versions/v3.9.0"

	"github.com/litmuschaos/litmus/chaoscenter/upgrader-agents/control-plane/pkg/database"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
)

// UpgradeExecutor holds the details regarding the version and IVersionManager for a particular version
type UpgradeExecutor struct {
	NextVersion    string
	VersionManager IVersionManager
}

// UpgradeManager provides the functionality required to upgrade from the PreviousVersion to the TargetVersion
type UpgradeManager struct {
	Logger          *log.Logger
	DBClient        *mongo.Client
	PreviousVersion *Version
	TargetVersion   *Version
}

type Version struct {
	Major int
	Minor int
	Patch int
	Beta  int
}

// Converts version from type string to type Version
func ParseVersion(version string) *Version {
	parts := strings.Split(version, "-beta")
	mainParts := strings.Split(parts[0], ".")

	major, err := strconv.Atoi(mainParts[0])
	if err != nil {
		return &Version{}
	}

	minor, err := strconv.Atoi(mainParts[1])
	if err != nil {
		return &Version{}
	}

	mainPartsLength := len(mainParts)

	var patch int

	if mainPartsLength > 2 {
		patch, err = strconv.Atoi(mainParts[2])
		if err != nil {
			patch = 0
		}
	} else {
		patch = 0
	}

	if len(parts) > 1 {
		beta, err := strconv.Atoi(parts[1])
		if err != nil {
			return &Version{}
		}
		return &Version{Major: major, Minor: minor, Patch: patch, Beta: beta}
	} else {
		return &Version{Major: major, Minor: minor, Patch: patch, Beta: 0}
	}
}

// NewUpgradeManager creates an instance of a upgrade manager with the proper configurations
func NewUpgradeManager(logger *log.Logger, dbClient *mongo.Client) (*UpgradeManager, error) {

	// added for debug only to run version manager consistently
	database.UpdateVersion(dbClient, "3.3.0")

	currentVersion := os.Getenv("VERSION")
	log.WithFields(log.Fields{
		"targetVersion": currentVersion,
	}).Info("About target version")
	if currentVersion == "" {
		return nil, fmt.Errorf("current version env data missing")
	}
	config, err := database.GetVersion(dbClient)
	if err != nil {
		return nil, fmt.Errorf("failed to get previous version data from db, error=%w", err)
	}

	log.WithFields(log.Fields{
		"currentVersion": config.Value,
	}).Info("About current version")

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
		PreviousVersion: ParseVersion(config.Value.(string)),
		TargetVersion:   ParseVersion(currentVersion),
	}, nil
}

// getVersionMap returns a map that determines the possible upgrade path for any upgrade
func (m *UpgradeManager) getVersionMap() map[string]UpgradeExecutor {
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
		"3.4.0": {
			NextVersion:    "3.6.0",
			VersionManager: v3_4_0.NewVersionManger(m.Logger, m.DBClient),
		},
		"3.6.0": {
			NextVersion:    "3.7.0",
			VersionManager: nil,
		},
		"3.7.7-beta8": {
			NextVersion:    "",
			VersionManager: nil,
		},
		"3.8.0": {
			NextVersion:    "",
			VersionManager: v3_8_0.NewVersionManger(m.Logger, m.DBClient),
		},
		"3.9.0": {
			NextVersion:    "",
			VersionManager: v3_9_0.NewVersionManger(m.Logger, m.DBClient),
		},
		"4.0.0-beta8": {
			NextVersion:    "",
			VersionManager: nil,
		},
	}
}

func arrayToVersion(versionArray []int) string {
	if versionArray[3] == 0 {
		return strconv.Itoa(versionArray[0]) + "." + strconv.Itoa(versionArray[1]) + "." + strconv.Itoa(versionArray[2])
	} else {
		return strconv.Itoa(versionArray[0]) + "." + strconv.Itoa(versionArray[1]) + "." + strconv.Itoa(versionArray[2]) + "-beta" + strconv.Itoa(versionArray[3])
	}
}

func (v Version) getVersion() string {
	if v.Beta != 0 {
		return strconv.Itoa(v.Major) + "." + strconv.Itoa(v.Minor) + "." + strconv.Itoa(v.Patch) + "-beta" + strconv.Itoa(v.Beta)
	} else {
		return strconv.Itoa(v.Major) + "." + strconv.Itoa(v.Minor) + "." + strconv.Itoa(v.Patch)
	}
}

func sortVersionArray(versionArray []string) []string {
	var versionMatrix [][]int

	for _, v := range versionArray {
		var versionInt []int

		version := ParseVersion(v)
		versionInt = append(versionInt, version.Major, version.Minor, version.Patch, version.Beta)
		versionMatrix = append(versionMatrix, versionInt)
	}
	sort.Slice(versionMatrix, func(i, j int) bool {
		for k := 0; k < len(versionMatrix[i]) && k < len(versionMatrix[j]); k++ {
			if versionMatrix[i][k] != versionMatrix[j][k] {
				return versionMatrix[i][k] < versionMatrix[j][k]
			}
		}
		return len(versionMatrix[i]) < len(versionMatrix[j])
	})

	var sortedVersionArray []string

	for _, v := range versionMatrix {
		sortedVersionArray = append(sortedVersionArray, arrayToVersion(v))
	}
	// Print the sorted matrixay
	return sortedVersionArray
}

func parseVersionMap(m map[string]UpgradeExecutor, previousVersion string, targetVersion string) []string {
	var versions []string
	for version := range m {
		versions = append(versions, version)
	}
	_, okP := m[previousVersion]
	_, okT := m[targetVersion]

	if !okP {
		versions = append(versions, previousVersion)
	}

	if !okT {
		versions = append(versions, targetVersion)
	}
	return sortVersionArray(versions)
}

func linearSearchArray(version string, versionMapArray []string) int {

	for i, v := range versionMapArray {
		if v == version {
			return i
		}
	}
	return -1
}

// traceUpgradePath traces the upgrade path between the two versions by taking in them and the map
func traceUpgradePath(previousVersion Version, targetVersion Version, getVersionMap map[string]UpgradeExecutor) []string {
	versionStringMap := parseVersionMap(getVersionMap, previousVersion.getVersion(), targetVersion.getVersion())

	startIndex := linearSearchArray(previousVersion.getVersion(), versionStringMap)
	endIndex := linearSearchArray(targetVersion.getVersion(), versionStringMap)
	return versionStringMap[startIndex+1 : endIndex+1]
}

// Run executes all the steps required in the upgrade path from PreviousVersion to TargetVersion
func (m *UpgradeManager) Run() error {
	versionMap := m.getVersionMap()

	upgradePath := traceUpgradePath(*m.PreviousVersion, *m.TargetVersion, versionMap)
	log.WithFields(log.Fields{
		"upgradePath": upgradePath,
	}).Info("Sequential upgrade path to be followed")

	for _, v := range upgradePath {

		_, exists := versionMap[v]
		if exists && versionMap[v].VersionManager != nil {
			if err := versionMap[v].VersionManager.Run(); err != nil {
				return fmt.Errorf("failed to upgrade to version %v, error : %w", v, err)
			}
			database.UpdateVersion(m.DBClient, v)
			log.WithFields(log.Fields{
				"version": v,
			}).Info("Version upgraded to an intermediate version")
		}
	}
	database.UpdateVersion(m.DBClient, upgradePath[len(upgradePath)-1])
	log.WithFields(log.Fields{
		"version": m.TargetVersion.getVersion(),
	}).Info("Version upgrade successful")

	return nil
}
