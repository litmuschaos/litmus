package usermanagement

import "github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"

// User contains the required fields to be stored in the database for a user
type User struct {
	ID              string  `bson:"_id"`
	Username        string  `bson:"username"`
	Email           *string `bson:"email"`
	IsEmailVerified *bool   `bson:"is_email_verified"`
	CompanyName     *string `bson:"company_name"`
	Name            *string `bson:"name"`
	Role            *string `bson:"role"`
	CreatedAt       string  `bson:"created_at"`
	UpdatedAt       string  `bson:"updated_at"`
	DeactivatedAt   string  `bson:"deactivated_at"`
}

// GetOutputUser takes a User struct as input and returns the graphQL model equivalent
func (user User) GetOutputUser() *model.User {

	return &model.User{
		ID:              user.ID,
		Username:        user.Username,
		Email:           user.Email,
		IsEmailVerified: user.IsEmailVerified,
		CompanyName:     user.CompanyName,
		Name:            user.Name,
		Role:            user.Role,
		CreatedAt:       user.CreatedAt,
		UpdatedAt:       user.UpdatedAt,
		DeactivatedAt:   user.DeactivatedAt,
	}

}
