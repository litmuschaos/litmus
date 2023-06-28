package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/api/middleware"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub"
	handler2 "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/handler"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_hub"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/projects"

	"net"
	"net/http"
	"runtime"
	"time"

	"github.com/kelseyhightower/envconfig"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"

	"github.com/99designs/gqlgen/graphql/handler/extension"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/gorilla/websocket"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/generated"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/handlers"
	pb "github.com/litmuschaos/litmus/chaoscenter/graphql/server/protos"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

func init() {
	logrus.SetFormatter(&logrus.JSONFormatter{})
	logrus.Printf("go version: %s", runtime.Version())
	logrus.Printf("go os/arch: %s/%s", runtime.GOOS, runtime.GOARCH)

	err := envconfig.Process("", &utils.Config)
	if err != nil {
		logrus.Fatal(err)
	}

}

func setupGin() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(middleware.DefaultStructuredLogger())
	router.Use(gin.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	return router
}

func main() {
	router := setupGin()
	var err error
	mongodb.MgoClient, err = mongodb.MongoConnection()
	if err != nil {
		logrus.Fatal(err)
	}

	mongoClient := mongodb.Client.Initialize(mongodb.MgoClient)

	var mongodbOperator mongodb.MongoOperator = mongodb.NewMongoOperations(mongoClient)
	mongodb.Operator = mongodbOperator

	go startGRPCServer(utils.Config.RpcPort, mongodbOperator) // start GRPC serve

	srv := handler.New(generated.NewExecutableSchema(graph.NewConfig(mongodbOperator)))
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

	// go routine for syncing chaos hubs
	go chaoshub.NewService(dbSchemaChaosHub.NewChaosHubOperator(mongodbOperator)).RecurringHubSync()
	go chaoshub.NewService(dbSchemaChaosHub.NewChaosHubOperator(mongodbOperator)).SyncDefaultChaosHubs()

	// routers
	router.GET("/", handlers.PlaygroundHandler())
	router.Any("/query", authorization.Middleware(srv))

	router.Any("/file/:key", handlers.FileHandler(mongodbOperator))

	//chaos hub routers
	router.GET("/icon/:projectId/:hubName/:chartName/:iconName", handler2.ChaosHubIconHandler())
	router.GET("/icon/default/:hubName/:chartName/:iconName", handler2.DefaultChaosHubIconHandler())

	//general routers
	router.GET("/status", handlers.StatusHandler())
	router.GET("/readiness", handlers.ReadinessHandler())

	projectEventChannel := make(chan string)
	go func() {
		err := projects.ProjectEvents(projectEventChannel, mongodb.MgoClient, mongodbOperator)
		if err != nil {
			logrus.Error(err.Error())
		}
	}()

	logrus.Printf("chaos manager running at http://localhost:%s", utils.Config.HttpPort)
	logrus.Fatal(http.ListenAndServe(":"+utils.Config.HttpPort, router))
}

// startGRPCServer initializes, registers services to and starts the gRPC server for RPC calls
func startGRPCServer(port string, mongodbOperator mongodb.MongoOperator) {
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		logrus.Fatal("failed to listen: %w", err)
	}

	grpcServer := grpc.NewServer()

	// Register services

	pb.RegisterProjectServer(grpcServer, &projects.ProjectServer{Operator: mongodbOperator})

	logrus.Printf("GRPC server listening on %v", lis.Addr())
	logrus.Fatal(grpcServer.Serve(lis))
}
