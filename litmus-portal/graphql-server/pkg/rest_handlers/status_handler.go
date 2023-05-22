package rest_handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

type APIStatus struct {
	Status string `json:"status"`
}

// StatusHandler returns current status of this application
func StatusHandler(c *gin.Context) {
	var status = APIStatus{Status: "up"}
	statusByte, err := json.Marshal(status)
	if err != nil {
		utils.WriteHeaders(&c.Writer, http.StatusInternalServerError)
		return
	}
	utils.WriteHeaders(&c.Writer, http.StatusOK)
	c.Writer.Write(statusByte)
}
