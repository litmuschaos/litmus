package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/harness/hce-saas/graphql/server/utils"

	"github.com/sirupsen/logrus"
)

type APIStatus struct {
	Status string `json:"status"`
}

func StatusHandler(w http.ResponseWriter, r *http.Request) {
	var status = APIStatus{Status: "up"}
	statusByte, err := json.Marshal(status)
	if err != nil {
		logrus.WithError(err).Error(status)
		utils.WriteHeaders(&w, 500)
		w.Write([]byte(err.Error()))
	}

	utils.WriteHeaders(&w, 200)
	w.Write(statusByte)
}
