package gitops

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/ghodss/yaml"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/transport"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"github.com/go-git/go-git/v5/plumbing/transport/ssh"
	log "github.com/sirupsen/logrus"
	"github.com/tidwall/gjson"
	"go.mongodb.org/mongo-driver/bson"
	ssh2 "golang.org/x/crypto/ssh"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/ops"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsGitOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/gitops"
	dbSchemaGitOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/gitops"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
)

// GitConfig structure for the GitOps settings
type GitConfig struct {
	ProjectID     string
	RepositoryURL string
	LocalPath     string
	RemoteName    string
	Branch        string
	LatestCommit  string
	UserName      *string
	Password      *string
	AuthType      model.AuthType
	Token         *string
	SSHPrivateKey *string
}

type GitUser struct {
	username string
	email    string
}

const (
	DefaultPath     = "/tmp/gitops/"
	ProjectDataPath = "litmus"
)

func GitUserFromContext(ctx context.Context) GitUser {
	defaultUser := GitUser{
		username: "gitops@litmus-chaos",
		email:    "gitops@litmus.chaos",
	}
	if ctx == nil {
		return defaultUser
	}
	userClaims := ctx.Value(authorization.UserClaim)
	if userClaims == nil {
		return defaultUser
	}
	if _, ok := userClaims.(jwt.MapClaims)["email"]; !ok {
		return GitUser{
			username: userClaims.(jwt.MapClaims)["username"].(string) + "@litmus-chaos",
			email:    userClaims.(jwt.MapClaims)["username"].(string) + "@litmus-chaos",
		}
	}
	return GitUser{
		username: userClaims.(jwt.MapClaims)["username"].(string) + "@litmus-chaos",
		email:    userClaims.(jwt.MapClaims)["email"].(string),
	}
}

// GetGitOpsConfig is used for constructing the GitConfig from dbSchemaGitOps.GitConfigDB
func GetGitOpsConfig(repoData dbSchemaGitOps.GitConfigDB) GitConfig {
	gitConfig := GitConfig{
		ProjectID:     repoData.ProjectID,
		RepositoryURL: repoData.RepositoryURL,
		RemoteName:    "origin",
		Branch:        repoData.Branch,
		LocalPath:     DefaultPath + repoData.ProjectID,
		LatestCommit:  repoData.LatestCommit,
		UserName:      repoData.UserName,
		Password:      repoData.Password,
		AuthType:      repoData.AuthType,
		Token:         repoData.Token,
		SSHPrivateKey: repoData.SSHPrivateKey,
	}

	return gitConfig
}

// setupGitRepo helps clones and sets up the repo for gitops
func (c GitConfig) setupGitRepo(user GitUser) error {
	projectPath := c.LocalPath + "/" + ProjectDataPath + "/" + c.ProjectID

	// clone repo
	_, err := c.GitClone()
	if err != nil {
		return err
	}

	// check if project dir already present in repo
	exists, err := PathExists(projectPath + "/.info")
	if err != nil {
		return err
	}

	gitInfo := map[string]string{"projectID": c.ProjectID, "revision": "1"}
	if exists {
		data, err := ioutil.ReadFile(projectPath + "/.info")
		if err != nil {
			return errors.New("can't read existing git info file " + err.Error())
		}
		err = json.Unmarshal(data, &gitInfo)
		if err != nil {
			return errors.New("can't read existing git info file " + err.Error())
		}
		newRev, err := strconv.Atoi(gitInfo["revision"])
		if err != nil {
			return errors.New("can't read existing git info file[failed to parse revision] " + err.Error())
		}
		gitInfo["revision"] = strconv.Itoa(newRev + 1)
	} else {
		// create project dir and add config if not already present
		err = os.MkdirAll(projectPath, 0755)
		if err != nil {
			return err
		}
	}
	data, err := json.Marshal(gitInfo)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(projectPath+"/.info", data, 0644)
	if err != nil {
		return err
	}

	// commit and push
	_, err = c.GitCommit(user, "Setup Litmus Chaos GitOps for Project :"+c.ProjectID, nil)
	if err != nil {
		return err
	}
	return c.GitPush()
}

