package routes

import (
	"github.com/gin-gonic/gin"
	"litmus/litmus-portal/authentication/api/handlers/rest"
	"litmus/litmus-portal/authentication/pkg/services"
)

// DexRouter creates all the required routes for OAuth purposes.
func DexRouter(router *gin.Engine, service services.ApplicationService) {
	router.GET("/dex/login", rest.DexLogin())
	router.GET("/dex/callback", rest.DexCallback(service))
}
