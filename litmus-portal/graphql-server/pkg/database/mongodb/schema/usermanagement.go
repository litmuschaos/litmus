package schema

import "github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"

//User ...
type User struct {
	ID              string   `bson:"_id"`
	Username        string   `bson:"username"`
	Email           *string  `bson:"email"`
	IsEmailVerified *bool    `bson:"is_email_verified"`
	MyHub           []*MyHub `bson:"myhub"`
	CompanyName     *string  `bson:"company_name"`
	Name            *string  `bson:"name"`
	Role            *string  `bson:"role"`
	State           *string  `bson:"state"`
	CreatedAt       string   `bson:"created_at"`
	UpdatedAt       string   `bson:"updated_at"`
	RemovedAt       string   `bson:"removed_at"`
}

//GetOutputUser ...
func (user User) GetOutputUser() *model.User {

	return &model.User{
		ID:              user.ID,
		Username:        user.Username,
		Email:           user.Email,
		IsEmailVerified: user.IsEmailVerified,
		MyHub:           user.GetOuputMyHubs(),
		CompanyName:     user.CompanyName,
		Name:            user.Name,
		Role:            user.Role,
		State:           user.State,
		CreatedAt:       user.CreatedAt,
		UpdatedAt:       user.UpdatedAt,
		RemovedAt:       user.RemovedAt,
	}

}

//MyHub ...
type MyHub struct {
	ID          string `bson:"myhub_id"`
	RepoURL     string `bson:"repo_url"`
	RepoBranch  string `bson:"repo_branch"`
	IsConfirmed bool   `bson:"is_confirmed"`
	HubName     string `bson:"hub_name"`
}

//GetOuputMyHubs ...
func (user *User) GetOuputMyHubs() []*model.MyHub {

	outputMyHub := []*model.MyHub{}

	for _, myhub := range user.MyHub {
		outputMyHub = append(outputMyHub, myhub.GetOutputMyHub())
	}

	return outputMyHub
}

//GetOutputMyHub ...
func (myhub *MyHub) GetOutputMyHub() *model.MyHub {

	return &model.MyHub{
		ID:          myhub.ID,
		RepoURL:     myhub.RepoURL,
		RepoBranch:  myhub.RepoBranch,
		IsConfirmed: myhub.IsConfirmed,
		HubName:     myhub.HubName,
	}
}
