package rest_handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
)

type APIStatus struct {
	Status string `json:"status"`
}

// StatusHandler returns current status of this application
func StatusHandler(c *gin.Context) {
	var status = APIStatus{Status: "up"}
	statusByte, err := json.Marshal(status)
	if err != nil {
		log.Error(err)
		utils.WriteHeaders(&c.Writer, http.StatusBadRequest)
	}

	utils.WriteHeaders(&c.Writer, http.StatusOK)
	c.Writer.Write(statusByte)
}
