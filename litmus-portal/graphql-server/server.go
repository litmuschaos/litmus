package main

import (
	"log"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/file_handlers"
	gitOpsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/stat"
	"github.com/rs/cors"
)

const defaultPort = "8080"

func init() {
	log.Printf("Go Version: %s", runtime.Version())
	log.Printf("Go OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)

	if os.Getenv("DB_SERVER") == "" || os.Getenv("JWT_SECRET") == "" || os.Getenv("SELF_CLUSTER") == "" || os.Getenv("AGENT_SCOPE") == "" || os.Getenv("AGENT_NAMESPACE") == "" || os.Getenv("LITMUS_PORTAL_NAMESPACE") == "" || os.Getenv("DB_USER") == "" || os.Getenv("DB_PASSWORD") == "" || os.Getenv("PORTAL_SCOPE") == "" || os.Getenv("SUBSCRIBER_IMAGE") == "" || os.Getenv("EVENT_TRACKER_IMAGE") == "" || os.Getenv("ARGO_WORKFLOW_CONTROLLER_IMAGE") == "" || os.Getenv("ARGO_WORKFLOW_EXECUTOR_IMAGE") == "" || os.Getenv("LITMUS_CHAOS_OPERATOR_IMAGE") == "" || os.Getenv("LITMUS_CHAOS_RUNNER_IMAGE") == "" || os.Getenv("LITMUS_CHAOS_EXPORTER_IMAGE") == "" || os.Getenv("CONTAINER_RUNTIME_EXECUTOR") == "" || os.Getenv("HUB_BRANCH_NAME") == "" {
		log.Fatal("Some environment variable are not setup")
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	// Initialize the mongo client
	mongodb.Client = mongodb.Client.Initialize()

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

	gitOpsHandler.GitOpsSyncHandler(true) // sync all previous existing repos before start

	go myhub.RecurringHubSync()               // go routine for syncing hubs for all users
	go gitOpsHandler.GitOpsSyncHandler(false) // routine to sync git repos for gitOps

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", authorization.Middleware(srv))
	router.HandleFunc("/file/{key}{path:.yaml}", file_handlers.FileHandler)
	router.Handle("/icon/{ProjectID}/{HubName}/{ChartName}/{IconName}", authorization.RestMiddlewareWithRole(myhub.GetIconHandler, nil)).Methods("GET")
	router.Handle("/stats", authorization.RestMiddlewareWithRole(http.HandlerFunc(stat.GetStats), []string{"admin"})).Methods("GET")
	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))

}
