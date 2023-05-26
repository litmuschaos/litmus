package main

import (
	"github.com/harness/hce-saas/graphql/server/pkg/database/mongodb"
	"github.com/harness/hce-saas/graphql/server/pkg/handlers"
	"github.com/harness/hce-saas/graphql/server/pkg/projects"
	"github.com/harness/hce-saas/graphql/server/pkg/version"
	pb "github.com/harness/hce-saas/graphql/server/protos"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph"
	"net"
	"net/http"
	"runtime"
	"time"

	"github.com/kelseyhightower/envconfig"

	"github.com/99designs/gqlgen/graphql/handler/extension"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"

	"github.com/rs/cors"
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
	//segmentRepo := metrics.NewSegmentRepository(utils.Config.SegmentApiKey)
	//segmentRepo.Init()

}

func main() {
	var err error
	mongodb.MgoClient, err = mongodb.MongoConnection()
	if err != nil {
		logrus.Fatal(err)
	}

	mongoClient := mongodb.Client.Initialize(mongodb.MgoClient)

	var mongodbOperator mongodb.MongoOperator = mongodb.NewMongoOperations(mongoClient)
	// TODO: remove this when all packages shift to interface pattern
	mongodb.Operator = mongodbOperator
	//
	//if err := validateVersion(); err != nil {
	//	logrus.Fatal(err)
	//}

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

	router := mux.NewRouter()

	router.Use(cors.New(cors.Options{
		AllowedHeaders:   []string{"*"},
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
	}).Handler)

	// routers
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", authorization.Middleware(srv))
	router.Handle("/readiness", handlers.ReadinessHandler(srv, mongodb.MgoClient))

	router.HandleFunc("/file/{key}{path:.yaml}", handlers.FileHandler)
	router.HandleFunc("/status", handlers.StatusHandler)
	router.HandleFunc("/version", version.InitVersionInfo)

	projectEventChannel := make(chan string)
	go func() {
		err := projects.ProjectEvents(projectEventChannel, mongodb.MgoClient)
		if err != nil {

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
