package routes

import (
	"litmus/litmus-portal/authentication/api/handlers/rest"
	"litmus/litmus-portal/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

func MiscRouter(router *gin.Engine, service services.ApplicationService) {
	router.GET("/status", rest.Status(service))
	router.GET("/readiness", rest.Readiness(service))
}
