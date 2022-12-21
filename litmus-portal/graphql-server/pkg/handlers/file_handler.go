package handlers

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/sirupsen/logrus"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

// FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	var (
		vars  = mux.Vars(r)
		token = vars["key"]
	)

	response, statusCode, err := cluster.GetManifest(token)
	if err != nil {
		logrus.Print("error: ", err)
		utils.WriteHeaders(&w, statusCode)
	}

	utils.WriteHeaders(&w, statusCode)
	w.Write(response)
}
