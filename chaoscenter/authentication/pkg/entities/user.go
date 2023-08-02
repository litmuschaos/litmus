package entities

import (
	"net/mail"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"

	"github.com/golang-jwt/jwt"
	"github.com/sirupsen/logrus"
)

// Role states the role of the user in the portal
type Role string

const (
	// RoleAdmin gives the admin permissions to a user
	RoleAdmin Role = "admin"

	//RoleUser gives the normal user permissions to a user
	RoleUser Role = "user"
)

// User contains the user information
type User struct {
	Audit         `bson:",inline"`
	ID            string `bson:"_id,omitempty" json:"userID"`
	Username      string `bson:"username,omitempty" json:"username"`
	Password      string `bson:"password,omitempty" json:"password,omitempty"`
	Email         string `bson:"email,omitempty" json:"email,omitempty"`
	Name          string `bson:"name,omitempty" json:"name,omitempty"`
	Role          Role   `bson:"role,omitempty" json:"role"`
	DeactivatedAt *int64 `bson:"deactivated_at,omitempty" json:"deactivatedAt,omitempty"`
}

// UserDetails is used to update user's personal details
type UserDetails struct {
	ID       string `bson:"id,omitempty"`
	Email    string `bson:"email,omitempty" json:"email,omitempty"`
	Name     string `bson:"name,omitempty" json:"name,omitempty"`
	Password string `bson:"password,omitempty" json:"password,omitempty"`
}

// UserPassword defines structure for password related requests
type UserPassword struct {
	Username    string `json:"username,omitempty"`
	OldPassword string `json:"oldPassword,omitempty"`
	NewPassword string `json:"newPassword,omitempty"`
}

// UpdateUserState defines structure to deactivate or reactivate user
type UpdateUserState struct {
	Username     string `json:"username"`
	IsDeactivate *bool  `json:"isDeactivate"`
}

// APIStatus defines structure for APIroute status
type APIStatus struct {
	Status string `json:"status"`
}

type UserWithProject struct {
	Audit    `bson:",inline"`
	ID       string     `bson:"_id" json:"id"`
	Username string     `bson:"username" json:"username"`
	Email    string     `bson:"email" json:"email"`
	Name     string     `bson:"name" json:"name"`
	Projects []*Project `bson:"projects" json:"projects"`
}

func (user User) GetUserWithProject() *UserWithProject {

	return &UserWithProject{
		ID:       user.ID,
		Username: user.Username,
		Name:     user.Name,
		Audit: Audit{
			IsRemoved: user.IsRemoved,
			CreatedAt: user.CreatedAt,
			CreatedBy: user.UpdatedBy,
			UpdatedAt: user.UpdatedAt,
			UpdatedBy: user.UpdatedBy,
		},
		Email: user.Email,
	}
}

// SanitizedUser returns the user object without sensitive information
func (user *User) SanitizedUser() *User {
	user.Password = ""
	return user
}

// IsEmailValid validates the email
func (user *User) IsEmailValid(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

// GetSignedJWT generates the JWT Token for the user object
func (user *User) GetSignedJWT() (string, error) {

	token := jwt.New(jwt.SigningMethodHS512)
	claims := token.Claims.(jwt.MapClaims)
	claims["uid"] = user.ID
	claims["role"] = user.Role
	claims["username"] = user.Username
	claims["exp"] = time.Now().Add(time.Minute * time.Duration(utils.JWTExpiryDuration)).Unix()

	tokenString, err := token.SignedString([]byte(utils.JwtSecret))
	if err != nil {
		logrus.Info(err)
		return "", err
	}

	return tokenString, nil
}
