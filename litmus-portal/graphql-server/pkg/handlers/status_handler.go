package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/sirupsen/logrus"
)

type APIStatus struct {
	Status string `json:"status"`
}

func StatusHandler(w http.ResponseWriter, r *http.Request) {
	var status = APIStatus{Status: "up"}
	statusByte, err := json.Marshal(status)
	if err != nil {
		logrus.Error(status)
		utils.WriteHeaders(&w, 400)
	}

	utils.WriteHeaders(&w, 200)
	w.Write(statusByte)
}
