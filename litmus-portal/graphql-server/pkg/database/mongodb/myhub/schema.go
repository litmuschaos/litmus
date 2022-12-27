package myhub

import "github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"

// MyHub ...
type MyHub struct {
	ID            string  `bson:"myhub_id"`
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

// GetOutputMyHub ...
func (myhub *MyHub) GetOutputMyHub() *model.ChaosHub {

	return &model.ChaosHub{
		ID:            myhub.ID,
		ProjectID:     myhub.ProjectID,
		RepoURL:       myhub.RepoURL,
		RepoBranch:    myhub.RepoBranch,
		HubName:       myhub.HubName,
		HubType:       model.HubType(myhub.HubType),
		IsPrivate:     myhub.IsPrivate,
		UserName:      myhub.UserName,
		Password:      myhub.Password,
		AuthType:      model.AuthType(myhub.AuthType),
		Token:         myhub.Token,
		IsRemoved:     myhub.IsRemoved,
		SSHPrivateKey: myhub.SSHPrivateKey,
		CreatedAt:     myhub.CreatedAt,
		UpdatedAt:     myhub.UpdatedAt,
		LastSyncedAt:  myhub.LastSyncedAt,
	}
}
