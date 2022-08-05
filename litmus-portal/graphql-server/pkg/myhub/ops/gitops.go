package myhubOps

import (
	"fmt"
	"os"
	"strings"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/transport"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"github.com/go-git/go-git/v5/plumbing/transport/ssh"

	ssh2 "golang.org/x/crypto/ssh"

	log "github.com/sirupsen/logrus"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

// MyHubConfig is the config used for all git operations
type MyHubConfig struct {
	ProjectID     string
	RepositoryURL string
	RemoteName    string
	LocalCommit   string
	RemoteCommit  string
	HubName       string
	Branch        string
	IsPrivate     bool
	UserName      *string
	Password      *string
	AuthType      model.AuthType
	Token         *string
	SSHPrivateKey *string
}

const (
	defaultPath = "/tmp/version/"
)

// GetClonePath is used to construct path for Repository.
func GetClonePath(c MyHubConfig) string {
	RepoPath := defaultPath + c.ProjectID + "/" + c.HubName
	return RepoPath
}

// GitConfigConstruct is used for constructing the gitconfig
func GitConfigConstruct(repoData model.CloningInput) MyHubConfig {
	gitConfig := MyHubConfig{
		ProjectID:     repoData.ProjectID,
		HubName:       repoData.HubName,
		RepositoryURL: repoData.RepoURL,
		RemoteName:    "origin",
		Branch:        repoData.RepoBranch,
		IsPrivate:     repoData.IsPrivate,
		UserName:      repoData.UserName,
		Password:      repoData.Password,
		AuthType:      repoData.AuthType,
		Token:         repoData.Token,
		SSHPrivateKey: repoData.SSHPrivateKey,
	}

	return gitConfig
}

// GitClone Trigger is responsible for setting off the go routine for git-op
func GitClone(repoData model.CloningInput) error {
	gitConfig := GitConfigConstruct(repoData)
	if repoData.IsPrivate {
		_, err := gitConfig.getPrivateChaosChartRepo()
		if err != nil {
			fmt.Print("Error in cloning")
			return err
		}
	} else {
		_, err := gitConfig.getChaosChartRepo()
		if err != nil {
			fmt.Print("Error in cloning")
			return err
		}

	}
	// Successfully Cloned
	return nil
}

// getChaosChartVersion is responsible for plain cloning the repository
func (c MyHubConfig) getChaosChartRepo() (string, error) {
	ClonePath := GetClonePath(c)
	os.RemoveAll(ClonePath)
	_, err := git.PlainClone(ClonePath, false, &git.CloneOptions{
		URL: c.RepositoryURL, Progress: os.Stdout,
		ReferenceName: plumbing.NewBranchReferenceName(c.Branch),
	})
	if err != nil {
		_, err = git.PlainClone(ClonePath, false, &git.CloneOptions{
			URL: c.RepositoryURL, Progress: os.Stdout,
			ReferenceName: plumbing.NewTagReferenceName(c.Branch),
		})
		return c.Branch, err
	}
	return c.Branch, err
}

// getPrivateChaosChartVersion is responsible for plain cloning the private repository
func (c MyHubConfig) getPrivateChaosChartRepo() (string, error) {
	ClonePath := GetClonePath(c)
	os.RemoveAll(ClonePath)

	auth, err := c.generateAuthMethod()
	if err != nil {
		return "", err
	}

	_, err = git.PlainClone(ClonePath, false, &git.CloneOptions{
		Auth:          auth,
		URL:           c.RepositoryURL,
		Progress:      os.Stdout,
		ReferenceName: plumbing.NewBranchReferenceName(c.Branch),
	})
	if err != nil {
		_, err = git.PlainClone(ClonePath, false, &git.CloneOptions{
			Auth:          auth,
			URL:           c.RepositoryURL,
			Progress:      os.Stdout,
			ReferenceName: plumbing.NewTagReferenceName(c.Branch),
		})
		return c.Branch, err
	}
	return c.Branch, err
}

// GitSyncHandlerForProjects ...
func GitSyncHandlerForProjects(repoData model.CloningInput) error {
	gitConfig := GitConfigConstruct(repoData)
	if err := gitConfig.chaosChartSyncHandler(); err != nil {
		log.Error(err)
		return err
	}
	// Repository syncing completed

	return nil
}

// chaosChartSyncHandler is responsible for all the handler functions
func (c MyHubConfig) chaosChartSyncHandler() error {
	repositoryExists, err := c.isRepositoryExists()
	if err != nil {
		return fmt.Errorf("Error while checking repo exists, err: %s", err)
	}
	log.WithFields(log.Fields{"repositoryExists": repositoryExists}).Info("Executed isRepositoryExists()... ")

	if !repositoryExists {
		return GitClone(model.CloningInput{
			HubName:       c.HubName,
			ProjectID:     c.ProjectID,
			RepoURL:       c.RepositoryURL,
			RepoBranch:    c.Branch,
			IsPrivate:     c.IsPrivate,
			AuthType:      c.AuthType,
			Token:         c.Token,
			UserName:      c.UserName,
			Password:      c.Password,
			SSHPrivateKey: c.SSHPrivateKey,
		})
	}
	return c.GitPull()
}

// isRepositoryExists checks for the existence of this past existence of this repository
func (c MyHubConfig) isRepositoryExists() (bool, error) {
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

func (c MyHubConfig) setterRepositoryWorktreeReference() (*git.Repository, *git.Worktree, *plumbing.Reference, error) {
	RepoPath := GetClonePath(c)
	repository, err := git.PlainOpen(RepoPath)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("error in executing PlainOpen: %s", err)
	}
	workTree, err := repository.Worktree()
	if err != nil {
		return nil, nil, nil, fmt.Errorf("error in executing Worktree: %s", err)
	}
	plumbingRef, err := repository.Head()
	if err != nil {
		return nil, nil, nil, fmt.Errorf("error in executing Head: %s", err)
	}
	return repository, workTree, plumbingRef, nil
}

// GitPull updates the repository in provided Path
func (c MyHubConfig) GitPull() error {
	_, workTree, plumbingRef, err := c.setterRepositoryWorktreeReference()
	if err != nil {
		return err
	}
	var referenceName plumbing.ReferenceName
	referenceName = plumbing.NewBranchReferenceName(c.Branch)
	if !c.IsPrivate {
		err = workTree.Pull(&git.PullOptions{RemoteName: c.RemoteName, ReferenceName: referenceName})
		if err == git.NoErrAlreadyUpToDate {
			log.Print("Already up-to-date")
			return nil
		} else if err != nil {
			return err
		}
		c.LocalCommit = strings.Split(plumbingRef.String(), " ")[0]
		return nil
	}
	err = c.gitPullPrivateRepo()
	if err == git.NoErrAlreadyUpToDate {
		log.Print("Already up-to-date")
		return nil
	} else if err != nil {
		return err
	}
	return nil
}

// gitPullPrivateRepo updates the repository of private hubs
func (c MyHubConfig) gitPullPrivateRepo() error {
	_, workTree, _, err := c.setterRepositoryWorktreeReference()
	if err != nil {
		return err
	}
	var referenceName plumbing.ReferenceName
	referenceName = plumbing.NewBranchReferenceName(c.Branch)
	auth, err := c.generateAuthMethod()
	if err != nil {
		return nil
	}
	err = workTree.Pull(&git.PullOptions{RemoteName: c.RemoteName, ReferenceName: referenceName, Auth: auth})
	if err != nil {
		return err
	}
	return nil
}

// generateAuthMethod creates AuthMethod for private repos
func (c MyHubConfig) generateAuthMethod() (transport.AuthMethod, error) {
	var auth transport.AuthMethod
	if c.AuthType == model.AuthTypeToken {
		auth = &http.BasicAuth{
			Username: "litmus", // this can be anything except an empty string
			Password: *c.Token,
		}
	} else if c.AuthType == model.AuthTypeBasic {
		auth = &http.BasicAuth{
			Username: *c.UserName,
			Password: *c.Password,
		}
	} else if c.AuthType == model.AuthTypeSSH {
		publicKey, err := ssh.NewPublicKeys("git", []byte(*c.SSHPrivateKey), "")
		if err != nil {
			return nil, err
		}

		auth = publicKey
		auth.(*ssh.PublicKeys).HostKeyCallback = ssh2.InsecureIgnoreHostKey()
	}
	return auth, nil
}
