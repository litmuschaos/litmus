package gitops

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/ghodss/yaml"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	chaosWorkflowOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbSchemaGitOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/grpc"
	"github.com/sirupsen/logrus"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"go.mongodb.org/mongo-driver/bson"
	grpc2 "google.golang.org/grpc"
)

const (
	timeout  = time.Second * 5
	tempPath = "/tmp/gitops_test/"
)

var (
	gitLock           = NewGitLock()
	backgroundContext = context.Background()
)

type Service interface {
	GitOpsNotificationHandler(ctx context.Context, cluster *dbSchemaCluster.Cluster, workflowID string) (string, error)
	EnableGitOpsHandler(ctx context.Context, config model.GitConfig) (bool, error)
	DisableGitOpsHandler(ctx context.Context, projectID string) (bool, error)
	UpdateGitOpsDetailsHandler(ctx context.Context, config model.GitConfig) (bool, error)
	GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error)
	UpsertWorkflowToGit(ctx context.Context, workflow *model.ChaosWorkFlowRequest) error
	DeleteWorkflowFromGit(ctx context.Context, workflow *model.ChaosWorkFlowRequest) error
	GitOpsSyncHandler(singleRun bool)
}

type gitOpsService struct {
	gitOpsOperator       *dbSchemaGitOps.Operator
	chaosWorkflowService chaosWorkflowOps.Service
}

// NewService returns a new instance of a gitOpsService
func NewService(gitOpsOperator *dbSchemaGitOps.Operator, chaosWorkflowService chaosWorkflowOps.Service) Service {
	return &gitOpsService{
		gitOpsOperator:       gitOpsOperator,
		chaosWorkflowService: chaosWorkflowService,
	}
}

