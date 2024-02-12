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

	chaosExperimentOps "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/ops"

	"github.com/ghodss/yaml"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	chaos_infra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	data_store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/gitops"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/grpc"

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
	GitOpsNotificationHandler(ctx context.Context, infra chaos_infrastructure.ChaosInfra, experimentID string) (string, error)
	EnableGitOpsHandler(ctx context.Context, projectID string, config model.GitConfig) (bool, error)
	DisableGitOpsHandler(ctx context.Context, projectID string) (bool, error)
	UpdateGitOpsDetailsHandler(ctx context.Context, projectID string, config model.GitConfig) (bool, error)
	GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error)
	UpsertExperimentToGit(ctx context.Context, projectID string, experiment *model.ChaosExperimentRequest) error
	DeleteExperimentFromGit(ctx context.Context, projectID string, experiment *model.ChaosExperimentRequest) error
	GitOpsSyncHandler(singleRun bool)
	SyncDBToGit(ctx context.Context, config GitConfig) error
}

type gitOpsService struct {
	gitOpsOperator         *gitops.Operator
	chaosExperimentOps     chaos_experiment.Operator
	chaosExperimentService chaosExperimentOps.Service
}

// NewGitOpsService returns a new instance of a gitOpsService
func NewGitOpsService(gitOpsOperator *gitops.Operator, chaosExperimentService chaosExperimentOps.Service, chaosExperimentOps chaos_experiment.Operator) Service {
	return &gitOpsService{
		gitOpsOperator:         gitOpsOperator,
		chaosExperimentService: chaosExperimentService,
		chaosExperimentOps:     chaosExperimentOps,
	}
}

