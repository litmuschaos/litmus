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
		// Check MongoDB connection health and ensure the required "litmus" database exists,
		// using a short timeout to avoid hanging the health endpoint.
		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()

		dbs, err := mongodb.Operator.ListDataBase(ctx, mongodb.MgoClient)
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, APIStatus{Status: "down"})
			return
		}

		litmusExists := false
		for _, db := range dbs {
			if db == "litmus" {
				litmusExists = true
				break
			}
		}
		if !litmusExists {
			c.JSON(http.StatusServiceUnavailable, APIStatus{Status: "down"})
			return
		}
		c.JSON(http.StatusOK, APIStatus{Status: "up"})
	}
}
