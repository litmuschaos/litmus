package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/authentication/pkg/server"
)

// Server represents the server with default config
var Server = server.NewServer(server.NewConfig())

// UserController will do login operation
type UserController interface {
	Login(c *gin.Context)
	Logout(c *gin.Context)
	UpdateUserDetails(c *gin.Context)
	GetAllUsers(c *gin.Context)
	Create(c *gin.Context)
}

// PasswordController will do update operation
type PasswordController interface {
	Update(c *gin.Context)
	Reset(c *gin.Context)
}
