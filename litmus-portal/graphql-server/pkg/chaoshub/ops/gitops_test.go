package chaoshubops_test

import (
	"fmt"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	chaosHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub/ops"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

var (
	defaultPath = "/tmp/version/"
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// clearCloneRepository removes the cloned repository
func clearCloneRepository(projectID string) {
	tempPath := chaosHubOps.GetClonePath(chaosHubOps.GitConfigConstruct(model.CloningInput{ProjectID: projectID}))
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
	assert.Equal(t, "/tmp/version/"+projectID+"/test", path)
}

// TestGitConfigConstruct is used to test the GitConfigConstruct function
func TestGitConfigConstruct(t *testing.T) {
	// given
	repoData := model.CloningInput{
		ProjectID: uuid.New().String(),
		HubName:   "test",
		RepoURL:   "url",
	}
	// when
	config := chaosHubOps.GitConfigConstruct(repoData)
	// then
	assert.Equal(t, repoData.ProjectID, config.ProjectID)
	assert.Equal(t, repoData.HubName, config.HubName)
	assert.Equal(t, repoData.RepoURL, config.RepositoryURL)
}

// TestGitClone is used to test the GitClone function
func TestGitClone(t *testing.T) {
	// given
	authToken, username, password, privateKey := uuid.NewString(), uuid.NewString(), uuid.NewString(), uuid.NewString()
	testcases := []struct {
		name     string
		repoData model.CloningInput
		isError  bool
	}{
		{
			name: "success",
			repoData: model.CloningInput{
				ProjectID:  uuid.New().String(),
				HubName:    "hub1",
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: false,
		},
		{
			name: "invalid repository url",
			repoData: model.CloningInput{
				ProjectID:  uuid.New().String(),
				HubName:    "hub2",
				RepoURL:    "invalid url",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: true,
		},
		{
			name: "failure: cannot clone private repository, auth type is token",
			repoData: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   "hub2",
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
			name: "failure: cannot clone private repository, auth type is basic",
			repoData: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   "hub2",
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
			name: "failure: cannot clone private repository, auth type is ssh",
			repoData: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   "hub2",
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
			t.Cleanup(func() { clearCloneRepository(tc.repoData.ProjectID) })
			err := chaosHubOps.GitClone(tc.repoData)
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
		name     string
		repoData model.CloningInput
		isError  bool
	}{
		{
			name: "success",
			repoData: model.CloningInput{
				ProjectID:  uuid.New().String(),
				HubName:    "hub1",
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: false,
		},
		{
			name: "invalid repository url",
			repoData: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   "hub2",
				RepoURL:   "invalid url",
			},
			isError: true,
		},
	}

	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// when
			t.Cleanup(func() { clearCloneRepository(tc.repoData.ProjectID) })
			// then
			if tc.isError {
				err := chaosHubOps.GitSyncHandlerForProjects(tc.repoData)
				assert.Error(t, err)
			} else {
				chaosHubOps.GitClone(tc.repoData)
				err := chaosHubOps.GitSyncHandlerForProjects(tc.repoData)
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
		name     string
		repoData model.CloningInput
		given    func(repoData model.CloningInput)
		isError  bool
	}{
		{
			name: "success",
			repoData: model.CloningInput{
				ProjectID:  uuid.New().String(),
				HubName:    "hub1",
				RepoURL:    "https://github.com/litmuschaos/chaos-charts",
				RepoBranch: "master",
				IsPrivate:  false,
			},
			isError: false,
		},
		{
			name: "invalid repository url",
			repoData: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   "hub2",
				RepoURL:   "invalid url",
			},
			isError: true,
		},
		{
			name: "failure: cannot pull private repository, invalid token",
			repoData: model.CloningInput{
				ProjectID: uuid.New().String(),
				HubName:   "hub2",
				// TODO: repository url will be replaced with litmus official repository url
				RepoURL:    "https://github.com/namkyu1999/litmus-dummy.git",
				RepoBranch: "main",
				IsPrivate:  true,
				AuthType:   model.AuthTypeToken,
				Token:      &authToken,
			},
			given: func(repoData model.CloningInput) {
				projectPath := defaultPath + repoData.ProjectID + "/" + repoData.HubName
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
			t.Cleanup(func() { clearCloneRepository(tc.repoData.ProjectID) })
			config := chaosHubOps.GitConfigConstruct(tc.repoData)
			// then
			if tc.isError {
				if tc.repoData.IsPrivate {
					tc.given(tc.repoData)
				}
				err := config.GitPull()
				assert.Error(t, err)
			} else {
				err := chaosHubOps.GitClone(tc.repoData)
				assert.NoError(t, err)
				err = config.GitPull()
				assert.NoError(t, err)
			}
		})
	}
}
