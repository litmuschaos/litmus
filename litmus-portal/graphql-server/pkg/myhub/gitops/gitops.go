package gitops

import (
	"fmt"
	"os"
	"strings"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	log "github.com/sirupsen/logrus"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing"
)

//GitConfig ...
type GitConfig struct {
	ProjectID     string
	RepositoryURL string
	RemoteName    string
	LocalCommit   string
	RemoteCommit  string
	HubName       string
	Branch        string
}

var (
	repository  *git.Repository
	workTree    *git.Worktree
	plumbingRef *plumbing.Reference
	status      *git.Status
	err         error
)

const (
	defaultPath = "/tmp/version/"
)

//GetClonePath is used to construct path for Repository.
func GetClonePath(c GitConfig) string {
	RepoPath := defaultPath + c.ProjectID + "/" + c.HubName
	return RepoPath
}

//GitConfigConstruct is used for constructing the gitconfig
func GitConfigConstruct(repoData model.CloningInput) GitConfig {
	gitConfig := GitConfig{
		ProjectID:     repoData.ProjectID,
		HubName:       repoData.HubName,
		RepositoryURL: repoData.RepoURL,
		RemoteName:    "origin",
		Branch:        repoData.RepoBranch,
	}

	return gitConfig
}

//GitClone Trigger is reponsible for setting off the go routine for git-op
func GitClone(repoData model.CloningInput) error {
	gitConfig := GitConfigConstruct(repoData)
	_, err := gitConfig.getChaosChartRepo()
	if err != nil {
		fmt.Print("Error in cloning")
		return err
	}
	//Successfully Cloned
	return nil
}

//GitSyncHandlerForProjects ...
func GitSyncHandlerForProjects(repoData model.CloningInput) error {

	gitConfig := GitConfigConstruct(repoData)
	if err := gitConfig.chaosChartSyncHandler(); err != nil {
		log.Error(err)
		return err
	}
	//Repository syncing completed

	return nil
}

//getChaosChartVersion is responsible for plain cloning the repository
func (c GitConfig) getChaosChartRepo() (string, error) {
	ClonePath := GetClonePath(c)
	os.RemoveAll(ClonePath)
	_, err := git.PlainClone(ClonePath, false, &git.CloneOptions{
		URL: c.RepositoryURL, Progress: os.Stdout,
		ReferenceName: plumbing.NewBranchReferenceName(c.Branch),
	})
	return c.Branch, err
}

// chaosChartSyncHandler is responsible for all the handler functions
func (c GitConfig) chaosChartSyncHandler() error {
	repositoryExists, err := c.isRepositoryExists()
	if err != nil {
		return fmt.Errorf("Error while checking repo exists, err: %s", err)
	}
	log.WithFields(log.Fields{"repositoryExists": repositoryExists}).Info("Executed isRepositoryExists()... ")
	if !repositoryExists {
		return c.HandlerForNonExistingRepository()
	}
	return c.HandlerForExistingRepository()
}

// isRepositoryExists checks for the existence of this past existence of this repository
func (c GitConfig) isRepositoryExists() (bool, error) {
	RepoPath := GetClonePath(c)
	_, err := os.Stat(RepoPath)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// HandlerForNonExistingRepository calls function GitPlainClone, which is called only when the repository exists
func (c GitConfig) HandlerForNonExistingRepository() error {
	RepoPath := GetClonePath(c)
	var referenceName plumbing.ReferenceName
	referenceName = plumbing.NewBranchReferenceName(c.Branch)
	_, err := git.PlainClone(RepoPath, false, &git.CloneOptions{
		URL: c.RepositoryURL, Progress: os.Stdout,
		ReferenceName: referenceName,
	})
	if err != nil {
		return fmt.Errorf("unable to clone '%s' reference of chaos-chart, err: %+v", c.Branch, err)
	}
	return nil
}

// HandlerForExistingRepository relative functions if the isRepositoryExists fails
func (c GitConfig) HandlerForExistingRepository() error {
	dirtyStatus, err := c.GitGetStatus()
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"DirtyStatus": dirtyStatus}).Info("Executed GitGetStatus()... ")
	if dirtyStatus {
		return c.HandlerForDirtyStatus()
	}
	return c.HandlerForCleanStatus()
}

