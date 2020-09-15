package password

import (
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/golang/glog"
	"github.com/litmuschaos/litmus/litmus-portal/authentication/controller"
)

//Password ...
type Password struct {
	Username    string `json:"username,omitempty"`
	OldPassword string `json:"old_password,omitempty"`
	NewPassword string `json:"new_password,omitempty"`
}

// New creates a new User
func New() *Password {
	return &Password{}
}

//Update ...
func (password *Password) Update(c *gin.Context) {
	err := c.BindJSON(password)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	controller.Server.UpdatePasswordRequest(c, password.OldPassword, password.NewPassword)
	return
}

//Reset ...
func (password *Password) Reset(c *gin.Context) {
	err := c.BindJSON(password)
	if err != nil {
		log.Error(err)
		c.JSON(http.StatusNotAcceptable, gin.H{
			"message": "Unable to parse JSON",
		})
		return
	}

	controller.Server.ResetPasswordRequest(c, password.NewPassword, password.Username)
	return
}
