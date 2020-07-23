package main

import (
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/cluster"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/generated"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/util"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
)

const defaultPort = "8080"

var addr string
var serviceAddr string

func main() {
	port := defaultPort
	addr = os.Getenv("EXTERNAL_ADDRESS")
	serviceAddr = os.Getenv("SERVICE_ADDRESS")
	database.DBInit()
	store.StoreInit()
	log.Print("SERVER STARTING ON : ", addr)
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	router := mux.NewRouter()
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)
	router.HandleFunc("/file/{key}", fileHandler)
	log.Printf("connect to %s for GraphQL playground", addr)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func fileHandler(w http.ResponseWriter, r *http.Request) {
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
			respData, err = cluster.ManifestParser(reqCluster[0].ClusterID, reqCluster[0].AccessKey, serviceAddr+"/query", "template/self-template.yml")
		} else {
			respData, err = cluster.ManifestParser(reqCluster[0].ClusterID, reqCluster[0].AccessKey, addr+"/query", "template/template.yml")
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