// GitClone clones the repo
func (c GitConfig) GitClone() (*git.Repository, error) {
	// clean the local path
	err := os.RemoveAll(c.LocalPath)
	if err != nil {
		return nil, err
	}
	auth, err := c.getAuthMethod()
	if err != nil {
		return nil, err
	}

	return git.PlainClone(c.LocalPath, false, &git.CloneOptions{
		Auth:          auth,
		URL:           c.RepositoryURL,
		Progress:      os.Stdout,
		ReferenceName: plumbing.NewBranchReferenceName(c.Branch),
		SingleBranch:  true,
	})
}

// getAuthMethod returns the AuthMethod instance required for the current repo access [read/writes]
func (c GitConfig) getAuthMethod() (transport.AuthMethod, error) {

	switch c.AuthType {

	case model.AuthTypeToken:
		return &http.BasicAuth{
			Username: "litmus", // this can be anything except an empty string
			Password: *c.Token,
		}, nil

	case model.AuthTypeBasic:
		return &http.BasicAuth{
			Username: *c.UserName,
			Password: *c.Password,
		}, nil

	case model.AuthTypeSSH:
		publicKey, err := ssh.NewPublicKeys("git", []byte(*c.SSHPrivateKey), "")
		if err != nil {
			return nil, err
		}
		publicKey.HostKeyCallback = ssh2.InsecureIgnoreHostKey()
		return publicKey, nil

	case model.AuthTypeNone:
		return nil, nil

	default:
		return nil, errors.New("No Matching Auth Type Found")
	}
}

// UnsafeGitPull executes git pull after a hard reset when uncommited changes are present in repo. Not safe.
func (c GitConfig) UnsafeGitPull() error {
	cleanStatus, err := c.GitGetStatus()
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"CleanStatus": cleanStatus}).Info("Executed GitGetStatus()... ")
	if !cleanStatus {
		log.Print("Resetting Repo...: " + c.ProjectID)
		return c.handlerForDirtyStatus()
	}
	return c.GitPull()
}

// GitGetStatus executes "git get status --porcelain" for the provided Repository Path,
// returns true if the repository is clean
// and false if the repository is dirty
func (c GitConfig) GitGetStatus() (bool, error) {
	_, workTree, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return true, err
	}
	status, err := workTree.Status()
	if err != nil {
		return false, err
	}
	return status.IsClean(), nil
}

// getRepositoryWorktreeReference returns the git.Repository and git.Worktree instanes for the repo
func (c GitConfig) getRepositoryWorktreeReference() (*git.Repository, *git.Worktree, error) {
	repo, err := git.PlainOpen(c.LocalPath)
	if err != nil {
		return nil, nil, err
	}
	workTree, err := repo.Worktree()
	if err != nil {
		return nil, nil, err
	}
	return repo, workTree, nil
}

// handlerForDirtyStatus calls relative functions if the GitGetStatus gives a clean status as a result
func (c GitConfig) handlerForDirtyStatus() error {
	if err := c.GitHardReset(); err != nil {
		return err
	}
	return c.GitPull()
}

// GitHardReset executes "git reset --hard HEAD" in provided Repository Path
func (c GitConfig) GitHardReset() error {
	_, workTree, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return err
	}
	if workTree.Reset(&git.ResetOptions{Mode: git.HardReset}) != nil {
		return fmt.Errorf("error in executing Reset: %s", err)
	}
	return nil
}

// GitPull updates the repository in provided Path
func (c GitConfig) GitPull() error {
	_, workTree, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return err
	}
	auth, err := c.getAuthMethod()
	if err != nil {
		return err
	}
	err = workTree.Pull(&git.PullOptions{
		Auth:          auth,
		RemoteName:    c.RemoteName,
		ReferenceName: plumbing.NewBranchReferenceName(c.Branch),
		SingleBranch:  true,
	})
	if err != nil && err != git.NoErrAlreadyUpToDate {
		return err
	}
	return nil
}

// GitCheckout changes the current active branch to specified branch in GitConfig
func (c GitConfig) GitCheckout() error {
	r, w, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return err
	}
	_, err = r.Storer.Reference(plumbing.NewBranchReferenceName(c.Branch))
	create := true
	log.Print(err)
	if err == nil {
		create = false
	}
	return w.Checkout(&git.CheckoutOptions{
		Branch: plumbing.NewBranchReferenceName(c.Branch),
		Create: create,
	})
}

