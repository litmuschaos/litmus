package handlers

import (
	"context"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/sirupsen/logrus"
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

// ReadinessHandler returns readiness information
func ReadinessHandler(mclient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			db_flag  = "up"
			col_flag = "up"
		)

		dbs, err := mongodb.Operator.ListDataBase(context.Background(), mclient)
		if err != nil {
			db_flag = "down"
		}

		if !contains(dbs, "litmus") {
			db_flag = "down"
		}

		cols, err := mongodb.Operator.ListCollection(context.Background(), mclient)
		if err != nil {
			col_flag = "down"
		}

		if !contains(cols, "gitops-collection") || !contains(cols, "server-config-collection") || !contains(cols, "workflow-collection") {
			col_flag = "down"
		}

		var status = ReadinessAPIStatus{Collections: col_flag, DataBase: db_flag}
		statusByte, err := json.Marshal(status)
		if err != nil {
			logrus.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusBadRequest)
		}

		utils.WriteHeaders(&c.Writer, http.StatusOK)
		c.Writer.Write(statusByte)
	}
}
