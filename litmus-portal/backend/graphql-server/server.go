package main

import (
	"github.com/gorilla/mux"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/generated"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/handlers"
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
)

const defaultPort = "8080"

func main() {
	port := defaultPort
	database.DBInit()
	store.StoreInit()
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	router := mux.NewRouter()
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)
	router.HandleFunc("/file/{key}", handlers.FileHandler)
	log.Println("Server is running")
	log.Fatal(http.ListenAndServe(":"+port, router))
}
