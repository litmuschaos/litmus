package entities

import (
	"litmus/litmus-portal/authentication/pkg/utils"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

//User contains the user information
type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	UserName  string             `bson:"username,omitempty" json:"username,omitempty"`
	Password  string             `bson:"password,omitempty" json:"password,omitempty"`
	Email     string             `bson:"email,omitempty" json:"email,omitempty"`
	Name      string             `bson:"name,omitempty" json:"name,omitempty"`
	Role      Role               `bson:"role,omitempty" json:"role,omitempty"`
	LoggedIn  bool               `bson:"logged_in,omitempty" json:"logged_in,omitempty"`
	CreatedAt *time.Time         `bson:"created_at,omitempty" json:"created_at,omitempty"`
	UpdatedAt *time.Time         `bson:"updated_at,omitempty" json:"updated_at,omitempty"`
	RemovedAt *time.Time         `bson:"removed_at,omitempty" json:"removed_at,omitempty"`
}

//UserPassword defines structure for password related requests
type UserPassword struct {
	Username    string `json:"username,omitempty"`
	OldPassword string `json:"old_password,omitempty"`
	NewPassword string `json:"new_password,omitempty"`
}

//Role states the role of the user in the portal
type Role string

const (
	//RoleAdmin gives the admin permissions to a user
	RoleAdmin Role = "admin"

	//RoleUser gives the normal user permissions to a user
	RoleUser Role = "user"
)

//SanitizedUser returns the user object without sensitive information
func (user *User) SanitizedUser() *User {
	user.Password = ""
	return user
}

//GetSignedJWT generates the JWT Token for the user object
func (user *User) GetSignedJWT() (string, error) {

	token := jwt.New(jwt.SigningMethodHS512)
	claims := token.Claims.(jwt.MapClaims)
	claims["uid"] = user.ID.Hex()
	claims["role"] = user.Role
	claims["username"] = user.UserName
	claims["exp"] = time.Now().Add(time.Minute * 300).Unix()

	tokenString, err := token.SignedString([]byte(utils.JwtSecret))
	if err != nil {
		logrus.Info(err)
		return "", err
	}

	return tokenString, nil
}
