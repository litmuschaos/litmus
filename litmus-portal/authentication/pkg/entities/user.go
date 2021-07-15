package entities

import (
	"litmus/litmus-portal/authentication/pkg/utils"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/sirupsen/logrus"
)

//User contains the user information
type User struct {
	ID            string  `bson:"_id,omitempty" json:"_id"`
	UserName      string  `bson:"username,omitempty" json:"username"`
	Password      string  `bson:"password,omitempty" json:"password,omitempty"`
	Email         string  `bson:"email,omitempty" json:"email,omitempty"`
	Name          string  `bson:"name,omitempty" json:"name,omitempty"`
	Role          Role    `bson:"role,omitempty" json:"role"`
	LoggedIn      bool    `bson:"logged_in,omitempty" json:"logged_in,omitempty"`
	CreatedAt     *string `bson:"created_at,omitempty" json:"created_at,omitempty"`
	UpdatedAt     *string `bson:"updated_at,omitempty" json:"updated_at,omitempty"`
	DeactivatedAt *string `bson:"deactivated_at,omitempty" json:"deactivated_at,omitempty"`
}

// UserPassword defines structure for password related requests
type UserPassword struct {
	Username    string `json:"username,omitempty"`
	OldPassword string `json:"old_password,omitempty"`
	NewPassword string `json:"new_password,omitempty"`
}

// UpdateUserState defines structure to deactivate or reactivate user
type UpdateUserState struct {
	Username     string `json:"username"`
	IsDeactivate bool   `json:"is_deactivate"`
}

// Role states the role of the user in the portal
type Role string

const (
	// RoleAdmin gives the admin permissions to a user
	RoleAdmin Role = "admin"

	//RoleUser gives the normal user permissions to a user
	RoleUser Role = "user"
)

// SanitizedUser returns the user object without sensitive information
func (user *User) SanitizedUser() *User {
	user.Password = ""
	return user
}

// GetSignedJWT generates the JWT Token for the user object
func (user *User) GetSignedJWT() (string, error) {

	token := jwt.New(jwt.SigningMethodHS512)
	claims := token.Claims.(jwt.MapClaims)
	claims["uid"] = user.ID
	claims["role"] = user.Role
	claims["username"] = user.UserName
	claims["exp"] = time.Now().Add(time.Minute * time.Duration(utils.JWTExpiryDuration)).Unix()

	tokenString, err := token.SignedString([]byte(utils.JwtSecret))
	if err != nil {
		logrus.Info(err)
		return "", err
	}

	return tokenString, nil
}
