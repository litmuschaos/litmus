package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/sirupsen/logrus"
)

type WorkflowHelperImageVersion struct {
	Version string `json:"version"`
}

func WorkflowHelperImageVersionHandler(w http.ResponseWriter, r *http.Request) {
	versionDetails := utils.Config.WorkflowHelperImageVersion
	version := WorkflowHelperImageVersion{Version: versionDetails}
	versionByte, err := json.Marshal(version)
	if err != nil {
		logrus.Error(err)
		utils.WriteHeaders(&w, http.StatusBadRequest)
		return
	}

	utils.WriteHeaders(&w, http.StatusOK)
	w.Write(versionByte)
}
