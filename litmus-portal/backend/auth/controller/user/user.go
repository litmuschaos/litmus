package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/golang/glog"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/models"
)

// User is a type to be accepted as input
type User models.UserCredentials

// New creates a new User
func New() *User {
	return &User{}
}

// Login lets a user login into the litmus-portal
func (user *User) Login(c *gin.Context) {
	err := c.BindJSON(user)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	userModel := models.UserCredentials(*user)
	controller.Server.HandleAuthenticateRequest(c, &userModel)
	return
}

// UpdatePassword updates a user details
func (user *User) UpdatePassword(c *gin.Context) {
	err := c.BindJSON(user)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	userModel := models.UserCredentials(*user)
	controller.Server.UpdatePasswordRequest(c, &userModel)
	return
}

// UpdatePassword updates a user details
func (user *User) ResetPassword(c *gin.Context) {
	err := c.BindJSON(user)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	userModel := models.UserCredentials(*user)
	controller.Server.ResetPasswordRequest(c, &userModel)
	return
}

// UpdateUserDetails updates a user details
func (user *User) UpdateUserDetails(c *gin.Context) {
	err := c.BindJSON(user)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	userModel := models.UserCredentials(*user)
	controller.Server.UpdateUserDetailsRequest(c, &userModel)
	return
}

// UpdateUserID updates a user details
func (user *User) UpdateUserID(c *gin.Context) {
	err := c.BindJSON(user)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	userModel := models.UserCredentials(*user)
	controller.Server.UpdateUserIDRequest(c, &userModel)
	return
}

//Create ...
func (user *User) Create(c *gin.Context) {
	err := c.BindJSON(user)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	userModel := models.UserCredentials(*user)
	controller.Server.CreateRequest(c, &userModel)
	return
}
