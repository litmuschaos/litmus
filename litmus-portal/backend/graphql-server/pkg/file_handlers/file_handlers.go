package file_handlers

import (
	"bufio"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/utils"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
)

//ManifestParser parses manifests yaml and generates dynamic manifest with specified keys
func manifestParser(id, key, server, template string) ([]string, error) {
	file, err := os.Open(template)
	if err != nil {
		return []string{}, err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	var lines []string

	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "#{CID}") {
			line = strings.Replace(line, "#{CID}", id, -1)
		} else if strings.Contains(line, "#{KEY}") {
			line = strings.Replace(line, "#{KEY}", key, -1)
		} else if strings.Contains(line, "#{SERVER}") {
			line = strings.Replace(line, "#{SERVER}", server, -1)
		}
		lines = append(lines, line)
	}

	if err := scanner.Err(); err != nil {
		return []string{}, err
	}

	return lines, nil
}

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
		var respData []string
		respData, err = manifestParser(reqCluster.ClusterID, reqCluster.AccessKey, serviceAddr+"/query", "manifests/subscriber.yml")

		if err != nil {
			log.Print("ERROR", err)
			utils.WriteHeaders(&w, 500)
			return
		}
		utils.WriteHeaders(&w, 200)
		w.Write([]byte(strings.Join(respData, "\n")))
		return
	}

	utils.WriteHeaders(&w, 404)
}
