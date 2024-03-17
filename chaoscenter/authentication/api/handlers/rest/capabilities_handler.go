package rest

import (
	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
)

type Capabilities struct {
	Dex struct {
		Enabled bool `json:"enabled"`
	} `json:"dex"`
}

// GetCapabilities 		godoc
//
//	@Summary		Get capabilities of Auth Server.
//	@Description	Returns capabilities that can be leveraged by frontend services to toggle certain features.
//	@Tags			CapabilitiesRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Response{}
//	@Router			/capabilities [get]
func GetCapabilities() gin.HandlerFunc {
	capabilities := new(Capabilities)
	capabilities.Dex.Enabled = utils.DexEnabled
	return func(c *gin.Context) {
		c.JSON(200, capabilities)
	}
}