// GitGetStatus excutes "git get status --porcelain" for the provided Repository Path,
// returns false if the repository is clean
// and true if the repository is dirtygitConfig
func (c GitConfig) GitGetStatus() (bool, error) {
	err := c.setterRepositoryWorktreeReference()
	if err != nil {
		return true, err
	}
	// git status --porcelain
	len, _ := getListofFilesChanged()
	return !(len == 0), nil
}
func (c GitConfig) setterRepositoryWorktreeReference() error {
	RepoPath := GetClonePath(c)
	if repository, err = git.PlainOpen(RepoPath); err != nil {
		return fmt.Errorf("error in executing PlainOpen: %s", err)
	}
	if workTree, err = repository.Worktree(); err != nil {
		return fmt.Errorf("error in executing Worktree: %s", err)
	}
	plumbingRef, err = repository.Head()
	if err != nil {
		return fmt.Errorf("error in executing Head: %s", err)
	}
	return nil
}

// HandlerForDirtyStatus calls relative functions if the GitGetStatus gives a clean status as a result
func (c GitConfig) HandlerForDirtyStatus() error {
	if err := c.GitHardReset(); err != nil {
		return err
	}
	MatchValue, err := c.CompareLocalandRemoteCommit()
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"MatchValue": MatchValue}).Info("Executed CompareLocalandRemoteCommit()... ")
	if !MatchValue {
		return c.HandlerForMismatchCommits()
	}
	return nil
}
func getListofFilesChanged() (int, error) {
	status, err := workTree.Status()
	if err != nil {
		return 0, fmt.Errorf("error in executing Status: %s", err)
	}
	var listOfFilesChanged []string
	for file := range status {
		listOfFilesChanged = append(listOfFilesChanged, file)
	}
	return len(listOfFilesChanged), nil
}

// GitHardReset executes "git reset --hard HEAD" in provided Repository Path
func (c GitConfig) GitHardReset() error {
	RepoPath := GetClonePath(c)
	repository, err := git.PlainOpen(RepoPath)
	if err != nil {
		return fmt.Errorf("error in executing PlainOpen: %s", err)
	}
	workTree, err := repository.Worktree()
	if err != nil {
		return fmt.Errorf("error in executing Worktree: %s", err)
	}
	if workTree.Reset(&git.ResetOptions{Mode: git.HardReset}) != nil {
		return fmt.Errorf("error in executing Reset: %s", err)
	}
	return nil
}

// CompareLocalandRemoteCommit compares local and remote latest commit
func (c GitConfig) CompareLocalandRemoteCommit() (bool, error) {
	RepoPath := GetClonePath(c)
	repository, err := git.PlainOpen(RepoPath)
	if err != nil {
		return false, fmt.Errorf("error in executing PlainOpen: %s", err)
	}
	hash, err := repository.ResolveRevision(plumbing.Revision(c.Branch))
	if err != nil {
		return false, fmt.Errorf("error in executing ResolveRevision: %s", err)
	}
	c.RemoteCommit = hash.String()
	return c.RemoteCommit == c.LocalCommit, nil
}

// GitPull updates the repository in provided Path
func (c GitConfig) GitPull() error {
	err := c.setterRepositoryWorktreeReference()
	if err != nil {
		return err
	}
	var referenceName plumbing.ReferenceName
	referenceName = plumbing.NewBranchReferenceName(c.Branch)
	err = workTree.Pull(&git.PullOptions{RemoteName: c.RemoteName, ReferenceName: referenceName})
	c.LocalCommit = strings.Split(plumbingRef.String(), " ")[0]
	return nil
}

// HandlerForCleanStatus calls relative functions if the GitGetStatus gives a clean status as a result
func (c GitConfig) HandlerForCleanStatus() error {
	MatchValue, err := c.CompareLocalandRemoteCommit()
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"MatchValue": MatchValue}).Info("Executed CompareLocalandRemoteCommit()... ")
	if !MatchValue {
		err := c.GitPull()
		if err != nil {
			return err
		}
	}
	return nil
}

// HandlerForMismatchCommits calls relative functions if the Local and Remote Commits do not match
func (c GitConfig) HandlerForMismatchCommits() error {
	err := c.GitPull()
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"execution": "complete"}).Info("Executed GitPull()... ")
	return nil
}
