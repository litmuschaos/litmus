package entities

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"os"
	"time"
)

//User contains the user information
type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserName  string             `bson:"username,omitempty"`
	Password  string             `bson:"password,omitempty"`
	Email     string             `bson:"email,omitempty"`
	Name      string             `bson:"name,omitempty"`
	Role      Role               `bson:"role"`
	LoggedIn  bool               `bson:"logged_in,omitempty"`
	CreatedAt *time.Time         `bson:"created_at,omitempty"`
	UpdatedAt *time.Time         `bson:"updated_at,omitempty"`
	RemovedAt *time.Time         `bson:"removed_at,omitempty"`
}

//Role states the role of the user in the portal
type Role string

const (
	//RoleAdmin gives the admin permissions to a user
	RoleAdmin Role = "admin"

	//RoleUser gives the normal user permissions to a user
	RoleUser Role = "user"
)

func (user *User) sanitizedUser() *User {
	user.Password = ""
	return user
}

func (user *User) GetSignedJWT() (string, error) {

	token := jwt.New(jwt.SigningMethodHS512)
	claims := token.Claims.(jwt.MapClaims)
	claims["uid"] = user.ID.Hex()
	claims["role"] = user.Role
	claims["username"] = user.Name
	claims["exp"] = time.Now().Add(time.Minute * 300).Unix()

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	return tokenString, nil
}
