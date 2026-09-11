package gitops

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/go-git/go-git/v5"
	gitconfig "github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbGitOps "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/gitops"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	probeMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/model/mocks"
)

// syncFixture drives SyncDBToGit end to end against real git repositories:
// a bare "remote", a "user" clone that commits manifests, and the ChaosCenter
// clone at config.LocalPath that the sync pulls into. Only MongoDB is mocked.
type syncFixture struct {
	t            *testing.T
	user         *git.Repository
	userDir      string
	config       GitConfig
	probeService *probeMocks.ProbeService
	mockOp       *dbMocks.MongoOperator
	svc          *gitOpsService
	seq          int
	// latestCommitInDB stands in for the latest_commit column of the git config
	latestCommitInDB string
}

func newSyncFixture(t *testing.T) *syncFixture {
	t.Helper()

	remoteDir := t.TempDir()
	_, err := git.PlainInit(remoteDir, true)
	require.NoError(t, err)

	userDir := t.TempDir()
	user, err := git.PlainInit(userDir, false)
	require.NoError(t, err)
	_, err = user.CreateRemote(&gitconfig.RemoteConfig{Name: "origin", URLs: []string{remoteDir}})
	require.NoError(t, err)

	f := &syncFixture{t: t, user: user, userDir: userDir}
	// setupGitRepo treats an existing .info as "project already onboarded" and
	// bumps its revision; the missing "revision" key falls back to the default.
	f.commitAndPush(filepath.Join(ProjectDataPath, testProjectID, ".info"), `{"projectID":"project-1"}`)

	f.config = GitConfig{
		ProjectID:     testProjectID,
		RepositoryURL: remoteDir,
		LocalPath:     filepath.Join(t.TempDir(), "chaoscenter-clone"),
		RemoteName:    "origin",
		Branch:        "master",
		AuthType:      model.AuthTypeNone,
	}
	_, err = f.config.GitClone()
	require.NoError(t, err)
	f.config.LatestCommit = f.userHead()

	f.probeService = new(probeMocks.ProbeService)
	f.mockOp = new(dbMocks.MongoOperator)
	// Persist latest_commit like MongoDB would, so a later GetGitConfig sees it
	// and the sync does not re-process commits ChaosCenter made itself.
	f.mockOp.On("Update", mock.Anything, mongodb.GitOpsCollection, mock.Anything, mock.Anything, mock.Anything).
		Run(func(args mock.Arguments) {
			f.latestCommitInDB = latestCommitFromUpdate(f.t, args.Get(3).(bson.D))
		}).
		Return(&mongo.UpdateResult{MatchedCount: 1}, nil)
	f.svc = &gitOpsService{
		gitOpsOperator: dbGitOps.NewGitOpsOperator(f.mockOp),
		probeService:   f.probeService,
	}
	return f
}

func (f *syncFixture) userHead() string {
	head, err := f.user.Head()
	require.NoError(f.t, err)
	return head.Hash().String()
}

func (f *syncFixture) commit(message string) {
	wt, err := f.user.Worktree()
	require.NoError(f.t, err)
	// Commit walks order by committer time, so keep timestamps strictly increasing.
	f.seq++
	sig := &object.Signature{Name: "user", Email: "user@example.com", When: time.Now().Add(time.Duration(f.seq) * time.Second)}
	_, err = wt.Commit(message, &git.CommitOptions{Author: sig, Committer: sig})
	require.NoError(f.t, err)
	require.NoError(f.t, f.user.Push(&git.PushOptions{RemoteName: "origin"}))
}

func (f *syncFixture) commitAndPush(relPath, content string) {
	abs := filepath.Join(f.userDir, relPath)
	require.NoError(f.t, os.MkdirAll(filepath.Dir(abs), 0o755))
	require.NoError(f.t, os.WriteFile(abs, []byte(content), 0o644))
	wt, err := f.user.Worktree()
	require.NoError(f.t, err)
	_, err = wt.Add(relPath)
	require.NoError(f.t, err)
	f.commit("add " + relPath)
}

func (f *syncFixture) deleteAndPush(relPath string) {
	wt, err := f.user.Worktree()
	require.NoError(f.t, err)
	_, err = wt.Remove(relPath)
	require.NoError(f.t, err)
	f.commit("delete " + relPath)
}

// sync runs SyncDBToGit and advances LatestCommit like the stored git config would.
func (f *syncFixture) sync() error {
	err := f.svc.SyncDBToGit(context.Background(), f.config)
	f.config.LatestCommit = f.userHead()
	return err
}

func TestSyncDBToGit_CreatesProbeFromNewManifest(t *testing.T) {
	f := newSyncFixture(t)
	f.probeService.On("ValidateUniqueProbe", mock.Anything, "http-health-check", testProjectID).Return(true, nil).Once()
	f.probeService.On("AddProbe", mock.Anything, mock.MatchedBy(isHTTPHealthCheck), testProjectID, gitOpsUsername).
		Return(&model.Probe{}, nil).Once()

	f.commitAndPush("litmus/project-1/probes/http-health-check.yaml", httpProbeManifestYAML)

	require.NoError(t, f.sync())
	f.probeService.AssertExpectations(t)
}

