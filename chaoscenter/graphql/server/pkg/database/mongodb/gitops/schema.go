package gitops

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

// GitConfigDB ...
type GitConfigDB struct {
	ProjectID     string         `bson:"project_id"`
	RepositoryURL string         `bson:"repo_url"`
	Branch        string         `bson:"branch"`
	LatestCommit  string         `bson:"latest_commit"`
	AuthType      model.AuthType `bson:"auth_type"`
	UserName      *string        `bson:"username"`
	Password      *string        `bson:"password"`
	Token         *string        `bson:"token"`
	SSHPrivateKey *string        `bson:"ssh_private_key"`
}

// GetGitConfigDB ...
func GetGitConfigDB(projectID string, config model.GitConfig) GitConfigDB {
	return GitConfigDB{
		ProjectID:     projectID,
		RepositoryURL: config.RepoURL,
		Branch:        config.Branch,
		LatestCommit:  "",
		AuthType:      config.AuthType,
		UserName:      config.UserName,
		Password:      config.Password,
		Token:         config.Token,
		SSHPrivateKey: config.SSHPrivateKey,
	}
}
