package gitops

import (
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

func TestManifestFileName(t *testing.T) {
	for _, name := range []string{"pod-delete", "http-health-check", "probe.v2", "a_b"} {
		got, err := manifestFileName(name)
		assert.NoError(t, err, name)
		assert.Equal(t, name, got)
	}

	for _, name := range []string{"", ".", "..", "../escape", "dir/name", "/abs", `back\slash`, "a/../b"} {
		_, err := manifestFileName(name)
		assert.EqualError(t, err, fmt.Sprintf("invalid resource name %q", name), name)
	}
}

// The service has no git config operator here: reaching the database or the
// file system with an invalid name would panic, so a plain error proves the
// name was rejected first.
func TestUpsertExperimentToGit_RejectsNameEscapingProjectDir(t *testing.T) {
	svc := &gitOpsService{}

	err := svc.UpsertExperimentToGit(context.Background(), "project-1", &model.ChaosExperimentRequest{ExperimentName: "../escape"})

	assert.EqualError(t, err, `invalid resource name "../escape"`)
}

func TestDeleteExperimentFromGit_RejectsNameEscapingProjectDir(t *testing.T) {
	svc := &gitOpsService{}

	err := svc.DeleteExperimentFromGit(context.Background(), "project-1", &model.ChaosExperimentRequest{ExperimentName: "dir/name"})

	assert.EqualError(t, err, `invalid resource name "dir/name"`)
}

func TestUpsertProbeToGit_RejectsNameEscapingProjectDir(t *testing.T) {
	svc := &gitOpsService{}
	probe := probeRequestsOfAllTypes()["k8s"]
	probe.Name = "../escape"

	err := svc.UpsertProbeToGit(context.Background(), "project-1", probe)

	assert.EqualError(t, err, `invalid resource name "../escape"`)
}

func TestDeleteProbeFromGit_RejectsNameEscapingProjectDir(t *testing.T) {
	svc := &gitOpsService{}

	err := svc.DeleteProbeFromGit(context.Background(), "project-1", "dir/name")

	assert.EqualError(t, err, `invalid resource name "dir/name"`)
}
