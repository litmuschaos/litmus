package gitops

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	probeMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/model/mocks"
)

const testProjectID = "project-1"

func newProbeSyncService(t *testing.T) (*gitOpsService, *probeMocks.ProbeService) {
	t.Helper()
	probeService := new(probeMocks.ProbeService)
	return &gitOpsService{probeService: probeService}, probeService
}

func isHTTPHealthCheck(r model.ProbeRequest) bool {
	return r.Name == "http-health-check" &&
		r.Type == model.ProbeTypeHTTPProbe &&
		r.KubernetesHTTPProperties != nil &&
		r.KubernetesHTTPProperties.URL == "http://my-app.default.svc:8080/health"
}

func TestSyncProbe_CreatesMissingProbe(t *testing.T) {
	svc, probeService := newProbeSyncService(t)
	probeService.On("ValidateUniqueProbe", mock.Anything, "http-health-check", testProjectID).Return(true, nil).Once()
	probeService.On("AddProbe", mock.Anything, mock.MatchedBy(isHTTPHealthCheck), testProjectID, gitOpsUsername).
		Return(&model.Probe{}, nil).Once()

	err := svc.syncProbe(context.Background(), []byte(httpProbeManifestYAML), "litmus/project-1/probes/http-health-check.yaml", GitConfig{ProjectID: testProjectID})

	assert.NoError(t, err)
	probeService.AssertExpectations(t)
	probeService.AssertNotCalled(t, "UpdateProbe", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestSyncProbe_UpdatesExistingProbe(t *testing.T) {
	svc, probeService := newProbeSyncService(t)
	probeService.On("ValidateUniqueProbe", mock.Anything, "http-health-check", testProjectID).Return(false, nil).Once()
	probeService.On("UpdateProbe", mock.Anything, mock.MatchedBy(isHTTPHealthCheck), testProjectID, gitOpsUsername).
		Return("http-health-check", nil).Once()

	err := svc.syncProbe(context.Background(), []byte(httpProbeManifestYAML), "litmus/project-1/http-health-check.yaml", GitConfig{ProjectID: testProjectID})

	assert.NoError(t, err)
	probeService.AssertExpectations(t)
	probeService.AssertNotCalled(t, "AddProbe", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestSyncProbe_AcceptsNilContext(t *testing.T) {
	svc, probeService := newProbeSyncService(t)
	probeService.On("ValidateUniqueProbe", mock.MatchedBy(func(ctx context.Context) bool {
		_, hasDeadline := ctx.Deadline()
		return hasDeadline
	}), "http-health-check", testProjectID).Return(true, nil).Once()
	probeService.On("AddProbe", mock.Anything, mock.Anything, testProjectID, gitOpsUsername).Return(&model.Probe{}, nil).Once()

	err := svc.syncProbe(nil, []byte(httpProbeManifestYAML), "http-health-check.yaml", GitConfig{ProjectID: testProjectID})

	assert.NoError(t, err)
	probeService.AssertExpectations(t)
}

func TestSyncProbe_RejectsFileNameMismatch(t *testing.T) {
	svc, probeService := newProbeSyncService(t)

	err := svc.syncProbe(context.Background(), []byte(httpProbeManifestYAML), "litmus/project-1/renamed.yaml", GitConfig{ProjectID: testProjectID})

	assert.EqualError(t, err, `file name "renamed" doesn't match probe name "http-health-check"`)
	probeService.AssertNotCalled(t, "ValidateUniqueProbe", mock.Anything, mock.Anything, mock.Anything)
}

func TestSyncProbe_RejectsInvalidManifest(t *testing.T) {
	svc, probeService := newProbeSyncService(t)

	err := svc.syncProbe(context.Background(), []byte("kind: ResilienceProbe\nmetadata: {name: x}\n"), "x.yaml", GitConfig{ProjectID: testProjectID})

	assert.ErrorContains(t, err, "unsupported apiVersion")
	probeService.AssertNotCalled(t, "ValidateUniqueProbe", mock.Anything, mock.Anything, mock.Anything)
}

func TestSyncProbe_PropagatesLookupError(t *testing.T) {
	svc, probeService := newProbeSyncService(t)
	dbErr := errors.New("mongo down")
	probeService.On("ValidateUniqueProbe", mock.Anything, "http-health-check", testProjectID).Return(false, dbErr).Once()

	err := svc.syncProbe(context.Background(), []byte(httpProbeManifestYAML), "http-health-check.yaml", GitConfig{ProjectID: testProjectID})

	assert.ErrorIs(t, err, dbErr)
	probeService.AssertNotCalled(t, "AddProbe", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
	probeService.AssertNotCalled(t, "UpdateProbe", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestDeleteProbe_DeletesExistingProbe(t *testing.T) {
	svc, probeService := newProbeSyncService(t)
	probeService.On("ValidateUniqueProbe", mock.Anything, "cmd-probe", testProjectID).Return(false, nil).Once()
	probeService.On("DeleteProbe", mock.Anything, "cmd-probe", testProjectID, gitOpsUsername).Return(true, nil).Once()

	err := svc.deleteProbe(context.Background(), "litmus/project-1/probes/cmd-probe.yaml", GitConfig{ProjectID: testProjectID})

	assert.NoError(t, err)
	probeService.AssertExpectations(t)
}

func TestDeleteProbe_SkipsAbsentProbe(t *testing.T) {
	svc, probeService := newProbeSyncService(t)
	probeService.On("ValidateUniqueProbe", mock.Anything, "cmd-probe", testProjectID).Return(true, nil).Once()

	err := svc.deleteProbe(nil, "cmd-probe.yaml", GitConfig{ProjectID: testProjectID})

	assert.NoError(t, err)
	probeService.AssertNotCalled(t, "DeleteProbe", mock.Anything, mock.Anything, mock.Anything, mock.Anything)
}

func TestOperationContext_DerivesFromParent(t *testing.T) {
	parent, cancel := context.WithCancel(context.Background())
	ctx, cancelOp := operationContext(parent)
	defer cancelOp()

	_, hasDeadline := ctx.Deadline()
	assert.True(t, hasDeadline)

	cancel()
	assert.ErrorIs(t, ctx.Err(), context.Canceled)
}

// newTestRepoWithDeletedFile creates a git repository with two commits: one
// adding relPath with the given content and one deleting it.
func newTestRepoWithDeletedFile(t *testing.T, relPath, content string) GitConfig {
	t.Helper()
	dir := t.TempDir()
	repo, err := git.PlainInit(dir, false)
	require.NoError(t, err)
	wt, err := repo.Worktree()
	require.NoError(t, err)

	abs := filepath.Join(dir, relPath)
	require.NoError(t, os.MkdirAll(filepath.Dir(abs), 0o755))
	require.NoError(t, os.WriteFile(abs, []byte(content), 0o644))
	_, err = wt.Add(relPath)
	require.NoError(t, err)
	sig := &object.Signature{Name: "test", Email: "test@example.com", When: time.Now()}
	_, err = wt.Commit("add", &git.CommitOptions{Author: sig})
	require.NoError(t, err)

	_, err = wt.Remove(relPath)
	require.NoError(t, err)
	// commits are walked by committer time, so the deletion must be strictly later
	later := &object.Signature{Name: sig.Name, Email: sig.Email, When: sig.When.Add(time.Second)}
	_, err = wt.Commit("delete", &git.CommitOptions{Author: later, Committer: later})
	require.NoError(t, err)

	return GitConfig{ProjectID: testProjectID, LocalPath: dir}
}

func TestLastCommittedContent_ReadsDeletedFile(t *testing.T) {
	config := newTestRepoWithDeletedFile(t, "litmus/project-1/probes/http-health-check.yaml", httpProbeManifestYAML)

	content, err := config.LastCommittedContent("litmus/project-1/probes/http-health-check.yaml")

	require.NoError(t, err)
	assert.Equal(t, httpProbeManifestYAML, string(content))
}

func TestLastCommittedContent_UnknownFile(t *testing.T) {
	config := newTestRepoWithDeletedFile(t, "litmus/project-1/a.yaml", "kind: Workflow\n")

	_, err := config.LastCommittedContent("litmus/project-1/never-existed.yaml")

	assert.EqualError(t, err, "file litmus/project-1/never-existed.yaml not found in any commit")
}

func TestDeletedFileKind(t *testing.T) {
	testCases := []struct {
		name    string
		content string
		want    string
	}{
		{name: "probe", content: httpProbeManifestYAML, want: "resilienceprobe"},
		{name: "workflow", content: "apiVersion: argoproj.io/v1alpha1\nkind: Workflow\nmetadata:\n  name: a\n", want: "workflow"},
	}
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			config := newTestRepoWithDeletedFile(t, "litmus/project-1/a.yaml", tc.content)

			kind, err := deletedFileKind("litmus/project-1/a.yaml", config)

			require.NoError(t, err)
			assert.Equal(t, tc.want, kind)
		})
	}
}

func TestDeletedFileKind_NoKind(t *testing.T) {
	config := newTestRepoWithDeletedFile(t, "litmus/project-1/a.yaml", "metadata:\n  name: a\n")

	_, err := deletedFileKind("litmus/project-1/a.yaml", config)

	assert.EqualError(t, err, "manifest has no kind")
}

func TestDeletedFileKind_MissingRepo(t *testing.T) {
	_, err := deletedFileKind("litmus/project-1/a.yaml", GitConfig{LocalPath: filepath.Join(t.TempDir(), "missing")})

	assert.Error(t, err)
}
