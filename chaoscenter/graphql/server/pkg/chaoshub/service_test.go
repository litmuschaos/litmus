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

// TestGetChaosFaultPathTraversal checks that a fault category/name coming from
// the request cannot walk out of the hub directory.
func TestGetChaosFaultPathTraversal(t *testing.T) {
	// given
	hubName := "test-hub-traversal"
	prevHubName := utils.Config.DefaultHubName
	utils.Config.DefaultHubName = hubName
	t.Cleanup(func() { utils.Config.DefaultHubName = prevHubName })

	faultDir := filepath.Join(chaoshub.DefaultPath, "default", hubName, "faults", "kubernetes", "pod-delete")
	assert.NoError(t, os.MkdirAll(faultDir, 0755))
	t.Cleanup(func() { os.RemoveAll(filepath.Join(chaoshub.DefaultPath, "default", hubName)) })
	assert.NoError(t, os.WriteFile(filepath.Join(faultDir, "fault.yaml"), []byte("in-hub"), 0644))

	outsideDir := filepath.Join(chaoshub.DefaultPath, "test-hub-traversal-outside")
	assert.NoError(t, os.MkdirAll(outsideDir, 0755))
	t.Cleanup(func() { os.RemoveAll(outsideDir) })
	assert.NoError(t, os.WriteFile(filepath.Join(outsideDir, "fault.yaml"), []byte("outside"), 0644))

	// climbs from <hub>/faults/<category>/ back up to outsideDir
	escape, err := filepath.Rel(filepath.Join(chaoshub.DefaultPath, "default", hubName, "faults", "kubernetes"), outsideDir)
	assert.NoError(t, err)

	service := chaoshub.NewService(nil)

	testcases := []struct {
		name       string
		category   string
		experiment string
		isError    bool
		fault      string
	}{
		{
			name:       "valid fault",
			category:   "kubernetes",
			experiment: "pod-delete",
			fault:      "in-hub",
		},
		{
			name:       "relative experiment name",
			category:   "kubernetes",
			experiment: escape,
			isError:    true,
		},
		{
			name:       "relative category",
			category:   "..",
			experiment: "pod-delete",
			isError:    true,
		},
		{
			name:       "absolute experiment name",
			category:   "kubernetes",
			experiment: outsideDir,
			isError:    true,
		},
		{
			name:       "empty category",
			category:   "",
			experiment: "pod-delete",
			isError:    true,
		},
	}

	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			fault, err := service.GetChaosFault(context.Background(), model.ExperimentRequest{
				HubID:          chaoshub.DefaultHubID,
				Category:       tc.category,
				ExperimentName: tc.experiment,
			}, "test-project")
			// then
			if tc.isError {
				assert.Error(t, err)
				assert.Nil(t, fault)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.fault, fault.Fault)
		})
	}
}

// TestGetPredefinedExperimentPathTraversal checks the same for the predefined
// experiment names taken from the request.
func TestGetPredefinedExperimentPathTraversal(t *testing.T) {
	// given
	hubName := "test-hub-predefined"
	prevHubName := utils.Config.DefaultHubName
	utils.Config.DefaultHubName = hubName
	t.Cleanup(func() { utils.Config.DefaultHubName = prevHubName })

	hubDir := filepath.Join(chaoshub.DefaultPath, "default", hubName, "experiments")
	assert.NoError(t, os.MkdirAll(hubDir, 0755))
	t.Cleanup(func() { os.RemoveAll(filepath.Join(chaoshub.DefaultPath, "default", hubName)) })

	// The experiment name is joined twice on the read path,
	// <hub>/experiments/<name>/<name>.chartserviceversion.yaml, so with
	// <name> = ../../<outside> the first copy climbs to /tmp/default/<outside>/
	// and the second climbs again to /tmp/<outside>.chartserviceversion.yaml.
	// Plant both so the unguarded read finds a file outside the hub.
	outsideName := "test-hub-predefined-outside"
	outsideDir := filepath.Join(chaoshub.DefaultPath, "default", outsideName)
	assert.NoError(t, os.MkdirAll(outsideDir, 0755))
	t.Cleanup(func() { os.RemoveAll(outsideDir) })
	outsideCSV := filepath.Join(chaoshub.DefaultPath, outsideName+".chartserviceversion.yaml")
	assert.NoError(t, os.WriteFile(outsideCSV, []byte("outside"), 0644))
	t.Cleanup(func() { os.Remove(outsideCSV) })

	escape := "../../" + outsideName

	service := chaoshub.NewService(nil)

	// when
	experiments, err := service.GetPredefinedExperiment(context.Background(), chaoshub.DefaultHubID,
		[]string{escape}, "test-project")

	// then
	assert.NoError(t, err)
	assert.Empty(t, experiments)
}