// GitPush pushes the current changes to remote set in GitConfig, always needs auth credentials
func (c GitConfig) GitPush() error {
	if c.AuthType == model.AuthTypeNone {
		return errors.New("cannot write/push without credentials, auth type = none")
	}

	r, _, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return err
	}
	auth, err := c.getAuthMethod()
	if err != nil {
		return err
	}
	err = r.Push(&git.PushOptions{
		RemoteName: c.RemoteName,
		Auth:       auth,
		Progress:   os.Stdout,
	})
	if err == git.NoErrAlreadyUpToDate {
		return nil
	}
	return err
}

// GitCommit saves the changes in the repo and commits them with the message provided
func (c GitConfig) GitCommit(user GitUser, message string, deleteFile *string) (string, error) {
	_, w, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return "", err
	}
	if deleteFile == nil {
		_, err = w.Add("./litmus/" + c.ProjectID + "/")
		if err != nil {
			return "", err
		}
	} else {
		_, err := w.Remove(*deleteFile)
		if err != nil {
			return "", err
		}
	}
	hash, err := w.Commit(message, &git.CommitOptions{
		Author: &object.Signature{
			Name:  user.username,
			Email: user.email,
			When:  time.Now(),
		},
	})

	if err != nil {
		return "", err
	}
	return hash.String(), nil
}

// GetChanges returns the LatestCommit and list of files changed(since previous LatestCommit) in the project directory mentioned in GitConfig
func (c GitConfig) GetChanges() (string, map[string]int, error) {
	path := ProjectDataPath + "/" + c.ProjectID + "/"

	r, _, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return "", nil, err
	}
	var knownCommit *object.Commit = nil
	if c.LatestCommit != "" {
		knownCommit, err = r.CommitObject(plumbing.NewHash(c.LatestCommit))
		if err != nil {
			return "", nil, err
		}
	}
	visited := map[string]int{}
	lastFile := ""

	commitIter, err := r.Log(&git.LogOptions{
		PathFilter: func(file string) bool {
			if (strings.HasSuffix(path, "/") && strings.HasPrefix(file, path)) || (path == file) {
				visited[file] += 1
				lastFile = file
				return true
			}
			return false
		},
		Order: git.LogOrderCommitterTime,
	})
	if err != nil {
		return "", nil, errors.New("Failed to get commit Iterator :" + err.Error())
	}

	commit, err := commitIter.Next()
	if err != nil && err != io.EOF {
		return "", nil, err
	}
	if commit != nil {
		c.LatestCommit = commit.Hash.String()
	}

	for err != io.EOF && commit != nil {
		if knownCommit != nil {
			ancestor, er := commit.IsAncestor(knownCommit)
			if er != nil {
				return "", nil, er
			}
			if knownCommit.Hash == commit.Hash || ancestor {
				break
			}
		}
		commit, err = commitIter.Next()
		if err != nil && err != io.EOF {
			return "", nil, err
		}
	}
	if err != io.EOF && visited[lastFile] == 1 {
		delete(visited, lastFile)
	}
	return c.LatestCommit, visited, nil
}

// GetLatestCommitHash returns the latest commit hash in the local repo for the project directory
func (c GitConfig) GetLatestCommitHash() (string, error) {
	path := ProjectDataPath + "/" + c.ProjectID + "/"
	r, _, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return "", err
	}

	commitIter, err := r.Log(&git.LogOptions{
		PathFilter: func(file string) bool {
			return (strings.HasSuffix(path, "/") && strings.HasPrefix(file, path)) || (path == file)
		},
		Order: git.LogOrderCommitterTime,
	})
	if err != nil {
		return "", errors.New("Failed to get latest commit hash :" + err.Error())
	}
	commit, err := commitIter.Next()

	if err != nil {
		return "", errors.New("Failed to get latest commit hash:" + err.Error())
	}
	return commit.Hash.String(), nil
}

// SetupGitOps clones and sets up the repo for gitops and returns the LatestCommit
func SetupGitOps(user GitUser, gitConfig GitConfig) (string, error) {
	err := gitConfig.setupGitRepo(user)
	if err != nil {
		return "", err
	}
	commitHash, err := gitConfig.GetLatestCommitHash()
	if err != nil {
		return "", err
	}
	return commitHash, err
}