// GitOpsNotificationHandler sends experiment run request(single run experiment only) to agent on gitops notification
func (g *gitOpsService) GitOpsNotificationHandler(ctx context.Context, infra chaos_infrastructure.ChaosInfra, experimentID string) (string, error) {
	gitLock.Lock(infra.ProjectID, nil)
	defer gitLock.Unlock(infra.ProjectID, nil)
	config, err := g.gitOpsOperator.GetGitConfig(ctx, infra.ProjectID)
	if err != nil {
		return "", errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if config == nil {
		return "Gitops Disabled", nil
	}
	query := bson.D{{"infra_id", infra.InfraID}, {"experiment_id", experimentID}, {"is_removed", false}}
	experiments, err := g.chaosExperimentOps.GetExperiments(query)
	if err != nil {
		logrus.Error("Could not get experiment :", err)
		return "could not get experiment", err
	}
	if len(experiments) == 0 {
		return "", errors.New("no such experiment found")
	}
	resKind := gjson.Get(experiments[0].Revision[len(experiments[0].Revision)-1].ExperimentManifest, "kind").String()
	if strings.ToLower(resKind) == "cronexperiment" { // no op
		return "Request Acknowledged for experimentID: " + experimentID, nil
	}
	experiments[0].Revision[len(experiments[0].Revision)-1].ExperimentManifest, err = sjson.Set(experiments[0].Revision[len(experiments[0].Revision)-1].ExperimentManifest, "metadata.name", experiments[0].Name+"-"+strconv.FormatInt(time.Now().UnixMilli(), 10))
	if err != nil {
		logrus.Error("Failed to updated experiment name :", err)
		return "", errors.New("Failed to updated experiment name " + err.Error())
	}

	username := "git-ops"
	chaos_infra.SendExperimentToSubscriber(experiments[0].ProjectID, &model.ChaosExperimentRequest{
		ExperimentManifest: experiments[0].Revision[len(experiments[0].Revision)-1].ExperimentManifest,
		InfraID:            experiments[0].InfraID,
	}, &username, nil, "create", store.Store)

	return "Request Acknowledged for experimentID: " + experimentID, nil
}

// EnableGitOpsHandler enables gitops for a particular project
func (g *gitOpsService) EnableGitOpsHandler(ctx context.Context, projectID string, config model.GitConfig) (bool, error) {
	gitLock.Lock(projectID, nil)
	defer gitLock.Unlock(projectID, nil)

	gitLock.Lock(config.RepoURL, &config.Branch)
	defer gitLock.Unlock(config.RepoURL, &config.Branch)

	var conn *grpc2.ClientConn
	client, conn := grpc.GetAuthGRPCSvcClient(conn)
	defer conn.Close()

	_, err := grpc.GetProjectById(client, projectID)
	if err != nil {
		return false, errors.New("Failed to setup GitOps : " + err.Error())
	}

	logrus.Info("Enabling Gitops")
	gitDB := gitops.GetGitConfigDB(projectID, config)

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
func (g *gitOpsService) UpdateGitOpsDetailsHandler(ctx context.Context, projectID string, config model.GitConfig) (bool, error) {
	gitLock.Lock(projectID, nil)
	defer gitLock.Unlock(projectID, nil)

	gitLock.Lock(config.RepoURL, &config.Branch)
	defer gitLock.Unlock(config.RepoURL, &config.Branch)

	existingConfig, err := g.gitOpsOperator.GetGitConfig(ctx, projectID)
	if err != nil {
		return false, errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if existingConfig == nil {
		return false, errors.New("GitOps Disabled ")
	}

	logrus.Info("Enabling Gitops")
	gitDB := gitops.GetGitConfigDB(projectID, config)

	gitConfig := GetGitOpsConfig(gitDB)
	originalPath := gitConfig.LocalPath
	gitConfig.LocalPath = tempPath + gitConfig.ProjectID
	commit, err := SetupGitOps(GitUserFromContext(ctx), gitConfig)
	if err != nil {
		return false, errors.New("Failed to setup GitOps : " + err.Error())
	}
	gitDB.LatestCommit = commit

	err = g.gitOpsOperator.ReplaceGitConfig(ctx, bson.D{{"project_id", projectID}}, &gitDB)
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

// UpsertExperimentToGit adds/updates experiment to git
func (g *gitOpsService) UpsertExperimentToGit(ctx context.Context, projectID string, experiment *model.ChaosExperimentRequest) error {
	gitLock.Lock(projectID, nil)
	defer gitLock.Unlock(projectID, nil)
	config, err := g.gitOpsOperator.GetGitConfig(ctx, projectID)
	if err != nil {
		return errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if config == nil {
		return nil
	}
	gitLock.Lock(config.RepositoryURL, &config.Branch)
	defer gitLock.Unlock(config.RepositoryURL, &config.Branch)

	gitConfig := GetGitOpsConfig(*config)

	err = g.SyncDBToGit(ctx, gitConfig)
	if err != nil {
		return errors.New("Sync Error | " + err.Error())
	}

	experimentPath := gitConfig.LocalPath + "/" + ProjectDataPath + "/" + gitConfig.ProjectID + "/" + experiment.ExperimentName + ".yaml"

	data, err := yaml.JSONToYAML([]byte(experiment.ExperimentManifest))
	if err != nil {
		return errors.New("Cannot convert manifest to yaml : " + err.Error())
	}

	err = ioutil.WriteFile(experimentPath, data, 0644)
	if err != nil {
		return errors.New("Cannot write experiment to git : " + err.Error())
	}

	commit, err := gitConfig.GitCommit(GitUserFromContext(ctx), "Updated Experiment : "+experiment.ExperimentName, nil)
	if err != nil {
		return errors.New("Cannot commit experiment to git : " + err.Error())
	}

	err = gitConfig.GitPush()
	if err != nil {
		return errors.New("Cannot push experiment to git : " + err.Error())
	}

	query := bson.D{{"project_id", gitConfig.ProjectID}}
	update := bson.D{{"$set", bson.D{{"latest_commit", commit}}}}
	err = g.gitOpsOperator.UpdateGitConfig(ctx, query, update)
	if err != nil {
		return errors.New("Failed to update git config : " + err.Error())
	}

	return nil
}

// DeleteExperimentFromGit deletes experiment from git
func (g *gitOpsService) DeleteExperimentFromGit(ctx context.Context, projectID string, experiment *model.ChaosExperimentRequest) error {
	logrus.Info("Deleting Experiment...")
	gitLock.Lock(projectID, nil)
	defer gitLock.Unlock(projectID, nil)

	config, err := g.gitOpsOperator.GetGitConfig(ctx, projectID)
	if err != nil {
		return errors.New("Cannot get Git Config from DB : " + err.Error())
	}
	if config == nil {
		return nil
	}
	gitLock.Lock(config.RepositoryURL, &config.Branch)
	defer gitLock.Unlock(config.RepositoryURL, &config.Branch)

	gitConfig := GetGitOpsConfig(*config)

	err = g.SyncDBToGit(ctx, gitConfig)
	if err != nil {
		return errors.New("Sync Error | " + err.Error())
	}

	experimentPath := ProjectDataPath + "/" + gitConfig.ProjectID + "/" + experiment.ExperimentName + ".yaml"
	exists, err := PathExists(gitConfig.LocalPath + "/" + experimentPath)
	if err != nil {
		return errors.New("Cannot delete experiment from git : " + err.Error())
	}
	if !exists {
		logrus.Error("File not found in git : ", gitConfig.LocalPath+"/"+experimentPath)
		return nil
	}
	err = os.RemoveAll(gitConfig.LocalPath + "/" + experimentPath)
	if err != nil {
		return errors.New("Cannot delete experiment from git : " + err.Error())
	}

	commit, err := gitConfig.GitCommit(GitUserFromContext(ctx), "Deleted Experiment : "+experiment.ExperimentName, &experimentPath)
	if err != nil {
		logrus.Error("Error", err)
		return errors.New("Cannot commit experiment[delete] to git : " + err.Error())
	}

	err = gitConfig.GitPush()
	if err != nil {
		logrus.Error("Error", err)
		return errors.New("Cannot push experiment[delete] to git : " + err.Error())
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
func (g *gitOpsService) gitSyncHelper(config gitops.GitConfigDB, wg *sync.WaitGroup) {
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

	err = g.SyncDBToGit(nil, gitConfig)
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
func (g *gitOpsService) SyncDBToGit(ctx context.Context, config GitConfig) error {
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
	newExperiments := false
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
			err = g.deleteExperiment(file, config)
			if err != nil {
				logrus.Error("Error while deleting experiment db entry : " + file + " | " + err.Error())
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
		wfID := gjson.Get(string(data), "metadata.labels.experiment_id").String()
		kind := strings.ToLower(gjson.Get(string(data), "kind").String())
		if kind != "cronexperiment" && kind != "experiment" && kind != "chaosengine" {
			continue
		}

		logrus.Info("WFID in changed File :", wfID)
		if wfID == "" {
			logrus.Info("New Experiment pushed to git : " + file)
			flag, err := g.createExperiment(ctx, string(data), file, config)
			if err != nil {
				logrus.Error("Error while creating new experiment db entry : " + file + " | " + err.Error())
				continue
			}
			if flag {
				newExperiments = true
			}
		} else {
			err = g.updateExperiment(ctx, string(data), wfID, file, config)
			if err != nil {
				logrus.Error("Error while updating experiment db entry : " + file + " | " + err.Error())
				continue
			}
		}

	}
	// push experiments with experiment_id added
	if newExperiments {
		latestCommit, err = config.GitCommit(GitUserFromContext(ctx), "Updated New Experiments", nil)
		if err != nil {
			return errors.New("Cannot commit experiments to git : " + err.Error())
		}
		err = config.GitPush()
		if err != nil {
			return errors.New("Cannot push experiments to git : " + err.Error())
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

// createExperiment helps in creating a new experiment during the SyncDBToGit operation
func (g *gitOpsService) createExperiment(ctx context.Context, data, file string, config GitConfig) (bool, error) {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)
	wfName := gjson.Get(data, "metadata.name").String()
	infraID := gjson.Get(data, "metadata.labels.infra_id").String()
	logrus.Info("Experiment Details | wf_name: ", wfName, " infra_id: ", infraID)
	if wfName == "" || infraID == "" {
		return false, nil
	}
	if fileName != wfName {
		return false, errors.New("file name doesn't match experiment name")
	}
	experiment := model.ChaosExperimentRequest{
		ExperimentID:          nil,
		ExperimentManifest:    data,
		CronSyntax:            "",
		ExperimentName:        wfName,
		ExperimentDescription: "",
		Weightages:            nil,
		IsCustomExperiment:    true,
		InfraID:               infraID,
	}
	revID := ""
	input, wfType, err := g.chaosExperimentService.ProcessExperiment(ctx, &experiment, config.ProjectID, revID)
	if err != nil {
		return false, err
	}
	err = g.chaosExperimentService.ProcessExperimentCreation(context.Background(), input, "git-ops", config.ProjectID, wfType, revID, store.Store)
	if err != nil {
		return false, err
	}

	experimentPath := config.LocalPath + "/" + file

	yamlData, err := yaml.JSONToYAML([]byte(input.ExperimentManifest))
	if err != nil {
		return false, errors.New("Cannot convert manifest to yaml : " + err.Error())
	}

	err = ioutil.WriteFile(experimentPath, yamlData, 0644)
	if err != nil {
		return false, errors.New("Cannot write experiment to git : " + err.Error())
	}

	return true, nil
}

// updateExperiment helps in updating an existing experiment during the SyncDBToGit operation
func (g *gitOpsService) updateExperiment(ctx context.Context, data, wfID, file string, config GitConfig) error {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)
	wfName := gjson.Get(data, "metadata.name").String()
	infraID := gjson.Get(data, "metadata.labels.infra_id").String()
	logrus.Info("Experiment Details | wf_name: ", wfName, " infra_id: ", infraID)
	if wfName == "" || infraID == "" {
		logrus.Error("Cannot Update experiment missing experiment name or infra id")
		return nil
	}

	if fileName != wfName {
		return errors.New("file name doesn't match experiment name")
	}

	experiment, err := g.chaosExperimentOps.GetExperiments(bson.D{{"experiment_id", wfID}, {"project_id", config.ProjectID}, {"is_removed", false}})
	if len(experiment) == 0 {
		return errors.New("No such experiment found : " + wfID)
	}

	if infraID != experiment[0].InfraID {
		logrus.Error("Cannot change infra id for existing experiment")
		return nil
	}

	experimentData := model.ChaosExperimentRequest{
		ExperimentID:          &experiment[0].ExperimentID,
		ExperimentManifest:    data,
		CronSyntax:            experiment[0].CronSyntax,
		ExperimentName:        wfName,
		ExperimentDescription: experiment[0].Description,
		Weightages:            nil,
		IsCustomExperiment:    experiment[0].IsCustomExperiment,
		InfraID:               experiment[0].InfraID,
	}

	revID := ""
	updateRevision := false
	input, wfType, err := g.chaosExperimentService.ProcessExperiment(ctx, &experimentData, config.ProjectID, revID)
	if err != nil {
		return err
	}
	return g.chaosExperimentService.ProcessExperimentUpdate(input, "git-ops", wfType, revID, updateRevision, config.ProjectID, data_store.Store)
}

// deleteExperiment helps in deleting a experiment from DB during the SyncDBToGit operation
func (g *gitOpsService) deleteExperiment(file string, config GitConfig) error {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)

	query := bson.D{{"experiment_name", fileName}, {"project_id", config.ProjectID}}
	experiment, err := g.chaosExperimentOps.GetExperiment(context.Background(), query)
	if err != nil {
		return err
	}

	return g.chaosExperimentService.ProcessExperimentDelete(query, experiment, "git-ops", data_store.Store)
}
