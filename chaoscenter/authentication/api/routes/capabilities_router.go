package routes

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"

	"github.com/gin-gonic/gin"
)

// CapabilitiesRouter creates all the required routes for exposing capabilities.
func CapabilitiesRouter(router *gin.Engine) {
	router.GET("/capabilities", rest.GetCapabilities())
}
