package handlers

import (
	"context"
	"net/http"

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
		dbs, err := mongodb.Operator.ListDataBase(context.Background(), mongodb.MgoClient)
		if err != nil {
			dbFlag = "down"
		}

		if !contains(dbs, "litmus") {
			dbFlag = "down"
		}

		c.JSON(http.StatusOK, ReadinessAPIStatus{DataBase: dbFlag})
	}
}
