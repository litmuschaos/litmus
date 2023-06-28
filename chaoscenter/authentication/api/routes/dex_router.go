package routes

import (
	"litmus/litmus-portal/authentication/api/handlers/rest"
	"litmus/litmus-portal/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

// DexRouter creates all the required routes for OAuth purposes.
func DexRouter(router *gin.Engine, service services.ApplicationService) {
	router.GET("/dex/login", rest.DexLogin())
	router.GET("/dex/callback", rest.DexCallback(service))
}
