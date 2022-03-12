package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	dbMiscCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/misc"

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

func ReadinessHandler(w http.ResponseWriter, r *http.Request) {
	var (
		db_flag  = true
		col_flag = true
	)

	dbs, err := dbMiscCluster.ListDataBase(context.Background())
	if !contains(dbs, "litmus") {
		db_flag = false
	}

	cols, err := dbMiscCluster.ListCollection(context.Background())
	if !contains(cols, "gitops-collection") && !contains(cols, "server-config-collection") && !contains(cols, "workflow-collection") {
		col_flag = false
	}

	var status = ReadinessAPIStatus{Collections: strconv.FormatBool(db_flag), DataBase: strconv.FormatBool(col_flag)}
	statusByte, err := json.Marshal(status)
	if err != nil {
		logrus.Error(status)
		utils.WriteHeaders(&w, 400)
	}

	utils.WriteHeaders(&w, 200)
	w.Write(statusByte)
}
