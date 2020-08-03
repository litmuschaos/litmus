package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/server"
)

// Server represents the server with default config
var Server = server.NewServer(server.NewConfig())

// UserController will do login operation
type UserController interface {
	Login(c *gin.Context)
	Update(c *gin.Context)
}

// GithubController will do login operation
type GithubController interface {
	Login(c *gin.Context)
	OAuth(c *gin.Context)
}
