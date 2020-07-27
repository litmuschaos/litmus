package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/golang/glog"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/models"
)

// User is a type to be accepted as input
type User models.User

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

	userModel := models.User(*user)
	controller.Server.HandleAuthenticateRequest(c, &userModel)
	return
}

// Update updates a user details
func (user *User) Update(c *gin.Context) {
	err := c.BindJSON(user)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	userModel := models.User(*user)
	controller.Server.UpdateRequest(c, &userModel)
	return
}
