package chaoshubops_test

import (
	"fmt"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	chaosHubOps "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/ops"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

var (
	defaultPath = "/tmp/"
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// clearCloneRepository removes the cloned repository
func clearCloneRepository(projectID string) {
	tempPath := chaosHubOps.GetClonePath(chaosHubOps.GitConfigConstruct(model.CloningInput{}, projectID))
	err := os.RemoveAll(tempPath)
	if err != nil {
		panic(fmt.Sprintf("failed to remove temp path: %v", err))
	}
}

// TestGetClonePath is used to test the GetClonePath function
func TestGetClonePath(t *testing.T) {
	// given
	projectID := uuid.New().String()
	chaosHubConfig := chaosHubOps.ChaosHubConfig{
		ProjectID: projectID,
		HubName:   "test",
	}
	// when
	path := chaosHubOps.GetClonePath(chaosHubConfig)
	// then
	assert.Equal(t, "/tmp/"+projectID+"/test", path)
}

// TestGitConfigConstruct is used to test the GitConfigConstruct function
func TestGitConfigConstruct(t *testing.T) {
	projectID := uuid.New().String()
	// given
	repoData := model.CloningInput{

		Name:    "test",
		RepoURL: "url",
	}
	// when
	config := chaosHubOps.GitConfigConstruct(repoData, projectID)
	// then
	assert.Equal(t, projectID, config.ProjectID)
	assert.Equal(t, repoData.Name, config.HubName)
	assert.Equal(t, repoData.RepoURL, config.RepositoryURL)
}

// TestGitClone is used to test the GitClone function
func TestGitClone(t *testing.T) {
	// given
	authToken, username, password, privateKey := uuid.NewString(), uuid.NewString(), uuid.NewString(), uuid.NewString()
	testcases := []struct {
		name      string
		repoData  model.CloningInput
		isError   bool
		projectID string
	}{
		{
			name:      "success",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{
				Name:       "hub1",
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: false,
		},
		{
			name:      "invalid repository url",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{
				Name:       "hub2",
				RepoURL:    "invalid url",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: true,
		},
		{
			name:      "failure: cannot clone private repository, auth type is token",
			projectID: uuid.New().String(),

			repoData: model.CloningInput{

				Name: "hub2",
				// TODO: repository url will be replaced with litmus official repository url
				RepoURL:    "https://github.com/namkyu1999/litmus-dummy.git",
				RepoBranch: "main",
				IsPrivate:  true,
				AuthType:   model.AuthTypeToken,
				Token:      &authToken,
			},
			isError: true,
		},
		{
			name:      "failure: cannot clone private repository, auth type is basic",
			projectID: uuid.New().String(),

			repoData: model.CloningInput{
				Name: "hub2",
				// TODO: repository url will be replaced with litmus official repository url
				RepoURL:    "https://github.com/namkyu1999/litmus-dummy.git",
				RepoBranch: "main",
				IsPrivate:  true,
				AuthType:   model.AuthTypeBasic,
				UserName:   &username,
				Password:   &password,
			},
			isError: true,
		},
		{
			name:      "failure: cannot clone private repository, auth type is ssh",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{
				Name: "hub2",
				// TODO: repository url will be replaced with litmus official repository url
				RepoURL:       "https://github.com/namkyu1999/litmus-dummy.git",
				RepoBranch:    "main",
				IsPrivate:     true,
				AuthType:      model.AuthTypeSSH,
				SSHPrivateKey: &privateKey,
			},
			isError: true,
		},
	}

	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			t.Cleanup(func() { clearCloneRepository(tc.projectID) })
			err := chaosHubOps.GitClone(tc.repoData, tc.projectID)
			// then
			if tc.isError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestGitSyncHandlerForProjects is used to test the GitSyncHandlerForProjects function
func TestGitSyncHandlerForProjects(t *testing.T) {
	// given
	testcases := []struct {
		name      string
		repoData  model.CloningInput
		isError   bool
		projectID string
	}{
		{
			projectID: uuid.New().String(),
			name:      "success",
			repoData: model.CloningInput{
				Name:       "hub1",
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: false,
		},
		{
			name:      "invalid repository url",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{
				Name:    "hub2",
				RepoURL: "invalid url",
			},
			isError: true,
		},
	}

	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			t.Cleanup(func() { clearCloneRepository(tc.projectID) })
			// then
			if tc.isError {
				err := chaosHubOps.GitSyncHandlerForProjects(tc.repoData, tc.projectID)
				assert.Error(t, err)
			} else {
				chaosHubOps.GitClone(tc.repoData, tc.projectID)
				err := chaosHubOps.GitSyncHandlerForProjects(tc.repoData, tc.projectID)
				assert.NoError(t, err)
			}
		})
	}
}

// TestGitPull is used to test the GitPull function
func TestGitPull(t *testing.T) {
	// given
	authToken := uuid.NewString()
	testcases := []struct {
		name      string
		repoData  model.CloningInput
		given     func(repoData model.CloningInput, projectID string)
		isError   bool
		projectID string
	}{
		{
			name:      "success",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{

				Name:       "hub1",
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: false,
		},
		{
			name:      "invalid repository url",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{
				Name:    "hub2",
				RepoURL: "invalid url",
			},
			isError: true,
		},
		{
			name:      "failure: cannot pull private repository, invalid token",
			projectID: uuid.New().String(),
			repoData: model.CloningInput{
				Name: "hub2",
				// TODO: repository url will be replaced with litmus official repository url
				RepoURL:    "https://github.com/namkyu1999/litmus-dummy.git",
				RepoBranch: "main",
				IsPrivate:  true,
				AuthType:   model.AuthTypeToken,
				Token:      &authToken,
			},
			given: func(repoData model.CloningInput, projectID string) {
				projectPath := defaultPath + projectID + "/" + repoData.Name
				repository, err := git.PlainInit(projectPath, false)
				assert.NoError(t, err)
				worktree, err := repository.Worktree()
				assert.NoError(t, err)
				_, err = os.Create(projectPath + "/README.md")
				assert.NoError(t, err)
				_, err = worktree.Add("README.md")
				assert.NoError(t, err)
				_, err = worktree.Commit("init repo", &git.CommitOptions{Author: &object.Signature{
					Name:  "litmus",
					Email: "litmus@litmuschaos.io",
					When:  time.Now(),
				}})
				assert.NoError(t, err)
			},
			isError: true,
		},
	}

	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			t.Cleanup(func() { clearCloneRepository(tc.projectID) })
			config := chaosHubOps.GitConfigConstruct(tc.repoData, tc.projectID)
			// then
			if tc.isError {
				if tc.repoData.IsPrivate {
					tc.given(tc.repoData, tc.projectID)
				}
				err := config.GitPull()
				assert.Error(t, err)
			} else {
				err := chaosHubOps.GitClone(tc.repoData, tc.projectID)
				assert.NoError(t, err)
				err = config.GitPull()
				assert.NoError(t, err)
			}
		})
	}
}
