package schema

import "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"

//User ...
type User struct {
	ID              string  `bson:"_id"`
	Username        string  `bson:"username"`
	Email           *string `bson:"email"`
	IsEmailVerified *bool   `bson:"is_email_verified"`
	CompanyName     *string `bson:"company_name"`
	Name            *string `bson:"name"`
	Role            *string `bson:"role"`
	State           *string `bson:"state"`
	CreatedAt       string  `bson:"created_at"`
	UpdatedAt       string  `bson:"updated_at"`
	RemovedAt       string  `bson:"removed_at"`
}

//GetOutputUser ...
func (user User) GetOutputUser() *model.User {

	return &model.User{
		ID:              user.ID,
		Username:        user.Username,
		Email:           user.Email,
		IsEmailVerified: user.IsEmailVerified,
		CompanyName:     user.CompanyName,
		Name:            user.Name,
		Role:            user.Role,
		State:           user.State,
		CreatedAt:       user.CreatedAt,
		UpdatedAt:       user.UpdatedAt,
		RemovedAt:       user.RemovedAt,
	}

}
