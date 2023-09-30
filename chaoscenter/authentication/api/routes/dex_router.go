package routes

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

// DexRouter creates all the required routes for OAuth purposes.
func DexRouter(router *gin.Engine, service services.ApplicationService) {
	router.GET("/dex/login", rest.DexLogin())
	router.GET("/dex/callback", rest.DexCallback(service))
}
