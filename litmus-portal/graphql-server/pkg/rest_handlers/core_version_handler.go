// Package rest_handlers provides rest handlers
package rest_handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

type WorkflowHelperImageVersion struct {
	Version string `json:"version"`
}

// WorkflowHelperImageVersionHandler is used to provide workflow helper's image version
func WorkflowHelperImageVersionHandler(c *gin.Context) {
	versionDetails := utils.Config.WorkflowHelperImageVersion
	version := WorkflowHelperImageVersion{Version: versionDetails}
	versionByte, err := json.Marshal(version)
	if err != nil {
		utils.WriteHeaders(&c.Writer, http.StatusBadRequest)
		return
	}
	utils.WriteHeaders(&c.Writer, http.StatusOK)
	c.Writer.Write(versionByte)
}
