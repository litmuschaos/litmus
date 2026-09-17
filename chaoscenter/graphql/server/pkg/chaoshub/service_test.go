package chaoshub_test

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
	"github.com/stretchr/testify/assert"
)

func TestGetChaosFault_Valid(t *testing.T) {
	utils.Config.DefaultHubName = "test-default-hub"
	hubDir := filepath.Join("/tmp", "default", "test-default-hub", "faults", "pod-delete", "pod-delete")
	err := os.MkdirAll(hubDir, 0755)
	assert.NoError(t, err)
	t.Cleanup(func() {
		os.RemoveAll(filepath.Join("/tmp", "default", "test-default-hub"))
	})

	csvPath := filepath.Join(hubDir, "pod-delete.chartserviceversion.yaml")
	enginePath := filepath.Join(hubDir, "engine.yaml")
	faultPath := filepath.Join(hubDir, "fault.yaml")

	assert.NoError(t, os.WriteFile(csvPath, []byte("csv-data"), 0644))
	assert.NoError(t, os.WriteFile(enginePath, []byte("engine-data"), 0644))
	assert.NoError(t, os.WriteFile(faultPath, []byte("fault-data"), 0644))

	service := chaoshub.NewService(nil)
	req := model.ExperimentRequest{
		HubID:          chaoshub.DefaultHubID,
		Category:       "pod-delete",
		ExperimentName: "pod-delete",
	}

	details, err := service.GetChaosFault(context.Background(), req, "test-project")
	assert.NoError(t, err)
	assert.NotNil(t, details)
	assert.Equal(t, "csv-data", details.CSV)
	assert.Equal(t, "engine-data", details.Engine)
	assert.Equal(t, "fault-data", details.Fault)
}

func TestGetChaosFault_PathTraversal_Relative(t *testing.T) {
	utils.Config.DefaultHubName = "test-default-hub"
	service := chaoshub.NewService(nil)

	req := model.ExperimentRequest{
		HubID:          chaoshub.DefaultHubID,
		Category:       "../../../etc",
		ExperimentName: "passwd",
	}

	details, err := service.GetChaosFault(context.Background(), req, "test-project")
	assert.Error(t, err)
	assert.Nil(t, details)
	assert.Contains(t, err.Error(), "path traversal detected")
}

func TestGetChaosFault_PathTraversal_Nested(t *testing.T) {
	utils.Config.DefaultHubName = "test-default-hub"
	service := chaoshub.NewService(nil)

	req := model.ExperimentRequest{
		HubID:          chaoshub.DefaultHubID,
		Category:       "pod-delete/../../etc",
		ExperimentName: "passwd",
	}

	details, err := service.GetChaosFault(context.Background(), req, "test-project")
	assert.Error(t, err)
	assert.Nil(t, details)
	assert.Contains(t, err.Error(), "path traversal detected")
}

func TestGetChaosFault_PathTraversal_ContainmentPrefix(t *testing.T) {
	utils.Config.DefaultHubName = "test-hub"
	service := chaoshub.NewService(nil)

	req := model.ExperimentRequest{
		HubID:          chaoshub.DefaultHubID,
		Category:       "../../test-hub-other/faults/pod-delete",
		ExperimentName: "pod-delete",
	}

	details, err := service.GetChaosFault(context.Background(), req, "test-project")
	assert.Error(t, err)
	assert.Nil(t, details)
	assert.Contains(t, err.Error(), "path traversal detected")
}

func TestGetChaosFault_PathTraversal_AbsolutePath(t *testing.T) {
	utils.Config.DefaultHubName = "test-default-hub"
	service := chaoshub.NewService(nil)

	req := model.ExperimentRequest{
		HubID:          chaoshub.DefaultHubID,
		Category:       "../../..",
		ExperimentName: "etc/passwd",
	}

	details, err := service.GetChaosFault(context.Background(), req, "test-project")
	assert.Error(t, err)
	assert.Nil(t, details)
	assert.Contains(t, err.Error(), "path traversal detected")
}
