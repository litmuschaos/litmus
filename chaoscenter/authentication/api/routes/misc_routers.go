package routes

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

func MiscRouter(router *gin.Engine, service services.ApplicationService) {
	router.GET("/status", rest.Status(service))
	router.GET("/readiness", rest.Readiness(service))
}
