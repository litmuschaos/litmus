package main

import (
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/generated"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/file_handlers"
	"log"
	"net/http"
	"os"
)

const defaultPort = "8080"

var err error

func init() {
	if os.Getenv("MONGODB_SERVER") == "" || os.Getenv("CLUSTER_JWT_SECRET") == "" || os.Getenv("SERVICE_ADDRESS") == "" {
		log.Fatal("Some environment variable are not setup")
	}

	if err = database.DBInit(); err != nil {
		log.Fatal(err)
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	router := mux.NewRouter()
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)
	router.HandleFunc("/file/{key}{path:.yaml}", file_handlers.FileHandler)

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
