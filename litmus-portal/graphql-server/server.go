package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/kelseyhightower/envconfig"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/config"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	gitOpsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/rs/cors"
)

type Config struct {
	Port                        string `required:"true"`
	Version                     string `required:"true"`
	AgentDeployments            string `required:"true" split_words:"true"`
	DbServer                    string `required:"true" split_words:"true"`
	JwtSecret                   string `required:"true" split_words:"true"`
	SelfCluster                 string `required:"true" split_words:"true"`
	AgentScope                  string `required:"true" split_words:"true"`
	AgentNamespace              string `required:"true" split_words:"true"`
	LitmusPortalNamespace       string `required:"true" split_words:"true"`
	DbUser                      string `required:"true" split_words:"true"`
	DbPassword                  string `required:"true" split_words:"true"`
	PortalScope                 string `required:"true" split_words:"true"`
	SubscriberImage             string `required:"true" split_words:"true"`
	EventTrackerImage           string `required:"true" split_words:"true"`
	ArgoWorkfloWControllerImage string `required:"true" split_words:"true"`
	ArgoWorkflowExecutorImage   string `required:"true" split_words:"true"`
	LitmusChaosOperatorImage    string `required:"true" split_words:"true"`
	LitmusChaosRunnerImage      string `required:"true" split_words:"true"`
	LitmusChaosExporterImage    string `required:"true" split_words:"true"`
	ContainerRuntimeExecutor    string `required:"true" split_words:"true"`
	HubBranchName               string `required:"true" split_words:"true"`
}

const defaultPort = "8080"

func init() {
	logrus.Printf("Go Version: %s", runtime.Version())
	logrus.Printf("Go OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)

	var c Config

	err := envconfig.Process("", &c)
	if err != nil {
		logrus.Fatal(err)
	}
}

func validateVersion() error {
	currentVersion := os.Getenv("VERSION")
	dbVersion, err := config.GetConfig(context.Background(), "version")
	if err != nil {
		return fmt.Errorf("failed to get version from db, error = %w", err)
	}
	if dbVersion == nil {
		err := config.CreateConfig(context.Background(), &config.ServerConfig{Key: "version", Value: currentVersion})
		if err != nil {
			return fmt.Errorf("failed to insert current version in db, error = %w", err)
		}
		return nil
	}
	if dbVersion.Value.(string) != currentVersion {
		return fmt.Errorf("control plane needs to be upgraded from version %v to %v", dbVersion.Value.(string), currentVersion)
	}
	return nil
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	// Initialize the mongo client
	mongodb.Client = mongodb.Client.Initialize()

	if err := validateVersion(); err != nil {
		logrus.Fatal(err)
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

	gitOpsHandler.GitOpsSyncHandler(true) // sync all previous existing repos before start

	go myhub.RecurringHubSync()               // go routine for syncing hubs for all users
	go gitOpsHandler.GitOpsSyncHandler(false) // routine to sync git repos for gitOps

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", authorization.Middleware(srv))
	router.HandleFunc("/file/{key}{path:.yaml}", rest_handlers.FileHandler)
	router.HandleFunc("/status", rest_handlers.StatusHandler)

	router.Handle("/icon/{ProjectID}/{HubName}/{ChartName}/{IconName}", authorization.RestMiddlewareWithRole(myhub.GetIconHandler, nil)).Methods("GET")
	logrus.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	logrus.Fatal(http.ListenAndServe(":"+port, router))
}
