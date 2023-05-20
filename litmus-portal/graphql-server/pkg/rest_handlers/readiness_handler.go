package rest_handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
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

func ReadinessHandler(handler http.Handler, mclient *mongo.Client, mongodbOperator mongodb.MongoOperator) gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			dbFlag  = "up"
			colFlag = "up"
		)

		dbs, err := mongodbOperator.ListDataBase(context.Background(), mclient)
		if err != nil {
			log.Error(err)
			dbFlag = "down"
		}

		if !contains(dbs, "litmus") {
			dbFlag = "down"
		}

		cols, err := mongodbOperator.ListCollection(context.Background(), mclient)
		if err != nil {
			log.Error(err)
			colFlag = "down"
		}

		if !contains(cols, "gitops-collection") || !contains(cols, "server-config-collection") || !contains(cols, "workflow-collection") {
			colFlag = "down"
		}

		var status = ReadinessAPIStatus{Collections: colFlag, DataBase: dbFlag}
		statusByte, err := json.Marshal(status)
		if err != nil {
			log.Error(err)
			utils.WriteHeaders(&c.Writer, http.StatusBadRequest)
		}

		utils.WriteHeaders(&c.Writer, http.StatusOK)
		c.Writer.Write(statusByte)
	}
}
