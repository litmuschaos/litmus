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

// UpdateController will do update operation
type UpdateController interface {
	Update(c *gin.Context)
}
