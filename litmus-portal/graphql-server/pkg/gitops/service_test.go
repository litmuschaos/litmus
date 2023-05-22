// Package gitops_test contains tests for the gitops package.
package gitops_test

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	authMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authentication/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	chaosWorkflowMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbSchemaGitOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/gitops"
	mongodbMocks "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	gitOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/protos"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	tempPath     = "/tmp/gitops_test/"
	localTmpPath = "/tmp/gitops_local/"
)

var (
	mongoOperator        = new(mongodbMocks.MongoOperator)
	chaosWorkflowService = new(chaosWorkflowMocks.ChaosWorkflowService)
	gitOpsOperator       = dbSchemaGitOps.NewGitOpsOperator(mongoOperator)
	authService          = new(authMocks.AuthenticationService)
	gitOpsService        = gitOps.NewService(gitOpsOperator, chaosWorkflowService, authService)
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// tempRemoteGitRepo creates a temporary remote git repo
func tempRemoteGitRepo(t *testing.T) (string, func()) {
	remoteURL := tempPath + uuid.NewString()
	err := os.MkdirAll(remoteURL, 0755)
	assert.NoError(t, err)

	repo, err := git.PlainInit(remoteURL, false)
	assert.NoError(t, err)

	worktree, err := repo.Worktree()
	assert.NoError(t, err)

	_, err = os.Create(remoteURL + "/README.md")
	assert.NoError(t, err)

	_, err = worktree.Add("README.md")
	assert.NoError(t, err)

	_, err = worktree.Commit("init repo", &git.CommitOptions{Author: &object.Signature{
		Name:  "litmus",
		Email: "litmus@litmuschaos.io",
		When:  time.Now(),
	}})

	clean := func() {
		_ = os.RemoveAll(tempPath)
	}

	return remoteURL, clean
}

// TestGitOpsService_UpsertWorkflowToGit tests the UpsertWorkflowToGit function of the gitOpsService
func TestGitOpsService_UpsertWorkflowToGit(t *testing.T) {
	// given
	var (
		workflowID, username, password = uuid.NewString(), "litmus", "litmus"
		wf                             = &model.ChaosWorkFlowRequest{
			ProjectID:  uuid.NewString(),
			WorkflowID: &workflowID,
			ClusterID:  uuid.NewString(),
		}
	)
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				remoteURL, clean := tempRemoteGitRepo(t)
				t.Cleanup(clean)

				gitDB := dbSchemaGitOps.GetGitConfigDB(model.GitConfig{
					RepoURL:   remoteURL + "/.git",
					Branch:    "master",
					AuthType:  model.AuthTypeBasic,
					UserName:  &username,
					Password:  &password,
					ProjectID: wf.ProjectID,
				})
				ctx := context.WithValue(context.Background(), authorization.UserClaim, jwt.MapClaims{
					"username": "litmus",
					"email":    "litmus@litmuschaos.io",
				})
				commit, err := gitOps.SetupGitOps(gitOps.GitUserFromContext(ctx), gitOps.GetGitOpsConfig(gitDB))
				assert.NoError(t, err)
				gitDB.LatestCommit = commit

				singleResult := mongo.NewSingleResultFromDocument(bson.D{
					{"project_id", wf.ProjectID},
					{"repo_url", remoteURL + "/.git"},
					{"branch", "master"},
					{"local_path", localTmpPath + wf.ProjectID},
					{"latest_commit", commit},
					{"auth_type", model.AuthTypeBasic},
					{"username", username},
					{"password", password},
				}, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
				err = os.MkdirAll(localTmpPath+wf.ProjectID, 0755)
				t.Cleanup(func() { _ = os.RemoveAll(localTmpPath) })
				assert.NoError(t, err)

				manifest := fmt.Sprintf(`
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
 labels:
   cluster_id: %s
   workflow_id: %s
 name: podtato-head-1684388545
 namespace: litmus
`, wf.ClusterID, workflowID)
				err = ioutil.WriteFile(localTmpPath+wf.ProjectID+"/test.yaml", []byte(manifest), 0644)
				assert.NoError(t, err)
				mongoOperator.On("Update", mock.Anything, mongodb.GitOpsCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(bson.D{
					{"project_id", wf.ProjectID},
					{"repo_url", "https://github.com/litmuschaos/litmus"},
					{"branch", "master"},
				}, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: sync error",
			given: func() {
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(mongo.NewSingleResultFromDocument(nil, nil, nil), errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			err := gitOpsService.UpsertWorkflowToGit(context.Background(), wf)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestGitOpsService_GitOpsNotificationHandler tests the GitOpsNotificationHandler function of the gitOpsService
func TestGitOpsService_GitOpsNotificationHandler(t *testing.T) {
	// given
	workflowID := uuid.NewString()
	cluster := dbSchemaCluster.Cluster{
		ProjectID: uuid.NewString(),
		ClusterID: uuid.NewString(),
	}
	manifest := fmt.Sprintf(`
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
 labels:
   cluster_id: %s
   workflow_id: %s
 name: podtato-head-1684388545
 namespace: litmus
`, cluster.ClusterID, workflowID)
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				findResult := bson.D{{"project_id", cluster.ProjectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("GetWorkflows", mock.Anything).Return([]workflow.ChaosWorkFlowRequest{
					{
						WorkflowID:       workflowID,
						WorkflowManifest: manifest,
					},
				}, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: mongo cannot get chaos workflows",
			given: func() {
				findResult := bson.D{{"project_id", cluster.ProjectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("GetWorkflows", mock.Anything).Return([]workflow.ChaosWorkFlowRequest{}, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: chaos workflows length zero",
			given: func() {
				findResult := bson.D{{"project_id", cluster.ProjectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
				chaosWorkflowService.On("GetWorkflows", mock.Anything).Return([]workflow.ChaosWorkFlowRequest{}, nil).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := gitOpsService.GitOpsNotificationHandler(context.Background(), &cluster, workflowID)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestGitOpsService_EnableGitOpsHandler tests the EnableGitOpsHandler function of the gitOpsService
func TestGitOpsService_EnableGitOpsHandler(t *testing.T) {
	// given
	testcases := []struct {
		name    string
		given   func() model.GitConfig
		wantErr bool
	}{
		{
			name: "success",
			given: func() model.GitConfig {
				projectID, username, password := uuid.NewString(), "litmus", "litmus"
				authService.On("GetProjectById", projectID).Return(&protos.GetProjectByIdResponse{}, nil).Once()
				mongoOperator.On("Create", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(nil).Once()
				remoteURL, clean := tempRemoteGitRepo(t)
				t.Cleanup(clean)
				return model.GitConfig{
					RepoURL:   remoteURL + "/.git",
					Branch:    "master",
					AuthType:  model.AuthTypeBasic,
					UserName:  &username,
					Password:  &password,
					ProjectID: projectID,
				}
			},
			wantErr: false,
		},
		{
			name: "failure: cannot request to auth server",
			given: func() model.GitConfig {
				projectID := uuid.NewString()
				authService.On("GetProjectById", projectID).Return(&protos.GetProjectByIdResponse{}, errors.New("")).Once()
				return model.GitConfig{
					ProjectID: projectID,
					RepoURL:   "https://github.com/litmuschaos/litmus",
					Branch:    "master",
				}
			},
			wantErr: true,
		},
		{
			name: "failure: cannot connect to git client",
			given: func() model.GitConfig {
				projectID := uuid.NewString()
				authService.On("GetProjectById", projectID).Return(&protos.GetProjectByIdResponse{}, nil).Once()
				return model.GitConfig{
					ProjectID: projectID,
					RepoURL:   "https://github.com/litmuschaos/litmus",
					Branch:    "master",
				}
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			config := tc.given()
			// when
			result, err := gitOpsService.EnableGitOpsHandler(context.Background(), config)
			// then
			if tc.wantErr {
				assert.Error(t, err)
				assert.False(t, result)
			} else {
				assert.NoError(t, err)
				assert.True(t, result)
			}
		})
	}
}

// TestGitOpsService_DisableGitOpsHandler tests the DisableGitOpsHandler function of the gitOpsService
func TestGitOpsService_DisableGitOpsHandler(t *testing.T) {
	// given
	projectID := uuid.NewString()
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				mongoOperator.On("Delete", mock.Anything, mongodb.GitOpsCollection, mock.Anything, mock.Anything).Return(&mongo.DeleteResult{}, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: mongo delete error",
			given: func() {
				mongoOperator.On("Delete", mock.Anything, mongodb.GitOpsCollection, mock.Anything, mock.Anything).Return(&mongo.DeleteResult{}, errors.New("")).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			result, err := gitOpsService.DisableGitOpsHandler(context.Background(), projectID)
			// then
			if tc.wantErr {
				assert.Error(t, err)
				assert.False(t, result)
			} else {
				assert.NoError(t, err)
				assert.True(t, result)
			}
		})
	}
}

// TestGitOpsService_UpdateGitOpsDetailsHandler tests the UpdateGitOpsDetailsHandler function of the gitOpsService
func TestGitOpsService_UpdateGitOpsDetailsHandler(t *testing.T) {
	// given
	testcases := []struct {
		name    string
		given   func() model.GitConfig
		wantErr bool
	}{
		{
			name: "success",
			given: func() model.GitConfig {
				projectID, username, password := uuid.NewString(), "litmus", "litmus"
				findResult := bson.D{{"project_id", projectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
				mongoOperator.On("Replace", mock.Anything, mongodb.GitOpsCollection, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 1}, nil).Once()
				remoteURL, clean := tempRemoteGitRepo(t)
				t.Cleanup(clean)
				return model.GitConfig{
					RepoURL:   remoteURL + "/.git",
					Branch:    "master",
					AuthType:  model.AuthTypeBasic,
					UserName:  &username,
					Password:  &password,
					ProjectID: projectID,
				}
			},
			wantErr: false,
		},
		{
			name: "failure: mongo get error",
			given: func() model.GitConfig {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
				return model.GitConfig{
					RepoURL:   "https://github.com/litmuschaos/litmus",
					Branch:    "master",
					ProjectID: uuid.NewString(),
				}
			},
			wantErr: true,
		},
		{
			name: "failure: GitOps details not found",
			given: func() model.GitConfig {
				projectID := uuid.NewString()
				findResult := bson.D{{"project_id", projectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
				return model.GitConfig{
					RepoURL:   "https://github.com/litmuschaos/litmus",
					Branch:    "master",
					ProjectID: projectID,
				}
			},
			wantErr: true,
		},
		{
			name: "failure: mongo replace error",
			given: func() model.GitConfig {
				projectID, username, password := uuid.NewString(), "litmus", "litmus"
				findResult := bson.D{{"project_id", projectID}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
				mongoOperator.On("Replace", mock.Anything, mongodb.GitOpsCollection, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{MatchedCount: 0}, errors.New("")).Once()
				remoteURL, clean := tempRemoteGitRepo(t)
				t.Cleanup(clean)
				return model.GitConfig{
					RepoURL:   remoteURL + "/.git",
					Branch:    "master",
					AuthType:  model.AuthTypeBasic,
					UserName:  &username,
					Password:  &password,
					ProjectID: projectID,
				}
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			config := tc.given()
			// when
			result, err := gitOpsService.UpdateGitOpsDetailsHandler(context.Background(), config)
			// then
			if tc.wantErr {
				assert.Error(t, err)
				assert.False(t, result)
			} else {
				assert.NoError(t, err)
				assert.True(t, result)
			}
		})
	}
}

// TestGitOpsService_GetGitOpsDetails tests the GetGitOpsDetails function of the gitOpsService
func TestGitOpsService_GetGitOpsDetails(t *testing.T) {
	// given
	config := model.GitConfig{
		ProjectID: uuid.NewString(),
		RepoURL:   "www.github.com/litmuschaos/litmus",
		Branch:    "main",
	}
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success: auth type token",
			given: func() {
				findResult := bson.D{{"project_id", config.ProjectID}, {"auth_type", model.AuthTypeToken}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "success: auth type basic",
			given: func() {
				findResult := bson.D{{"project_id", config.ProjectID}, {"auth_type", model.AuthTypeBasic}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: false,
		},
		{
			name: "success: auth type ssh",
			given: func() {
				findResult := bson.D{{"project_id", config.ProjectID}, {"auth_type", model.AuthTypeSSH}}
				singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			_, err := gitOpsService.GetGitOpsDetails(context.Background(), config.ProjectID)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestGitOpsService_DeleteWorkflowFromGit tests the DeleteWorkflowFromGit function of the gitOpsService
func TestGitOpsService_DeleteWorkflowFromGit(t *testing.T) {
	// given
	var (
		workflowID, username, password = uuid.NewString(), "litmus", "litmus"
		wf                             = &model.ChaosWorkFlowRequest{
			ProjectID:    uuid.NewString(),
			WorkflowID:   &workflowID,
			ClusterID:    uuid.NewString(),
			WorkflowName: uuid.NewString(),
		}
	)
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				remoteURL, clean := tempRemoteGitRepo(t)
				t.Cleanup(clean)

				gitDB := dbSchemaGitOps.GetGitConfigDB(model.GitConfig{
					RepoURL:   remoteURL + "/.git",
					Branch:    "master",
					AuthType:  model.AuthTypeBasic,
					UserName:  &username,
					Password:  &password,
					ProjectID: wf.ProjectID,
				})
				commit, err := gitOps.SetupGitOps(gitOps.GitUserFromContext(context.Background()), gitOps.GetGitOpsConfig(gitDB))
				assert.NoError(t, err)
				gitDB.LatestCommit = commit

				singleResult := mongo.NewSingleResultFromDocument(bson.D{
					{"project_id", wf.ProjectID},
					{"repo_url", remoteURL + "/.git"},
					{"branch", "master"},
					{"local_path", localTmpPath + wf.ProjectID},
					{"latest_commit", commit},
					{"auth_type", model.AuthTypeBasic},
					{"username", username},
					{"password", password},
				}, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
				mongoOperator.On("Update", mock.Anything, mongodb.GitOpsCollection, mock.Anything, mock.Anything).Return(nil).Once()
			},
			wantErr: false,
		},
		{
			name: "failure: mongo get error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(nil, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, errors.New("")).Once()
			},
			wantErr: true,
		},
		{
			name: "failure: sync error",
			given: func() {
				singleResult := mongo.NewSingleResultFromDocument(bson.D{
					{"project_id", wf.ProjectID},
					{"repo_url", "https://github.com/litmuschaos/litmus"},
					{"branch", "master"},
				}, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			err := gitOpsService.DeleteWorkflowFromGit(context.Background(), wf)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestGitOpsService_GitOpsSyncHandler tests the GitOpsSyncHandler function of the gitOpsService
func TestGitOpsService_GitOpsSyncHandler(t *testing.T) {
	// given
	var (
		workflowID, username, password = uuid.NewString(), "litmus", "litmus"
		wf                             = &model.ChaosWorkFlowRequest{
			ProjectID:  uuid.NewString(),
			WorkflowID: &workflowID,
			ClusterID:  uuid.NewString(),
		}
	)
	testcases := []struct {
		name    string
		given   func()
		wantErr bool
	}{
		{
			name: "success",
			given: func() {
				remoteURL, clean := tempRemoteGitRepo(t)
				t.Cleanup(clean)

				gitDB := dbSchemaGitOps.GetGitConfigDB(model.GitConfig{
					RepoURL:   remoteURL + "/.git",
					Branch:    "master",
					AuthType:  model.AuthTypeBasic,
					UserName:  &username,
					Password:  &password,
					ProjectID: wf.ProjectID,
				})
				commit, err := gitOps.SetupGitOps(gitOps.GitUserFromContext(context.Background()), gitOps.GetGitOpsConfig(gitDB))
				assert.NoError(t, err)
				gitDB.LatestCommit = commit
				document := bson.D{
					{"project_id", wf.ProjectID},
					{"repo_url", remoteURL + "/.git"},
					{"branch", "master"},
					{"local_path", localTmpPath + wf.ProjectID},
					{"latest_commit", commit},
					{"auth_type", model.AuthTypeBasic},
					{"username", username},
					{"password", password},
				}

				findResult := []interface{}{document}
				cursor, _ := mongo.NewCursorFromDocuments(findResult, nil, nil)
				mongoOperator.On("List", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(cursor, nil).Once()
				singleResult := mongo.NewSingleResultFromDocument(document, nil, nil)
				mongoOperator.On("Get", mock.Anything, mongodb.GitOpsCollection, mock.Anything).Return(singleResult, nil).Once()
			},
			wantErr: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			gitOpsService.GitOpsSyncHandler(true)
		})
	}
}
