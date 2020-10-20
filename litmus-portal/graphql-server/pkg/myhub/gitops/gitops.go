package gitops

import (
	"fmt"
	"os"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
	"gopkg.in/src-d/go-git.v4"
	"gopkg.in/src-d/go-git.v4/plumbing"
)

const (
	timeInterval  = 1 * time.Hour
	defaultBranch = "master"
)

//GitConfig ...
type GitConfig struct {
	UserName       string
	RepositoryName string
	RepositoryURL  string
	RemoteName     string
	LocalCommit    string
	RemoteCommit   string
}

var (
	r      *git.Repository
	w      *git.Worktree
	t      *plumbing.Reference
	status *git.Status
	err    error
)
var (
	UserName   = "amit_das"
	RepoOwner  = "Jonsy13"
	RepoName   = "litmus"
	RepoBranch = "master"
)

// Trigger is reposible for setting off the go routine for git-op
func gitClone() {
	gitConfig := GitConfig{
		UserName:       UserName,
		RepositoryName: RepoName,
		RepositoryURL:  "https://github.com/" + RepoOwner + "/" + RepoName,
		RemoteName:     "origin",
	}
	for {
		_, err := gitConfig.getChaosChartRepo()
		if err != nil {
			fmt.Print("Error in cloning")
		}
		if err := gitConfig.chaosChartSyncHandler(RepoBranch); err != nil {
			log.Error(err)
		}
		log.Infof("********* Repository syncing completed for version: '%s' *********", RepoBranch)
		time.Sleep(timeInterval)
	}
}

//getChaosChartVersion is responsible for plain cloning the repository
func (c GitConfig) getChaosChartRepo() (string, error) {
	if _, err := os.Stat("/tmp/version/" + c.UserName + "/" + c.RepositoryName); err == nil {
		os.RemoveAll("/tmp/version/" + c.UserName + "/" + c.RepositoryName)
	}
	_, err := git.PlainClone("/tmp/version/"+c.UserName+"/"+c.RepositoryName+"/"+RepoBranch, false, &git.CloneOptions{
		URL: c.RepositoryURL, Progress: os.Stdout,
		ReferenceName: plumbing.NewBranchReferenceName(RepoBranch),
	})
	return RepoBranch, err
}

// chaosChartSyncHandler is responsible for all the handler functions
func (c GitConfig) chaosChartSyncHandler(RepoBranch string) error {
	repositoryExists, err := c.isRepositoryExists(RepoBranch)
	if err != nil {
		return fmt.Errorf("Error while checking repo exists, err: %s", err)
	}
	log.WithFields(log.Fields{"repositoryExists": repositoryExists}).Info("Executed isRepositoryExists()... ")
	if !repositoryExists {
		return c.HandlerForNonExistingRepository(RepoBranch)
	}
	return c.HandlerForExistingRepository(RepoBranch)
}

// isRepositoryExists checks for the existence of this past existence of this repository
func (c GitConfig) isRepositoryExists(RepoBranch string) (bool, error) {
	_, err := os.Stat("/tmp/version/" + c.UserName + "/" + c.RepositoryName + "/" + RepoBranch)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// HandlerForNonExistingRepository calls function GitPlainClone, which is called only when the repository exists
func (c GitConfig) HandlerForNonExistingRepository(RepoBranch string) error {
	var referenceName plumbing.ReferenceName
	if RepoBranch == defaultBranch {
		referenceName = plumbing.NewBranchReferenceName(RepoBranch)
	} else {
		referenceName = plumbing.NewTagReferenceName(RepoBranch)
	}
	_, err := git.PlainClone("/tmp/version/"+c.UserName+"/"+c.RepositoryName+"/"+RepoBranch, false, &git.CloneOptions{
		URL: c.RepositoryURL, Progress: os.Stdout,
		ReferenceName: referenceName,
	})
	if err != nil {
		return fmt.Errorf("unable to clone '%s' reference of chaos-chart, err: %+v", RepoBranch, err)
	}
	return nil
}

// HandlerForExistingRepository relative functions if the isRepositoryExists fails
func (c GitConfig) HandlerForExistingRepository(RepoBranch string) error {
	dirtyStatus, err := c.GitGetStatus(RepoBranch)
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"DirtyStatus": dirtyStatus}).Info("Executed GitGetStatus()... ")
	if dirtyStatus {
		return c.HandlerForDirtyStatus(RepoBranch)
	}
	return c.HandlerForCleanStatus(RepoBranch)
}

