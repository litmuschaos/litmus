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
	Logout(c *gin.Context)
	UpdatePassword(c *gin.Context)
	ResetPassword(c *gin.Context)
	UpdateUserDetails(c *gin.Context)
	GetAllUsers(c *gin.Context)
	Create(c *gin.Context)
}

// UpdateController will do update operation
type UpdateController interface {
	Update(c *gin.Context)
}
