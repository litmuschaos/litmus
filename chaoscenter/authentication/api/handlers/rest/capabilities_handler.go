package rest

import (
	"github.com/gin-gonic/gin"
	response "github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
)

// GetCapabilities 		godoc
//
//	@Summary		Get capabilities of Auth Server.
//	@Description	Returns capabilities that can be leveraged by frontend services to toggle certain features.
//	@Tags			CapabilitiesRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.CapabilitiesResponse{}
//	@Router			/capabilities [get]
//
// GetCapabilities returns the capabilities of the Auth Server.
func GetCapabilities() gin.HandlerFunc {
	return func(c *gin.Context) {
		capabilities := new(response.CapabilitiesResponse)
		capabilities.Dex.Enabled = utils.DexEnabled
		c.JSON(200, capabilities)
	}
}
