package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
)

// Operator encapsulates the MongoDB operations
type Operator struct {
	mongoOperator mongodb.MongoOperator
}

// NewOperator returns a new instance of Operator
func NewOperator(mongoOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		mongoOperator: mongoOperator,
	}
}

// ReadinessAPIStatus represents the readiness status of the API
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

// ReadinessHandler returns a handler function for readiness checks
func (r *Operator) ReadinessHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var dbFlag = "up"
		dbs, err := r.mongoOperator.ListDataBase(context.Background(), mongodb.MgoClient)
		if err != nil {
			dbFlag = "down"
		}

		if !contains(dbs, "litmus") {
			dbFlag = "down"
		}

		c.JSON(http.StatusOK, ReadinessAPIStatus{DataBase: dbFlag})
	}
}
