package gitops

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/protocol/packp/capability"
	"github.com/go-git/go-git/v5/plumbing/transport"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
	"github.com/go-git/go-git/v5/plumbing/transport/ssh"
	"github.com/golang-jwt/jwt/v4"
	log "github.com/sirupsen/logrus"
	ssh2 "golang.org/x/crypto/ssh"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/gitops"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
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
func GetGitOpsConfig(repoData gitops.GitConfigDB) GitConfig {
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

// setupGitRepo helps clones and sets up the repo for GitOps
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
		data, err := os.ReadFile(projectPath + "/.info")
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
	err = os.WriteFile(projectPath+"/.info", data, 0644)
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
		Progress:      nil,
		ReferenceName: plumbing.NewBranchReferenceName(c.Branch),
		SingleBranch:  true,
	})
}

// getAuthMethod returns the AuthMethod instance required for the current repo access [read/writes]
func (c GitConfig) getAuthMethod() (transport.AuthMethod, error) {

	// Azure DevOps requires the 'multi_ack' and 'multi_ack_detailed' capabilities,
	// which are not fully implemented in the go-git package. By default, these
	// capabilities are included in 'transport.UnsupportedCapabilities'.
	transport.UnsupportedCapabilities = []capability.Capability{
		capability.ThinPack,
	}

	switch c.AuthType {

	case model.AuthTypeToken:
		return &http.BasicAuth{
			Username: utils.Config.GitUsername, // must be a non-empty string or 'x-token-auth' for Bitbucket
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
		return nil, errors.New("no Matching Auth Type Found")
	}
}

// UnsafeGitPull executes git pull after a hard reset when uncommitted changes are present in repo. Not safe.
func (c GitConfig) UnsafeGitPull() error {
	cleanStatus, err := c.GitGetStatus()
	if err != nil {
		return err
	}
	log.WithFields(log.Fields{"cleanStatus": cleanStatus}).Info("executed GitGetStatus()... ")
	if !cleanStatus {
		log.Info("resetting Repo...: " + c.ProjectID)
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

// getRepositoryWorktreeReference returns the git.Repository and git.Worktree instances for the repo
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
	repo, workTree, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return err
	}
	auth, err := c.getAuthMethod()
	if err != nil {
		return err
	}
	err = repo.Fetch(&git.FetchOptions{
		Auth:       auth,
		RemoteName: c.RemoteName,
		Force:      true,
	})
	if err != nil && !errors.Is(err, git.NoErrAlreadyUpToDate) {
		return err
	}
	remoteRefName := plumbing.NewRemoteReferenceName(c.RemoteName, c.Branch)
	remoteRef, err := repo.Reference(remoteRefName, true)
	if err != nil {
		return err
	}
	err = workTree.Reset(&git.ResetOptions{
		Mode:   git.HardReset,
		Commit: remoteRef.Hash(),
	})
	if err != nil {
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
	log.Error(err)
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
		Progress:   nil,
	})
	if errors.Is(err, git.NoErrAlreadyUpToDate) {
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

	repo, _, err := c.getRepositoryWorktreeReference()
	if err != nil {
		return "", nil, err
	}

	prevKnownHash := c.LatestCommit

	headRef, err := repo.Head()
	if err != nil {
		return "", nil, err
	}

	visited := map[string]int{}

	commitIter, err := repo.Log(&git.LogOptions{
		From:  headRef.Hash(),
		Order: git.LogOrderCommitterTime,
	})
	if err != nil {
		return "", nil, fmt.Errorf("failed to get commit iterator: %w", err)
	}

	for {
		commit, err := commitIter.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", nil, err
		}

		// stop when we reach previously known commit
		if prevKnownHash != "" && commit.Hash.String() == prevKnownHash {
			break
		}

		// Initial commit
		if commit.NumParents() == 0 {
			files, err := commit.Files()
			if err != nil {
				return "", nil, err
			}
			err = files.ForEach(func(f *object.File) error {
				if strings.HasPrefix(f.Name, path) {
					visited[f.Name]++
				}
				return nil
			})
			if err != nil {
				return "", nil, err
			}
			continue
		}

		parent, err := commit.Parent(0)
		if err != nil {
			return "", nil, err
		}

		patch, err := parent.Patch(commit)
		if err != nil {
			return "", nil, err
		}

		for _, fp := range patch.FilePatches() {
			from, to := fp.Files()

			if from != nil {
				filePath := from.Path()
				if strings.HasPrefix(filePath, path) {
					visited[filePath]++
				}
			}

			if to != nil {
				filePath := to.Path()
				if strings.HasPrefix(filePath, path) {
					visited[filePath]++
				}
			}
		}
	}

	c.LatestCommit = headRef.Hash().String()
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
		return "", errors.New("failed to get latest commit hash :" + err.Error())
	}
	commit, err := commitIter.Next()

	if err != nil {
		return "", errors.New("failed to get latest commit hash:" + err.Error())
	}
	return commit.Hash.String(), nil
}

// SetupGitOps clones and sets up the repo for git ops and returns the LatestCommit
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