// SyncDBToGit syncs the DB with the GitRepo for the project
func SyncDBToGit(ctx context.Context, config GitConfig) error {
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
	log.Print(latestCommit, " ", config.LatestCommit, "File Changes: ", files)
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
			err = deleteWorkflow(file, config)
			if err != nil {
				log.Print("Error while deleting workflow db entry : " + file + " | " + err.Error())
				continue
			}
			continue
		}
		// read changes [new additions/updates]
		data, err := ioutil.ReadFile(config.LocalPath + "/" + file)
		if err != nil {
			log.Print("Error reading data from git file : " + file + " | " + err.Error())
			continue
		}
		data, err = yaml.YAMLToJSON(data)
		if err != nil {
			log.Print("Error unmarshalling data from git file : " + file + " | " + err.Error())
			continue
		}
		wfID := gjson.Get(string(data), "metadata.labels.workflow_id").String()
		kind := strings.ToLower(gjson.Get(string(data), "kind").String())
		if kind != "cronworkflow" && kind != "workflow" && kind != "chaosengine" {
			continue
		}

		log.Print("WFID in changed File :", wfID)
		if wfID == "" {
			log.Print("New Workflow pushed to git : " + file)
			flag, err := createWorkflow(string(data), file, config)
			if err != nil {
				log.Print("Error while creating new workflow db entry : " + file + " | " + err.Error())
				continue
			}
			if flag {
				newWorkflows = true
			}
		} else {
			err = updateWorkflow(string(data), wfID, file, config)
			if err != nil {
				log.Print("Error while creating new workflow db entry : " + file + " | " + err.Error())
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
		err = dbOperationsGitOps.UpdateGitConfig(ctx, query, update)
	} else {
		err = dbOperationsGitOps.UpdateGitConfig(ctx, query, update)
	}

	if err != nil {
		return errors.New("Failed to update git config : " + err.Error())
	}
	return nil
}

// createWorkflow helps in creating a new workflow during the SyncDBToGit operation
func createWorkflow(data, file string, config GitConfig) (bool, error) {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)
	wfName := gjson.Get(data, "metadata.name").String()
	clusterID := gjson.Get(data, "metadata.labels.cluster_id").String()
	log.Print("Workflow Details | wf_name: ", wfName, " cluster_id: ", clusterID)
	if wfName == "" || clusterID == "" {
		return false, nil
	}
	if fileName != wfName {
		return false, errors.New("file name doesn't match workflow name")
	}
	workflow := model.ChaosWorkFlowInput{
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
	input, wfType, err := ops.ProcessWorkflow(&workflow)
	if err != nil {
		return false, err
	}
	err = ops.ProcessWorkflowCreation(input, wfType, store.Store)
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

// updateWorkflow helps in updating a existing workflow during the SyncDBToGit operation
func updateWorkflow(data, wfID, file string, config GitConfig) error {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)
	wfName := gjson.Get(data, "metadata.name").String()
	clusterID := gjson.Get(data, "metadata.labels.cluster_id").String()
	log.Print("Workflow Details | wf_name: ", wfName, " cluster_id: ", clusterID)
	if wfName == "" || clusterID == "" {
		log.Print("Cannot Update workflow missing workflow name or cluster id")
		return nil
	}

	if fileName != wfName {
		return errors.New("file name doesn't match workflow name")
	}

	workflow, err := dbOperationsWorkflow.GetWorkflows(bson.D{{"workflow_id", wfID}, {"project_id", config.ProjectID}, {"isRemoved", false}})
	if len(workflow) == 0 {
		return errors.New("No such workflow found : " + wfID)
	}

	if clusterID != workflow[0].ClusterID {
		log.Print("Cannot change cluster id for existing workflow")
		return nil
	}

	workflowData := model.ChaosWorkFlowInput{
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

	input, wfType, err := ops.ProcessWorkflow(&workflowData)
	if err != nil {
		return err
	}
	return ops.ProcessWorkflowUpdate(input, wfType, store.Store)

}

// deleteWorkflow helps in deleting a workflow from DB during the SyncDBToGit operation
func deleteWorkflow(file string, config GitConfig) error {
	_, fileName := filepath.Split(file)
	fileName = strings.Replace(fileName, ".yaml", "", -1)

	query := bson.D{{"workflow_name", fileName}, {"project_id", config.ProjectID}}
	workflow, err := dbOperationsWorkflow.GetWorkflow(query)
	if err != nil {
		return err
	}

	return ops.ProcessWorkflowDelete(query, workflow, store.Store)
}
