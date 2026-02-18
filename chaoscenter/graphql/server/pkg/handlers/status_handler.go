package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
)

type APIStatus struct {
	Status string `json:"status"`
}

func StatusHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check MongoDB connection health with a short timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()

		_, err := mongodb.Operator.ListDataBase(ctx, mongodb.MgoClient)
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, APIStatus{Status: "down"})
			return
		}

		c.JSON(http.StatusOK, APIStatus{Status: "up"})
	}
}
