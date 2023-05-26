package handlers

import (
	"github.com/gorilla/mux"
	"github.com/harness/hce-saas/graphql/server/pkg/chaos_infra"
	dbChaosInfra "github.com/harness/hce-saas/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/harness/hce-saas/graphql/server/utils"
	"net/http"

	"github.com/sirupsen/logrus"
)

// FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	var (
		vars  = mux.Vars(r)
		token = vars["key"]
	)
	infraId, err := chaos_infra.InfraValidateJWT(token)
	if err != nil {
		logrus.Error(err)
		utils.WriteHeaders(&w, 500)
		w.Write([]byte(err.Error()))
	}

	infra, err := dbChaosInfra.GetInfra(infraId)
	if err != nil {
		logrus.Error(err)
		utils.WriteHeaders(&w, 500)
		w.Write([]byte(err.Error()))
	}

	response, err := chaos_infra.GetK8sInfraYaml(infra)
	if err != nil {
		logrus.Error(err)
		utils.WriteHeaders(&w, 500)
		w.Write([]byte(err.Error()))
	}
	utils.WriteHeaders(&w, 200)
	w.Write(response)
}
