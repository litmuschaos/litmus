package handlers

import (
	"context"
	"encoding/json"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/mongo"
	"net/http"

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

func ReadinessHandler(handler http.Handler, mclient *mongo.Client) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var (
			db_flag  = "up"
			col_flag = "up"
		)

		dbs, err := mongodb.Operator.ListDataBase(context.Background(), mclient)
		if !contains(dbs, "litmus") {
			db_flag = "down"
		}

		cols, err := mongodb.Operator.ListCollection(context.Background(), mclient)
		if !contains(cols, "gitops-collection") || !contains(cols, "server-config-collection") || !contains(cols, "workflow-collection") {
			col_flag = "down"
		}

		var status = ReadinessAPIStatus{Collections: col_flag, DataBase: db_flag}
		statusByte, err := json.Marshal(status)
		if err != nil {
			logrus.Error(status)
			utils.WriteHeaders(&w, 400)
		}

		utils.WriteHeaders(&w, 200)
		w.Write(statusByte)
	})

}
