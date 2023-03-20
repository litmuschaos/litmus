package chaoshub

import "github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"

// ChaosHub ...
type ChaosHub struct {
	ID            string  `bson:"chaoshub_id"`
	ProjectID     string  `bson:"project_id"`
	RepoURL       string  `bson:"repo_url"`
	RepoBranch    string  `bson:"repo_branch"`
	HubName       string  `bson:"hub_name"`
	IsPrivate     bool    `bson:"IsPrivate"`
	AuthType      string  `bson:"AuthType"`
	HubType       string  `bson:"hub_type"`
	Token         *string `bson:"Token"`
	UserName      *string `bson:"UserName"`
	Password      *string `bson:"Password"`
	SSHPrivateKey *string `bson:"SSHPrivateKey"`
	SSHPublicKey  *string `bson:"SSHPublicKey"`
	IsRemoved     bool    `bson:"IsRemoved"`
	CreatedAt     string  `bson:"created_at"`
	UpdatedAt     string  `bson:"updated_at"`
	LastSyncedAt  string  `bson:"last_synced_at"`
}

// GetOutputChaosHub ...
func (c *ChaosHub) GetOutputChaosHub() *model.ChaosHub {

	return &model.ChaosHub{
		ID:            c.ID,
		ProjectID:     c.ProjectID,
		RepoURL:       c.RepoURL,
		RepoBranch:    c.RepoBranch,
		HubName:       c.HubName,
		HubType:       model.HubType(c.HubType),
		IsPrivate:     c.IsPrivate,
		UserName:      c.UserName,
		Password:      c.Password,
		AuthType:      model.AuthType(c.AuthType),
		Token:         c.Token,
		IsRemoved:     c.IsRemoved,
		SSHPrivateKey: c.SSHPrivateKey,
		CreatedAt:     c.CreatedAt,
		UpdatedAt:     c.UpdatedAt,
		LastSyncedAt:  c.LastSyncedAt,
	}
}
