package handlers

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/sirupsen/logrus"
)

type LitmusCoreComponentVersion struct {
	CoreVersion string `json:"coreVersion"`
}

func LitmusCoreComponentVersionHandler(w http.ResponseWriter, r *http.Request) {
	versionDetails := os.Getenv("LITMUS_CORE_VERSION")
	version := LitmusCoreComponentVersion{CoreVersion: versionDetails}
	versionByte, err := json.Marshal(version)
	if err != nil {
		logrus.Error(err)
		utils.WriteHeaders(&w, http.StatusBadRequest)
		return
	}

	utils.WriteHeaders(&w, http.StatusOK)
	w.Write(versionByte)
}
