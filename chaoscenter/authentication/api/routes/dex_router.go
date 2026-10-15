package routes

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

// OAuthRouter creates all the required routes for OAuth purposes.
func OAuthRouter(router *gin.Engine, service services.ApplicationService) {
	router.GET("/oauth/login", rest.OAuthLogin())
	router.GET("/oauth/callback", rest.OAuthCallback(service))
}
