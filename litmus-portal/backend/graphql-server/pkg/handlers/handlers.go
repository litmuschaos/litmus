package handlers

import (
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/util"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
)

//FileHandler dynamically generates the manifest file and sends it as a response
func FileHandler(w http.ResponseWriter, r *http.Request) {
	addr := os.Getenv("EXTERNAL_ADDRESS")
	serviceAddr := os.Getenv("SERVICE_ADDRESS")
	vars := mux.Vars(r)
	token := vars["key"]
	id, err := cluster.ClusterValidateJWT(token)
	if err != nil {
		log.Print("ERROR", err)
		util.WriteHeaders(&w, 404)
		return
	}
	reqCluster, err := database.GetCluster(id)
	if err != nil {
		log.Print("ERROR", err)
		util.WriteHeaders(&w, 500)
		return
	}
	if len(reqCluster) == 1 && !reqCluster[0].IsRegistered {
		var respData []string
		if strings.ToLower(reqCluster[0].ClusterType) == "internal" {
			respData, err = cluster.ManifestParser(reqCluster[0].ClusterID, reqCluster[0].AccessKey, serviceAddr+"/query", "manifests/subscriber.yml")
		} else {
			respData, err = cluster.ManifestParser(reqCluster[0].ClusterID, reqCluster[0].AccessKey, addr+"/query", "manifests/subscriber.yml")
		}
		if err != nil {
			log.Print("ERROR", err)
			util.WriteHeaders(&w, 500)
			return
		}
		util.WriteHeaders(&w, 200)
		w.Write([]byte(strings.Join(respData, "\n")))
		return
	}
	util.WriteHeaders(&w, 404)
}
