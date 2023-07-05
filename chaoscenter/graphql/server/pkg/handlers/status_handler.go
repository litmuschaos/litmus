package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIStatus struct {
	Status string `json:"status"`
}

func StatusHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, APIStatus{Status: "up"})
	}
}
