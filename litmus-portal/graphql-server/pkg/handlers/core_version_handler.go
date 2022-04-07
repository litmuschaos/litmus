package handlers

import (
	"encoding/json"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"net/http"
	"os"
)

type LitmusCoreComponentVersion struct {
	CoreVersion string `json:"coreVersion"`
}

func LitmusCoreComponentVersionHandler(w http.ResponseWriter, r *http.Request) {
	versionDetails := os.Getenv("LITMUS_CORE_VERSION")
	version := LitmusCoreComponentVersion{CoreVersion: versionDetails}
	versionByte, err := json.Marshal(version)
	if err != nil {
		utils.WriteHeaders(&w, 400)
	}

	utils.WriteHeaders(&w, 200)
	w.Write(versionByte)
}
