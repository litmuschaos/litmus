package gitops

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/go-git/go-git/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGitCommit_AddsProjectDirectory(t *testing.T) {
	localPath := t.TempDir()
	projectID := "proj123"

	_, err := git.PlainInit(localPath, false)
	require.NoError(t, err)

	projectDir := filepath.Join(localPath, ProjectDataPath, projectID)
	require.NoError(t, os.MkdirAll(projectDir, 0755))
	require.NoError(t, os.WriteFile(filepath.Join(projectDir, "exp.yaml"), []byte("test"), 0644))
	require.NoError(t, os.WriteFile(filepath.Join(projectDir, ".info"), []byte(`{"revision":"1"}`), 0644))

	c := GitConfig{ProjectID: projectID, LocalPath: localPath}
	hash, err := c.GitCommit(GitUserFromContext(nil), "test commit", nil)
	require.NoError(t, err)
	assert.NotEmpty(t, hash)

	repo, err := git.PlainOpen(localPath)
	require.NoError(t, err)
	head, err := repo.Head()
	require.NoError(t, err)
	commit, err := repo.CommitObject(head.Hash())
	require.NoError(t, err)
	for _, name := range []string{"exp.yaml", ".info"} {
		_, err = commit.File(ProjectDataPath + "/" + projectID + "/" + name)
		assert.NoError(t, err, "expected %s to be committed", name)
	}
}