func TestSyncDBToGit_UpdatesProbeFromChangedManifest(t *testing.T) {
	f := newSyncFixture(t)
	f.commitAndPush("litmus/project-1/http-health-check.yaml", httpProbeManifestYAML)
	f.config.LatestCommit = f.userHead()

	f.probeService.On("ValidateUniqueProbe", mock.Anything, "http-health-check", testProjectID).Return(false, nil).Once()
	f.probeService.On("UpdateProbe", mock.Anything, mock.MatchedBy(func(r model.ProbeRequest) bool {
		return isHTTPHealthCheck(r) && r.KubernetesHTTPProperties.Interval == "9s"
	}), testProjectID, gitOpsUsername).Return("http-health-check", nil).Once()

	f.commitAndPush("litmus/project-1/http-health-check.yaml", replaceOnce(httpProbeManifestYAML, `interval: "2s"`, `interval: "9s"`))

	require.NoError(t, f.sync())
	f.probeService.AssertExpectations(t)
}

func TestSyncDBToGit_DeletesProbeWhenManifestRemoved(t *testing.T) {
	f := newSyncFixture(t)
	f.commitAndPush("litmus/project-1/probes/http-health-check.yaml", httpProbeManifestYAML)
	f.config.LatestCommit = f.userHead()

	f.probeService.On("ValidateUniqueProbe", mock.Anything, "http-health-check", testProjectID).Return(false, nil).Once()
	f.probeService.On("DeleteProbe", mock.Anything, "http-health-check", testProjectID, gitOpsUsername).Return(true, nil).Once()

	f.deleteAndPush("litmus/project-1/probes/http-health-check.yaml")

	require.NoError(t, f.sync())
	f.probeService.AssertExpectations(t)
}

// A deleted manifest whose kind cannot be determined must not be guessed at:
// deleteExperiment would dereference the nil experiment operator of this
// fixture, so a passing sync proves the file was skipped.
func TestSyncDBToGit_SkipsDeletedFileWithoutKind(t *testing.T) {
	f := newSyncFixture(t)
	f.commitAndPush("litmus/project-1/mystery.yaml", "metadata:\n  name: mystery\n")
	f.config.LatestCommit = f.userHead()

	f.deleteAndPush("litmus/project-1/mystery.yaml")

	require.NoError(t, f.sync())
	f.probeService.AssertNotCalled(t, "ValidateUniqueProbe", mock.Anything, mock.Anything, mock.Anything)
}

func TestSyncDBToGit_IgnoresProbeManifestOutsideProjectDir(t *testing.T) {
	f := newSyncFixture(t)

	f.commitAndPush("litmus/other-project/http-health-check.yaml", httpProbeManifestYAML)

	require.NoError(t, f.sync())
	f.probeService.AssertNotCalled(t, "ValidateUniqueProbe", mock.Anything, mock.Anything, mock.Anything)
}

func TestSyncDBToGit_InvalidProbeManifestDoesNotAbortSync(t *testing.T) {
	f := newSyncFixture(t)
	f.probeService.On("ValidateUniqueProbe", mock.Anything, "http-health-check", testProjectID).Return(true, nil).Once()
	f.probeService.On("AddProbe", mock.Anything, mock.Anything, testProjectID, gitOpsUsername).Return(&model.Probe{}, nil).Once()

	f.commitAndPush("litmus/project-1/broken.yaml", "kind: ResilienceProbe\nmetadata:\n  name: broken\nspec: {}\n")
	f.commitAndPush("litmus/project-1/http-health-check.yaml", httpProbeManifestYAML)

	require.NoError(t, f.sync())
	f.probeService.AssertExpectations(t)
	assert.Len(t, f.probeService.Calls, 2)
}

// latestCommitFromUpdate extracts $set.latest_commit from an UpdateGitConfig update document.
func latestCommitFromUpdate(t *testing.T, update bson.D) string {
	t.Helper()
	for _, op := range update {
		if op.Key != "$set" {
			continue
		}
		for _, field := range op.Value.(bson.D) {
			if field.Key == "latest_commit" {
				return field.Value.(string)
			}
		}
	}
	t.Fatalf("update does not set latest_commit: %v", update)
	return ""
}

func TestLastCommittedContent_ReadsFilePresentAtHead(t *testing.T) {
	f := newSyncFixture(t)
	f.commitAndPush("litmus/project-1/http-health-check.yaml", httpProbeManifestYAML)

	content, err := GitConfig{LocalPath: f.userDir}.LastCommittedContent("litmus/project-1/http-health-check.yaml")

	require.NoError(t, err)
	assert.Equal(t, httpProbeManifestYAML, string(content))
}

func replaceOnce(s, old, new string) string {
	return strings.Replace(s, old, new, 1)
}
