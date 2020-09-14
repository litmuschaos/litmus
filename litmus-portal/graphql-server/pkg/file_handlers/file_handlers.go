package file_handlers

import (
	"log"
	"net/http"
	"os"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

//FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	serviceAddr := os.Getenv("SERVICE_ADDRESS")
	vars := mux.Vars(r)
	token := vars["key"]

	id, err := cluster.ClusterValidateJWT(token)
	if err != nil {
		log.Print("ERROR", err)
		utils.WriteHeaders(&w, 404)
		return
	}

	reqCluster, err := database.GetCluster(id)
	if err != nil {
		log.Print("ERROR", err)
		utils.WriteHeaders(&w, 500)
		return
	}

	if !reqCluster.IsRegistered {
		var respData []byte
		respData, err = utils.ManifestParser(reqCluster.ClusterID, reqCluster.AccessKey, serviceAddr+"/query", "manifests/subscriber.yml")

		if err != nil {
			log.Print("ERROR", err)
			utils.WriteHeaders(&w, 500)
			return
		}
		utils.WriteHeaders(&w, 200)
		w.Write(respData)
		return
	}

	utils.WriteHeaders(&w, 404)
}
