package routes

import (
	"litmus/litmus-portal/authentication/api/handlers"
	"litmus/litmus-portal/authentication/pkg/user"

	"github.com/gin-gonic/gin"
)

// DexRouter creates all the required routes for OAuth purposes.
func DexRouter(router *gin.Engine, service user.Service) {
	router.GET("/dex/login", handlers.DexLogin())
	router.GET("/dex/callback", handlers.DexCallback(service))
}
