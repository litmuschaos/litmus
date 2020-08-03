package github

import (
	"github.com/gin-gonic/gin"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller"
)

//Github is a type
type Github struct{}

//New Creates new GithubUser
func New() *Github {
	return &Github{}
}

// Login lets a user login into the litmus-portal
func (g *Github) Login(c *gin.Context) {
	controller.Server.Middleware(c)

}

//OAuth lets user do the authorization
func (g *Github) OAuth(c *gin.Context) {
	controller.Server.GitHub(c)

}
