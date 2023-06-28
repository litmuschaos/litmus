package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type APIStatus struct {
	Status string `json:"status"`
}

func StatusHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, APIStatus{Status: "up"})
	}
}