// GitGetStatus excutes "git get status --porcelain" for the provided Repository Path,
// returns false if the repository is clean
// and true if the repository is dirtygitConfig
func (c GitConfig) GitGetStatus(RepoBranch string) (bool, error) {
	log.Info("executing GitGetStatus() ...")
	err := c.setterRepositoryWorktreeReference(RepoBranch)
	if err != nil {
		return true, err
	}
	log.Info("git status --porcelain")
	len, _ := getListofFilesChanged()
	return !(len == 0), nil
}
func (c GitConfig) setterRepositoryWorktreeReference(RepoBranch string) error {
	if r, err = git.PlainOpen("/tmp/version/" + c.UserName + "/" + c.RepositoryName + "/" + RepoBranch); err != nil {
		return fmt.Errorf("error in executing PlainOpen: %s", err)
	}
	if w, err = r.Worktree(); err != nil {
		return fmt.Errorf("error in executing Worktree: %s", err)
	}
	t, err = r.Head()
	if err != nil {
		return fmt.Errorf("error in executing Head: %s", err)
	}
	return nil
}

// HandlerForDirtyStatus calls relative functions if the GitGetStatus gives a clean status as a result
func (c GitConfig) HandlerForDirtyStatus(RepoBranch string) error {
	if err := c.GitHardReset(RepoBranch); err != nil {
		return err
	}
	MatchValue, err := c.CompareLocalandRemoteCommit(RepoBranch)
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"MatchValue": MatchValue}).Info("Executed CompareLocalandRemoteCommit()... ")
	if !MatchValue {
		return c.HandlerForMismatchCommits(RepoBranch)
	}
	return nil
}
func getListofFilesChanged() (int, error) {
	status, err := w.Status()
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
func (c GitConfig) GitHardReset(RepoBranch string) error {
	r, err := git.PlainOpen("/tmp/version/" + c.UserName + "/" + c.RepositoryName + "/" + RepoBranch)
	if err != nil {
		return fmt.Errorf("error in executing PlainOpen: %s", err)
	}
	w, err := r.Worktree()
	if err != nil {
		return fmt.Errorf("error in executing Worktree: %s", err)
	}
	if w.Reset(&git.ResetOptions{Mode: git.HardReset}) != nil {
		return fmt.Errorf("error in executing Reset: %s", err)
	}
	return nil
}

// CompareLocalandRemoteCommit compares local and remote latest commit
func (c GitConfig) CompareLocalandRemoteCommit(RepoBranch string) (bool, error) {
	r, err := git.PlainOpen("/tmp/version/" + c.UserName + "/" + c.RepositoryName + "/" + RepoBranch)
	if err != nil {
		return false, fmt.Errorf("error in executing PlainOpen: %s", err)
	}
	h, err := r.ResolveRevision(plumbing.Revision(RepoBranch))
	if err != nil {
		return false, fmt.Errorf("error in executing ResolveRevision: %s", err)
	}
	c.RemoteCommit = h.String()
	log.Infof("LocalCommit: '%s',RemoteCommit: '%s'", c.LocalCommit, c.RemoteCommit)
	return c.RemoteCommit == c.LocalCommit, nil
}

// GitPull updates the repository in provided Path
func (c GitConfig) GitPull(RepoBranch string) error {
	log.Info("executing GitPull() ...")
	err := c.setterRepositoryWorktreeReference(RepoBranch)
	if err != nil {
		return err
	}
	var referenceName plumbing.ReferenceName
	if RepoBranch == defaultBranch {
		referenceName = plumbing.NewBranchReferenceName(RepoBranch)
	} else {
		referenceName = plumbing.NewTagReferenceName(RepoBranch)
	}
	log.Info("git pull origin")
	err = w.Pull(&git.PullOptions{RemoteName: c.RemoteName, ReferenceName: referenceName})
	log.Infof("Executed git pull origin, Status: %s", err)
	c.LocalCommit = strings.Split(t.String(), " ")[0]
	return nil
}

// HandlerForCleanStatus calls relative functions if the GitGetStatus gives a clean status as a result
func (c GitConfig) HandlerForCleanStatus(version string) error {
	MatchValue, err := c.CompareLocalandRemoteCommit(RepoBranch)
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"MatchValue": MatchValue}).Info("Executed CompareLocalandRemoteCommit()... ")
	if !MatchValue {
		err := c.GitPull(RepoBranch)
		if err != nil {
			return err
		}
	}
	return nil
}

// HandlerForMismatchCommits calls relative functions if the Local and Remote Commits do not match
func (c GitConfig) HandlerForMismatchCommits(RepoBranch string) error {
	err := c.GitPull(RepoBranch)
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"execution": "complete"}).Info("Executed GitPull()... ")
	return nil
}
