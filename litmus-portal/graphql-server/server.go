package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"

	gitOpsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/projects"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"

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
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/handlers"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
	pb "github.com/litmuschaos/litmus/litmus-portal/graphql-server/protos"
	"github.com/rs/cors"
	"google.golang.org/grpc"
)

type Config struct {
	Port                        string
	Version                     string `required:"true"`
	AgentDeployments            string `required:"true" split_words:"true"`
	DbServer                    string `required:"true" split_words:"true"`
	JwtSecret                   string `required:"true" split_words:"true"`
	SelfAgent                   string `required:"true" split_words:"true"`
	AgentScope                  string `required:"true" split_words:"true"`
	AgentNamespace              string `required:"true" split_words:"true"`
	LitmusPortalNamespace       string `required:"true" split_words:"true"`
	DbUser                      string `required:"true" split_words:"true"`
	DbPassword                  string `required:"true" split_words:"true"`
	ChaosCenterScope            string `required:"true" split_words:"true"`
	SubscriberImage             string `required:"true" split_words:"true"`
	EventTrackerImage           string `required:"true" split_words:"true"`
	ArgoWorkflowControllerImage string `required:"true" split_words:"true"`
	ArgoWorkflowExecutorImage   string `required:"true" split_words:"true"`
	LitmusChaosOperatorImage    string `required:"true" split_words:"true"`
	LitmusChaosRunnerImage      string `required:"true" split_words:"true"`
	LitmusChaosExporterImage    string `required:"true" split_words:"true"`
	ContainerRuntimeExecutor    string `required:"true" split_words:"true"`
	HubBranchName               string `required:"true" split_words:"true"`
	WorkflowHelperImageVersion  string `required:"true" split_words:"true"`
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
	// confirm version env is valid
	if !strings.Contains(strings.ToLower(c.Version), cluster.CIVersion) {
		splitCPVersion := strings.Split(c.Version, ".")
		if len(splitCPVersion) != 3 {
			logrus.Fatal("version doesn't follow semver semantic")
		}
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
	httpPort := os.Getenv("HTTP_PORT")
	if httpPort == "" {
		httpPort = utils.DefaultHTTPPort
	}

	rpcPort := os.Getenv("RPC_PORT")
	if rpcPort == "" {
		rpcPort = utils.DefaultRPCPort
	}

	client, err := mongodb.MongoConnection()
	if err != nil {
		logrus.Fatal(err)
	}

	mongodb.Client = mongodb.Client.Initialize(client)

	if err := validateVersion(); err != nil {
		logrus.Fatal(err)
	}

	go startGRPCServer(rpcPort) // start GRPC server

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

	//router.Use(handlers.LoggingMiddleware())

	// routers
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", authorization.Middleware(srv))
	router.Handle("/readiness", handlers.ReadinessHandler(srv, client))
	router.Handle("/icon/{ProjectID}/{HubName}/{ChartName}/{IconName}", authorization.RestMiddlewareWithRole(myhub.GetIconHandler, nil)).Methods("GET")

	router.HandleFunc("/file/{key}{path:.yaml}", handlers.FileHandler)
	router.HandleFunc("/status", handlers.StatusHandler)
	router.HandleFunc("/workflow_helper_image_version", handlers.WorkflowHelperImageVersionHandler)

	gitOpsHandler.GitOpsSyncHandler(true) // sync all previous existing repos before start

	go myhub.RecurringHubSync()               // go routine for syncing hubs for all users
	go gitOpsHandler.GitOpsSyncHandler(false) // routine to sync git repos for gitOps

	logrus.Printf("connect to http://localhost:%s/ for GraphQL playground", httpPort)
	logrus.Fatal(http.ListenAndServe(":"+httpPort, router))
}

// startGRPCServer initializes, registers services to and starts the gRPC server for RPC calls
func startGRPCServer(port string) {
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		logrus.Fatal("failed to listen: %w", err)
	}

	grpcServer := grpc.NewServer()

	// Register services
	pb.RegisterProjectServer(grpcServer, &projects.ProjectServer{})

	logrus.Printf("GRPC server listening on %v", lis.Addr())
	logrus.Fatal(grpcServer.Serve(lis))
}
