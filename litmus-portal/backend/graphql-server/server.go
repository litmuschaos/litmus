package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/util"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
)

const defaultPort = "8080"

var HOST string

func main() {
	port := defaultPort
	HOST = os.Getenv("HOST")
	if HOST == "" {
		ip, err := util.GetPublicIP()
		if err != nil {
			log.Panic(err.Error())
		}
		HOST = ip + ":31000"
	}
	database.DBInit()
	store.StoreInit()
	log.Print("SERVER STARTING ON : ", HOST)
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	router := mux.NewRouter()
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)
	router.HandleFunc("/file/{key}", fileHandler)
	log.Printf("connect to %s for GraphQL playground", HOST)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func fileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	token := vars["key"]
	id, err := util.ValidateJWT(token)
	if err != nil {
		log.Print("ERROR", err)
		util.WriteHeaders(&w, 404)
		return
	}
	cluster, err := database.GetCluster(id)
	if err != nil {
		log.Print("ERROR", err)
		util.WriteHeaders(&w, 500)
		return
	}
	if len(cluster) == 1 && !cluster[0].IsRegistered {
		respData, err := util.ManifestParser(cluster[0].ClusterID, cluster[0].AccessKey, HOST+"/query")
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
