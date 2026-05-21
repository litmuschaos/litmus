package chaos_infrastructure

import (
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
)

func TestGetVersionDetailsSelectsLatestSemanticVersion(t *testing.T) {
	previousCompatibleVersions := utils.Config.InfraCompatibleVersions
	t.Cleanup(func() {
		utils.Config.InfraCompatibleVersions = previousCompatibleVersions
	})

	utils.Config.InfraCompatibleVersions = `["3.29.0","4.0.0"]`

	service := NewChaosInfrastructureService(nil, nil, nil)
	versionDetails, err := service.GetVersionDetails()
	if err != nil {
		t.Fatalf("GetVersionDetails returned error: %v", err)
	}

	if versionDetails.LatestVersion != "4.0.0" {
		t.Fatalf("expected latest version 4.0.0, got %q", versionDetails.LatestVersion)
	}
}

func TestGetVersionDetailsTreatsCIVersionAsLowestVersion(t *testing.T) {
	previousCompatibleVersions := utils.Config.InfraCompatibleVersions
	t.Cleanup(func() {
		utils.Config.InfraCompatibleVersions = previousCompatibleVersions
	})

	utils.Config.InfraCompatibleVersions = `["ci","3.10.0"]`

	service := NewChaosInfrastructureService(nil, nil, nil)
	versionDetails, err := service.GetVersionDetails()
	if err != nil {
		t.Fatalf("GetVersionDetails returned error: %v", err)
	}

	if versionDetails.LatestVersion != "3.10.0" {
		t.Fatalf("expected latest version 3.10.0, got %q", versionDetails.LatestVersion)
	}
}
