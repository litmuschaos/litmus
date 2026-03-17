package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
)

type ReadinessAPIStatus struct {
	DataBase    string `json:"database"`
	Collections string `json:"collections"`
}

func contains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}

	return false
}

func ReadinessHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var dbFlag = "up"

		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()

		dbs, err := mongodb.Operator.ListDataBase(ctx, mongodb.MgoClient)
		if err != nil {
			dbFlag = "down"
		}

		if !contains(dbs, "litmus") {
			dbFlag = "down"
		}

		// Return 503 Service Unavailable when database is down
		if dbFlag == "down" {
			c.JSON(http.StatusServiceUnavailable, ReadinessAPIStatus{DataBase: dbFlag})
			return
		}

		c.JSON(http.StatusOK, ReadinessAPIStatus{DataBase: dbFlag})
	}
}