// GitOpsNotificationHandler sends workflow run request(single run workflow only) to agent on gitops notification
func (g *gitOpsService) GitOpsNotificationHandler(ctx context.Context, cluster *dbSchemaCluster.Cluster, workflowID string) (string, error) {
	gitLock.Lock(cluster.ProjectID, nil)
	defer gitLock.Unlock(cluster.ProjectID, nil)
	config, err := g.gitOpsOperator.GetGitConfig(ctx, cluster.ProjectID)
	if err != nil {
		return "", errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if config == nil {
		return "Gitops Disabled", nil
	}
	query := bson.D{{"cluster_id", cluster.ClusterID}, {"workflow_id", workflowID}, {"isRemoved", false}}
	workflows, err := g.chaosWorkflowService.GetWorkflows(query)
	if err != nil {
		logrus.Error("Could not get workflow :", err)
		return "could not get workflow", err
	}
	if len(workflows) == 0 {
		return "", errors.New("no such workflow found")
	}
	resKind := gjson.Get(workflows[0].WorkflowManifest, "kind").String()
	if strings.ToLower(resKind) == "cronworkflow" { // no op
		return "Request Acknowledged for workflowID: " + workflowID, nil
	}

	workflows[0].WorkflowManifest, err = sjson.Set(workflows[0].WorkflowManifest, "metadata.name", workflows[0].WorkflowName+"-"+strconv.FormatInt(time.Now().Unix(), 10))
	if err != nil {
		logrus.Error("Failed to updated workflow name :", err)
		return "", errors.New("Failed to updated workflow name " + err.Error())
	}

	username := "git-ops"

	chaosWorkflowOps.SendWorkflowToSubscriber(&model.ChaosWorkFlowRequest{
		WorkflowManifest: workflows[0].WorkflowManifest,
		ProjectID:        workflows[0].ProjectID,
		ClusterID:        workflows[0].ClusterID,
	}, &username, nil, "create", store.Store)

	return "Request Acknowledged for workflowID: " + workflowID, nil
}

// EnableGitOpsHandler enables gitops for a particular project
func (g *gitOpsService) EnableGitOpsHandler(ctx context.Context, config model.GitConfig) (bool, error) {
	gitLock.Lock(config.ProjectID, nil)
	defer gitLock.Unlock(config.ProjectID, nil)

	gitLock.Lock(config.RepoURL, &config.Branch)
	defer gitLock.Unlock(config.RepoURL, &config.Branch)

	var conn *grpc2.ClientConn
	client, conn := grpc.GetAuthGRPCSvcClient(conn)
	defer conn.Close()

	_, err := grpc.GetProjectById(client, config.ProjectID)
	if err != nil {
		return false, errors.New("Failed to setup GitOps : " + err.Error())
	}

	logrus.Info("Enabling Gitops")
	gitDB := dbSchemaGitOps.GetGitConfigDB(config)

	commit, err := SetupGitOps(GitUserFromContext(ctx), GetGitOpsConfig(gitDB))
	if err != nil {
		return false, errors.New("Failed to setup GitOps : " + err.Error())
	}
	gitDB.LatestCommit = commit

	err = g.gitOpsOperator.AddGitConfig(ctx, &gitDB)
	if err != nil {
		return false, errors.New("Failed to enable GitOps in DB : " + err.Error())
	}

	return true, nil
}

// DisableGitOpsHandler disables gitops for a specific project
func (g *gitOpsService) DisableGitOpsHandler(ctx context.Context, projectID string) (bool, error) {
	gitLock.Lock(projectID, nil)
	defer gitLock.Unlock(projectID, nil)

	logrus.Info("Disabling Gitops")
	err := g.gitOpsOperator.DeleteGitConfig(ctx, projectID)
	if err != nil {
		return false, errors.New("Failed to delete git config from DB : " + err.Error())
	}

	err = os.RemoveAll(DefaultPath + projectID)
	if err != nil {
		return false, errors.New("Failed to delete git repo from disk : " + err.Error())
	}

	return true, nil
}

// UpdateGitOpsDetailsHandler updates an exiting gitops config for a project
func (g *gitOpsService) UpdateGitOpsDetailsHandler(ctx context.Context, config model.GitConfig) (bool, error) {
	gitLock.Lock(config.ProjectID, nil)
	defer gitLock.Unlock(config.ProjectID, nil)

	gitLock.Lock(config.RepoURL, &config.Branch)
	defer gitLock.Unlock(config.RepoURL, &config.Branch)

	existingConfig, err := g.gitOpsOperator.GetGitConfig(ctx, config.ProjectID)
	if err != nil {
		return false, errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if existingConfig == nil {
		return false, errors.New("GitOps Disabled ")
	}

	logrus.Info("Enabling Gitops")
	gitDB := dbSchemaGitOps.GetGitConfigDB(config)

	gitConfig := GetGitOpsConfig(gitDB)
	originalPath := gitConfig.LocalPath
	gitConfig.LocalPath = tempPath + gitConfig.ProjectID
	commit, err := SetupGitOps(GitUserFromContext(ctx), gitConfig)
	if err != nil {
		return false, errors.New("Failed to setup GitOps : " + err.Error())
	}
	gitDB.LatestCommit = commit

	err = g.gitOpsOperator.ReplaceGitConfig(ctx, bson.D{{"project_id", config.ProjectID}}, &gitDB)
	if err != nil {
		return false, errors.New("Failed to enable GitOps in DB : " + err.Error())
	}

	err = os.RemoveAll(originalPath)
	if err != nil {
		return false, errors.New("Cannot remove existing repo : " + err.Error())
	}
	err = os.Rename(gitConfig.LocalPath, originalPath)
	if err != nil {
		return false, errors.New("Cannot copy new repo : " + err.Error())
	}

	return true, nil
}

// GetGitOpsDetails returns the current gitops config for the requested project
func (g *gitOpsService) GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error) {
	gitLock.Lock(projectID, nil)
	defer gitLock.Unlock(projectID, nil)
	config, err := g.gitOpsOperator.GetGitConfig(ctx, projectID)
	if err != nil {
		return nil, errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if config == nil {
		return &model.GitConfigResponse{
			ProjectID: projectID,
			Enabled:   false,
		}, nil
	}
	resp := model.GitConfigResponse{
		Enabled:   true,
		ProjectID: config.ProjectID,
		Branch:    &config.Branch,
		RepoURL:   &config.RepositoryURL,
		AuthType:  &config.AuthType,
	}
	switch config.AuthType {

	case model.AuthTypeToken:
		resp.Token = config.Token

	case model.AuthTypeBasic:
		resp.UserName = config.UserName
		resp.Password = config.Password

	case model.AuthTypeSSH:
		resp.SSHPrivateKey = config.SSHPrivateKey
	}
	return &resp, nil
}

// UpsertWorkflowToGit adds/updates workflow to git
func (g *gitOpsService) UpsertWorkflowToGit(ctx context.Context, workflow *model.ChaosWorkFlowRequest) error {
	gitLock.Lock(workflow.ProjectID, nil)
	defer gitLock.Unlock(workflow.ProjectID, nil)
	config, err := g.gitOpsOperator.GetGitConfig(ctx, workflow.ProjectID)
	if err != nil {
		return errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if config == nil {
		return nil
	}
	gitLock.Lock(config.RepositoryURL, &config.Branch)
	defer gitLock.Unlock(config.RepositoryURL, &config.Branch)

	gitConfig := GetGitOpsConfig(*config)

	err = g.syncDBToGit(ctx, gitConfig)
	if err != nil {
		return errors.New("Sync Error | " + err.Error())
	}

	workflowPath := gitConfig.LocalPath + "/" + ProjectDataPath + "/" + gitConfig.ProjectID + "/" + workflow.WorkflowName + ".yaml"

	data, err := yaml.JSONToYAML([]byte(workflow.WorkflowManifest))
	if err != nil {
		return errors.New("Cannot convert manifest to yaml : " + err.Error())
	}

	err = ioutil.WriteFile(workflowPath, data, 0644)
	if err != nil {
		return errors.New("Cannot write workflow to git : " + err.Error())
	}

	commit, err := gitConfig.GitCommit(GitUserFromContext(ctx), "Updated Workflow : "+workflow.WorkflowName, nil)
	if err != nil {
		return errors.New("Cannot commit workflow to git : " + err.Error())
	}

	err = gitConfig.GitPush()
	if err != nil {
		return errors.New("Cannot push workflow to git : " + err.Error())
	}

	query := bson.D{{"project_id", gitConfig.ProjectID}}
	update := bson.D{{"$set", bson.D{{"latest_commit", commit}}}}
	err = g.gitOpsOperator.UpdateGitConfig(ctx, query, update)
	if err != nil {
		return errors.New("Failed to update git config : " + err.Error())
	}

	return nil
}

// DeleteWorkflowFromGit deletes workflow from git
func (g *gitOpsService) DeleteWorkflowFromGit(ctx context.Context, workflow *model.ChaosWorkFlowRequest) error {
	logrus.Info("Deleting Workflow...")
	gitLock.Lock(workflow.ProjectID, nil)
	defer gitLock.Unlock(workflow.ProjectID, nil)

	config, err := g.gitOpsOperator.GetGitConfig(ctx, workflow.ProjectID)
	if err != nil {
		return errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if config == nil {
		return nil
	}
	gitLock.Lock(config.RepositoryURL, &config.Branch)
	defer gitLock.Unlock(config.RepositoryURL, &config.Branch)

	gitConfig := GetGitOpsConfig(*config)

	err = g.syncDBToGit(ctx, gitConfig)
	if err != nil {
		return errors.New("Sync Error | " + err.Error())
	}

	workflowPath := ProjectDataPath + "/" + gitConfig.ProjectID + "/" + workflow.WorkflowName + ".yaml"
	exists, err := PathExists(gitConfig.LocalPath + "/" + workflowPath)
	if err != nil {
		return errors.New("Cannot delete workflow from git : " + err.Error())
	}
	if !exists {
		logrus.Error("File not found in git : ", gitConfig.LocalPath+"/"+workflowPath)
		return nil
	}
	err = os.RemoveAll(gitConfig.LocalPath + "/" + workflowPath)
	if err != nil {
		return errors.New("Cannot delete workflow from git : " + err.Error())
	}

	commit, err := gitConfig.GitCommit(GitUserFromContext(ctx), "Deleted Workflow : "+workflow.WorkflowName, &workflowPath)
	if err != nil {
		logrus.Error("Error", err)
		return errors.New("Cannot commit workflow[delete] to git : " + err.Error())
	}

	err = gitConfig.GitPush()
	if err != nil {
		logrus.Error("Error", err)
		return errors.New("Cannot push workflow[delete] to git : " + err.Error())
	}

	query := bson.D{{"project_id", gitConfig.ProjectID}}
	update := bson.D{{"$set", bson.D{{"latest_commit", commit}}}}
	err = g.gitOpsOperator.UpdateGitConfig(ctx, query, update)
	if err != nil {
		return errors.New("Failed to update git config : " + err.Error())
	}

	return nil
}

// GitSyncHelper sync a particular repo with DB
func (g *gitOpsService) gitSyncHelper(config dbSchemaGitOps.GitConfigDB, wg *sync.WaitGroup) {
	if wg != nil {
		defer wg.Done()
	}

	gitLock.Lock(config.ProjectID, nil)
	defer gitLock.Unlock(config.ProjectID, nil)

	gitLock.Lock(config.RepositoryURL, &config.Branch)
	defer gitLock.Unlock(config.RepositoryURL, &config.Branch)

	ctx, cancel := context.WithTimeout(backgroundContext, timeout)
	defer cancel()
	// get most recent data from db after acquiring lock
	conf, err := g.gitOpsOperator.GetGitConfig(ctx, config.ProjectID)
	if err != nil {
		logrus.Error("Repo Sync ERROR: ", config.ProjectID, err.Error())
	}
	if conf == nil {
		return
	}

	gitConfig := GetGitOpsConfig(*conf)

	err = g.syncDBToGit(nil, gitConfig)
	if err != nil {
		logrus.Error("Repo Sync ERROR: ", conf.ProjectID, err.Error())
	}
}

// GitOpsSyncHandler syncs all repos in the DB
func (g *gitOpsService) GitOpsSyncHandler(singleRun bool) {
	const syncGroupSize = 10
	const syncInterval = 2 * time.Minute
	for {

		ctx, cancel := context.WithTimeout(backgroundContext, timeout)
		logrus.Info("Running GitOps DB Sync...")
		configs, err := g.gitOpsOperator.GetAllGitConfig(ctx)

		cancel()
		if err != nil {
			logrus.Error("Failed to get git configs from db : ", err) //condition
		}

		count := len(configs)
		if count > 0 {
			logrus.Info("Updating : ", configs) // condition

			count = count - 1
			for count >= 0 {
				min := count - (syncGroupSize - 1)
				if min < 0 {
					min = 0
				}
				wg := sync.WaitGroup{}
				wg.Add(count + 1 - min)
				for count >= min {
					go g.gitSyncHelper(configs[count], &wg)
					count -= 1
				}
				wg.Wait()
			}

			logrus.Info("GitOps DB Sync Complete") //condition
		}
		if singleRun {
			break
		}
		time.Sleep(syncInterval)
	}
}

// SyncDBToGit syncs the DB with the GitRepo for the project
func (g *gitOpsService) syncDBToGit(ctx context.Context, config GitConfig) error {
	repositoryExists, err := PathExists(config.LocalPath)
	if err != nil {
		return fmt.Errorf("Error while checking repo exists, err: %s", err)
	}
	if !repositoryExists {
		err = config.setupGitRepo(GitUserFromContext(ctx))
	} else {
		err = config.GitPull()
		if err != nil {
			return errors.New("Error syncing DB : " + err.Error())
		}
	}
	latestCommit, files, err := config.GetChanges()
	if err != nil {
		return errors.New("Error Getting File Changes : " + err.Error())
	}
	if latestCommit == config.LatestCommit {
		return nil
	}
	logrus.Info(latestCommit, " ", config.LatestCommit, "File Changes: ", files)
	newWorkflows := false
	for file := range files {
		if !strings.HasSuffix(file, ".yaml") {
			continue
		}
		// check if file was deleted or not
		exists, err := PathExists(config.LocalPath + "/" + file)
		if err != nil {
			return errors.New("Error checking file in local repo : " + file + " | " + err.Error())
		}
		if !exists {
			err = g.deleteWorkflow(file, config)
			if err != nil {
				logrus.Error("Error while deleting workflow db entry : " + file + " | " + err.Error())
				continue
			}
			continue
		}
		// read changes [new additions/updates]
		data, err := ioutil.ReadFile(config.LocalPath + "/" + file)
		if err != nil {
			logrus.Error("Error reading data from git file : " + file + " | " + err.Error())
			continue
		}
		data, err = yaml.YAMLToJSON(data)
		if err != nil {
			logrus.Error("Error unmarshalling data from git file : " + file + " | " + err.Error())
			continue
		}
		wfID := gjson.Get(string(data), "metadata.labels.workflow_id").String()
		kind := strings.ToLower(gjson.Get(string(data), "kind").String())
		if kind != "cronworkflow" && kind != "workflow" && kind != "chaosengine" {
			continue
		}

		logrus.Info("WFID in changed File :", wfID)
		if wfID == "" {
			logrus.Info("New Workflow pushed to git : " + file)
			flag, err := g.createWorkflow(string(data), file, config)
			if err != nil {
				logrus.Error("Error while creating new workflow db entry : " + file + " | " + err.Error())
				continue
			}
			if flag {
				newWorkflows = true
			}
		} else {
			err = g.updateWorkflow(string(data), wfID, file, config)
			if err != nil {
				logrus.Error("Error while updating experiment db entry : " + file + " | " + err.Error())
				continue
			}
		}

	}
	// push workflows with workflow_id added
	if newWorkflows {
		latestCommit, err = config.GitCommit(GitUserFromContext(ctx), "Updated New Workflows", nil)
		if err != nil {
			return errors.New("Cannot commit workflows to git : " + err.Error())
		}
		err = config.GitPush()
		if err != nil {
			return errors.New("Cannot push workflows to git : " + err.Error())
		}
	}

	query := bson.D{{"project_id", config.ProjectID}}
	update := bson.D{{"$set", bson.D{{"latest_commit", latestCommit}}}}

	if ctx == nil {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
		defer cancel()
		err = g.gitOpsOperator.UpdateGitConfig(ctx, query, update)
	} else {
		err = g.gitOpsOperator.UpdateGitConfig(ctx, query, update)
	}

	if err != nil {
		return errors.New("Failed to update git config : " + err.Error())
	}
	return nil
}

// createWorkflow helps in creating a new workflow during the SyncDBToGit operation
func (g *gitOpsService) createWorkflow(data, file string, config GitConfig) (bool, error) {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)
	wfName := gjson.Get(data, "metadata.name").String()
	clusterID := gjson.Get(data, "metadata.labels.cluster_id").String()
	logrus.Info("Workflow Details | wf_name: ", wfName, " cluster_id: ", clusterID)
	if wfName == "" || clusterID == "" {
		return false, nil
	}
	if fileName != wfName {
		return false, errors.New("file name doesn't match workflow name")
	}
	workflow := model.ChaosWorkFlowRequest{
		WorkflowID:          nil,
		WorkflowManifest:    data,
		CronSyntax:          "",
		WorkflowName:        wfName,
		WorkflowDescription: "",
		Weightages:          nil,
		IsCustomWorkflow:    true,
		ProjectID:           config.ProjectID,
		ClusterID:           clusterID,
	}
	input, wfType, err := g.chaosWorkflowService.ProcessWorkflow(&workflow)
	if err != nil {
		return false, err
	}
	err = g.chaosWorkflowService.ProcessWorkflowCreation(input, "git-ops", wfType, store.Store)
	if err != nil {
		return false, err
	}

	workflowPath := config.LocalPath + "/" + file

	yamlData, err := yaml.JSONToYAML([]byte(input.WorkflowManifest))
	if err != nil {
		return false, errors.New("Cannot convert manifest to yaml : " + err.Error())
	}

	err = ioutil.WriteFile(workflowPath, yamlData, 0644)
	if err != nil {
		return false, errors.New("Cannot write workflow to git : " + err.Error())
	}

	return true, nil
}

// updateWorkflow helps in updating an existing workflow during the SyncDBToGit operation
func (g *gitOpsService) updateWorkflow(data, wfID, file string, config GitConfig) error {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)
	wfName := gjson.Get(data, "metadata.name").String()
	clusterID := gjson.Get(data, "metadata.labels.cluster_id").String()
	logrus.Info("Workflow Details | wf_name: ", wfName, " cluster_id: ", clusterID)
	if wfName == "" || clusterID == "" {
		logrus.Error("Cannot Update workflow missing workflow name or cluster id")
		return nil
	}

	if fileName != wfName {
		return errors.New("file name doesn't match workflow name")
	}

	workflow, err := g.chaosWorkflowService.GetWorkflows(bson.D{{"workflow_id", wfID}, {"project_id", config.ProjectID}, {"isRemoved", false}})
	if len(workflow) == 0 {
		return errors.New("No such workflow found : " + wfID)
	}

	if clusterID != workflow[0].ClusterID {
		logrus.Error("Cannot change cluster id for existing workflow")
		return nil
	}

	workflowData := model.ChaosWorkFlowRequest{
		WorkflowID:          &workflow[0].WorkflowID,
		WorkflowManifest:    data,
		CronSyntax:          workflow[0].CronSyntax,
		WorkflowName:        wfName,
		WorkflowDescription: workflow[0].WorkflowDescription,
		Weightages:          nil,
		IsCustomWorkflow:    workflow[0].IsCustomWorkflow,
		ProjectID:           config.ProjectID,
		ClusterID:           workflow[0].ClusterID,
	}

	input, wfType, err := g.chaosWorkflowService.ProcessWorkflow(&workflowData)
	if err != nil {
		return err
	}
	return g.chaosWorkflowService.ProcessWorkflowUpdate(input, "git-ops", wfType, store.Store)
}

// deleteWorkflow helps in deleting a workflow from DB during the SyncDBToGit operation
func (g *gitOpsService) deleteWorkflow(file string, config GitConfig) error {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)

	query := bson.D{{"workflow_name", fileName}, {"project_id", config.ProjectID}}
	workflow, err := g.chaosWorkflowService.GetWorkflow(query)
	if err != nil {
		return err
	}

	return g.chaosWorkflowService.ProcessWorkflowDelete(query, workflow, "git-ops", store.Store)
}
