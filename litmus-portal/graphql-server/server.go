package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/synchandler"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/file_handlers"
)

const defaultPort = "8080"

var err error

func init() {
	if os.Getenv("LITMUS_CHAOS_RUNNER_IMAGE") == "" || os.Getenv("LITMUS_CHAOS_OPERATOR_IMAGE") == "" || os.Getenv("SUBSCRIBER_IMAGE") == "" || os.Getenv("ARGO_SERVER_IMAGE") == "" || os.Getenv("ARGO_WORKFLOW_EXECUTOR_IMAGE") == "" || os.Getenv("ARGO_WORKFLOW_EXECUTOR_IMAGE") == "" || os.Getenv("JWT_SECRET") == "" || os.Getenv("PORTAL_SCOPE") == "" {
		log.Fatal("Some environment variable are not setup")
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	srv := handler.New(generated.NewExecutableSchema(graph.NewConfig()))
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	})

	// to be removed in production
	srv.Use(extension.Introspection{})

	router := mux.NewRouter()

	router.Use(cors.New(cors.Options{
		AllowedHeaders:   []string{"*"},
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
	}).Handler)
	go synchandler.RecurringHubSync() //go routine for syncing hubs for all users
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", authorization.Middleware(srv))
	router.HandleFunc("/file/{key}{path:.yaml}", file_handlers.FileHandler)
	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))

}
