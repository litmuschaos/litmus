package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
)

type APIStatus struct {
	Status string `json:"status"`
}

func StatusHandler(w http.ResponseWriter, r *http.Request) {
	var status = APIStatus{Status: "up"}
	statusByte, err := json.Marshal(status)
	if err != nil {
		log.Error(err)
		utils.WriteHeaders(&w, http.StatusBadRequest)
	}

	utils.WriteHeaders(&w, http.StatusOK)
	w.Write(statusByte)
}
