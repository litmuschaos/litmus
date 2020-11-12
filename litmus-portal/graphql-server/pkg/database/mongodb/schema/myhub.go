package schema

import "github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"

//MyHub ...
type MyHub struct {
	ID         string `bson:"myhub_id"`
	ProjectID  string `bson:"project_id"`
	RepoURL    string `bson:"repo_url"`
	RepoBranch string `bson:"repo_branch"`
	HubName    string `bson:"hub_name"`
	CreatedAt  string `bson:"created_at"`
	UpdatedAt  string `bson:"updated_at"`
}

//GetOutputMyHub ...
func (myhub *MyHub) GetOutputMyHub() *model.MyHub {

	return &model.MyHub{
		ID:         myhub.ID,
		ProjectID:  myhub.ProjectID,
		RepoURL:    myhub.RepoURL,
		RepoBranch: myhub.RepoBranch,
		HubName:    myhub.HubName,
		CreatedAt:  myhub.CreatedAt,
		UpdatedAt:  myhub.UpdatedAt,
	}
}
