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

func TestGetChaosFault_Valid_DotSlashPrefix(t *testing.T) {
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

	assert.NoError(t, os.WriteFile(csvPath, []byte("csv-data-dotslash"), 0644))
	assert.NoError(t, os.WriteFile(enginePath, []byte("engine-data-dotslash"), 0644))
	assert.NoError(t, os.WriteFile(faultPath, []byte("fault-data-dotslash"), 0644))

	service := chaoshub.NewService(nil)
	req := model.ExperimentRequest{
		HubID:          chaoshub.DefaultHubID,
		Category:       "./pod-delete",
		ExperimentName: "./pod-delete",
	}

	details, err := service.GetChaosFault(context.Background(), req, "test-project")
	assert.NoError(t, err)
	assert.NotNil(t, details)
	assert.Equal(t, "csv-data-dotslash", details.CSV)
	assert.Equal(t, "engine-data-dotslash", details.Engine)
	assert.Equal(t, "fault-data-dotslash", details.Fault)
}

func TestGetChaosFault_Valid_Nested(t *testing.T) {
	utils.Config.DefaultHubName = "test-default-hub"
	hubDir := filepath.Join("/tmp", "default", "test-default-hub", "faults", "kubernetes", "pod-delete")
	err := os.MkdirAll(hubDir, 0755)
	assert.NoError(t, err)
	t.Cleanup(func() {
		os.RemoveAll(filepath.Join("/tmp", "default", "test-default-hub"))
	})

	csvPath := filepath.Join(hubDir, "pod-delete.chartserviceversion.yaml")
	enginePath := filepath.Join(hubDir, "engine.yaml")
	faultPath := filepath.Join(hubDir, "fault.yaml")

	assert.NoError(t, os.WriteFile(csvPath, []byte("csv-data-nested"), 0644))
	assert.NoError(t, os.WriteFile(enginePath, []byte("engine-data-nested"), 0644))
	assert.NoError(t, os.WriteFile(faultPath, []byte("fault-data-nested"), 0644))

	service := chaoshub.NewService(nil)
	req := model.ExperimentRequest{
		HubID:          chaoshub.DefaultHubID,
		Category:       "kubernetes",
		ExperimentName: "pod-delete",
	}

	details, err := service.GetChaosFault(context.Background(), req, "test-project")
	assert.NoError(t, err)
	assert.NotNil(t, details)
	assert.Equal(t, "csv-data-nested", details.CSV)
	assert.Equal(t, "engine-data-nested", details.Engine)
	assert.Equal(t, "fault-data-nested", details.Fault)
}

func TestGetChaosFault_PathTraversal_Cases(t *testing.T) {
	utils.Config.DefaultHubName = "test-default-hub"
	service := chaoshub.NewService(nil)

	testCases := []struct {
		name           string
		category       string
		experimentName string
	}{
		{
			name:           "relative traversal 3 levels",
			category:       "../../../etc",
			experimentName: "passwd",
		},
		{
			name:           "relative traversal 4 levels",
			category:       "../../../../etc",
			experimentName: "shadow",
		},
		{
			name:           "nested escape",
			category:       "pod-delete/../../etc",
			experimentName: "passwd",
		},
		{
			name:           "sibling prefix collision",
			category:       "../../test-default-hub-other/faults/pod-delete",
			experimentName: "pod-delete",
		},
		{
			name:           "absolute path root",
			category:       "/etc",
			experimentName: "passwd",
		},
		{
			name:           "experiment absolute path",
			category:       "pod-delete",
			experimentName: "/etc/passwd",
		},
		{
			name:           "empty category",
			category:       "",
			experimentName: "pod-delete",
		},
		{
			name:           "empty experiment name",
			category:       "pod-delete",
			experimentName: "",
		},
		{
			name:           "dot category",
			category:       ".",
			experimentName: "pod-delete",
		},
		{
			name:           "dot experiment name",
			category:       "pod-delete",
			experimentName: ".",
		},
		{
			name:           "double dot category",
			category:       "..",
			experimentName: "pod-delete",
		},
		{
			name:           "double dot experiment",
			category:       "pod-delete",
			experimentName: "..",
		},
		{
			name:           "windows backslash relative traversal",
			category:       `..\..\..\etc`,
			experimentName: "passwd",
		},
		{
			name:           "windows backslash in experiment name",
			category:       "pod-delete",
			experimentName: `..\..\etc\passwd`,
		},
		{
			name:           "null byte in category",
			category:       "pod-delete\x00extra",
			experimentName: "pod-delete",
		},
		{
			name:           "null byte in experiment name",
			category:       "pod-delete",
			experimentName: "pod-delete\x00extra",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req := model.ExperimentRequest{
				HubID:          chaoshub.DefaultHubID,
				Category:       tc.category,
				ExperimentName: tc.experimentName,
			}

			details, err := service.GetChaosFault(context.Background(), req, "test-project")
			if assert.Error(t, err, "expected error for test case: %s", tc.name) {
				assert.Nil(t, details, "expected nil details for test case: %s", tc.name)
				assert.Contains(t, err.Error(), "invalid path", "error should mention invalid path: %s", tc.name)
			}
		})
	}
}

func TestGetChaosFault_SymlinkEscape(t *testing.T) {
	utils.Config.DefaultHubName = "test-symlink-hub"
	hubDir := filepath.Join("/tmp", "default", "test-symlink-hub", "faults")
	err := os.MkdirAll(hubDir, 0755)
	assert.NoError(t, err)

	outsideDir := filepath.Join("/tmp", "outside-hub-target")
	assert.NoError(t, os.MkdirAll(outsideDir, 0755))
	assert.NoError(t, os.WriteFile(filepath.Join(outsideDir, "fault.yaml"), []byte("outside-secret"), 0644))

	t.Cleanup(func() {
		os.RemoveAll(filepath.Join("/tmp", "default", "test-symlink-hub"))
		os.RemoveAll(outsideDir)
	})

	// Create a symlink inside faults directory pointing to outsideDir
	symlinkCategory := filepath.Join(hubDir, "symlink-category")
	err = os.Symlink(outsideDir, symlinkCategory)
	if err != nil {
		t.Skip("Symlinks not supported on this platform/environment, skipping")
	}

	service := chaoshub.NewService(nil)
	req := model.ExperimentRequest{
		HubID:          chaoshub.DefaultHubID,
		Category:       "symlink-category",
		ExperimentName: "target",
	}

	details, err := service.GetChaosFault(context.Background(), req, "test-project")
	assert.Error(t, err)
	assert.Nil(t, details)
	assert.Contains(t, err.Error(), "path traversal detected")
}
