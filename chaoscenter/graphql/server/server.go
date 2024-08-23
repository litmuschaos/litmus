package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"regexp"
	"runtime"
	"strconv"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/api/middleware"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/generated"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub"
	handler2 "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/handler"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_hub"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/config"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/handlers"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/projects"
	pb "github.com/litmuschaos/litmus/chaoscenter/graphql/server/protos"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
)

func init() {
	log.SetFormatter(&log.JSONFormatter{})
	log.SetReportCaller(true)
	log.Printf("go version: %s", runtime.Version())
	log.Printf("go os/arch: %s/%s", runtime.GOOS, runtime.GOARCH)

	err := envconfig.Process("", &utils.Config)
	if err != nil {
		log.Fatal(err)
	}
}

func validateVersion() error {
	currentVersion := utils.Config.Version
	dbVersion, err := config.GetConfig(context.Background(), "version")
	if err != nil {
		return fmt.Errorf("failed to get version from db, error = %w", err)
	}
	if dbVersion == nil {
		err := config.CreateConfig(
			context.Background(),
			&config.ServerConfig{Key: "version", Value: currentVersion},
		)
		if err != nil {
			return fmt.Errorf("failed to insert current version in db, error = %w", err)
		}
		return nil
	}
	// This check will be added back once DB upgrader job becomes functional
	// if dbVersion.Value.(string) != currentVersion {
	// 	return fmt.Errorf("control plane needs to be upgraded from version %v to %v", dbVersion.Value.(string), currentVersion)
	// }
	return nil
}

func setupGin() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(middleware.DefaultStructuredLogger())
	router.Use(gin.Recovery())
	router.Use(middleware.ValidateCors())
	return router
}

func main() {
	router := setupGin()
	var err error
	mongodb.MgoClient, err = mongodb.MongoConnection()
	if err != nil {
		log.Fatal(err)
	}

	mongoClient := mongodb.Client.Initialize(mongodb.MgoClient)

	var mongodbOperator mongodb.MongoOperator = mongodb.NewMongoOperations(mongoClient)
	mongodb.Operator = mongodbOperator

	if err := validateVersion(); err != nil {
		log.Fatal(err)
	}

	enableHTTPSConnection, err := strconv.ParseBool(utils.Config.EnableInternalTls)
	if err != nil {
		log.Errorf("unable to parse boolean value %v", err)
	}

	if enableHTTPSConnection {
		if utils.Config.TlsCertPath == "" || utils.Config.TlsKeyPath == "" {
			log.Fatalf("Failure to start chaoscenter authentication REST server due to empty TLS cert file path and TLS key path")
		}
		go startGRPCServerWithTLS(mongodbOperator) // start GRPC serve
	} else {
		go startGRPCServer(utils.Config.GrpcPort, mongodbOperator) // start GRPC serve
	}

	srv := handler.New(generated.NewExecutableSchema(graph.NewConfig(mongodbOperator)))
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				origin := r.Header.Get("Origin")
				if origin == "" {
					origin = r.Host
				}
				for _, allowedOrigin := range utils.Config.AllowedOrigins {
					match, err := regexp.MatchString(allowedOrigin, origin)
					if err == nil && match {
						return true
					}
				}
				return false
			},
		},
	})

	enableIntrospection, err := strconv.ParseBool(utils.Config.EnableGQLIntrospection)
	if err != nil {
		log.Errorf("unable to parse boolean value %v", err)
	}
	if enableIntrospection {
		srv.Use(extension.Introspection{})
	}

	// go routine for syncing chaos hubs
	go chaoshub.NewService(dbSchemaChaosHub.NewChaosHubOperator(mongodbOperator)).RecurringHubSync()
	go chaoshub.NewService(dbSchemaChaosHub.NewChaosHubOperator(mongodbOperator)).SyncDefaultChaosHubs()

	// routers
	router.GET("/", handlers.PlaygroundHandler())
	router.Any("/query", authorization.Middleware(srv, mongodb.MgoClient))

	router.Any("/file/:key", handlers.FileHandler(mongodbOperator))

	//chaos hub routers
	router.GET("/icon/:projectId/:hubName/:chartName/:iconName", handler2.ChaosHubIconHandler())
	router.GET("/icon/default/:hubName/:chartName/:iconName", handler2.DefaultChaosHubIconHandler())

	//general routers
	router.GET("/status", handlers.StatusHandler())
	router.GET("/readiness", handlers.ReadinessHandler())

	projectEventChannel := make(chan string)
	go projects.ProjectEvents(projectEventChannel, mongodb.MgoClient, mongodbOperator)

	if enableHTTPSConnection {
		if utils.Config.TlsCertPath == "" || utils.Config.TlsKeyPath == "" {
			log.Fatalf("Failure to start chaoscenter authentication GRPC server due to empty TLS cert file path and TLS key path")
		}

		log.Infof("graphql server running at https://localhost:%s", utils.Config.RestPort)
		// configuring TLS config based on provided certificates & keys
		conf := utils.GetTlsConfig(utils.Config.TlsCertPath, utils.Config.TlsKeyPath, true)

		server := http.Server{
			Addr:      ":" + utils.Config.RestPort,
			Handler:   router,
			TLSConfig: conf,
		}
		if err := server.ListenAndServeTLS("", ""); err != nil {
			log.Fatalf("Failure to start litmus-portal graphql REST server due to %v", err)
		}
	} else {
		log.Infof("graphql server running at http://localhost:%s", utils.Config.RestPort)
		log.Fatal(http.ListenAndServe(":"+utils.Config.RestPort, router))
	}
}

// startGRPCServer initializes, registers services to and starts the gRPC server for RPC calls
func startGRPCServer(port string, mongodbOperator mongodb.MongoOperator) {
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatal("failed to listen: %w", err)
	}

	grpcServer := grpc.NewServer()

	// Register services

	pb.RegisterProjectServer(grpcServer, &projects.ProjectServer{Operator: mongodbOperator})

	log.Infof("GRPC server listening on %v", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}

// startGRPCServerWithTLS initializes, registers services to and starts the gRPC server for RPC calls
func startGRPCServerWithTLS(mongodbOperator mongodb.MongoOperator) {

	lis, err := net.Listen("tcp", ":"+utils.Config.GrpcPort)
	if err != nil {
		log.Fatal("failed to listen: %w", err)
	}

	// configuring TLS config based on provided certificates & keys
	conf := utils.GetTlsConfig(utils.Config.TlsCertPath, utils.Config.TlsKeyPath, true)

	// create tls credentials
	tlsCredentials := credentials.NewTLS(conf)

	// create grpc server with tls credential
	grpcServer := grpc.NewServer(grpc.Creds(tlsCredentials))

	// Register services

	pb.RegisterProjectServer(grpcServer, &projects.ProjectServer{Operator: mongodbOperator})

	log.Infof("GRPC server listening on %v", lis.Addr())
	log.Fatal(grpcServer.Serve(lis))
}
