package main

import (
	"flag"
	"fmt"
	grpcHandler "litmus/litmus-portal/authentication/api/handlers/grpc"
	grpcPresenter "litmus/litmus-portal/authentication/api/presenter/protos"
	"litmus/litmus-portal/authentication/api/routes"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/misc"
	"litmus/litmus-portal/authentication/pkg/project"
	"litmus/litmus-portal/authentication/pkg/services"
	"litmus/litmus-portal/authentication/pkg/user"
	"litmus/litmus-portal/authentication/pkg/utils"
	"net"
	"runtime"
	"time"

	"google.golang.org/grpc"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

type Config struct {
	JwtSecret     string `required:"true" split_words:"true"`
	AdminUsername string `required:"true" split_words:"true"`
	AdminPassword string `required:"true" split_words:"true"`
	DbServer      string `required:"true" split_words:"true"`
	DbUser        string `required:"true" split_words:"true"`
	DbPassword    string `required:"true" split_words:"true"`
}

func init() {
	printVersion()

	var c Config

	err := envconfig.Process("", &c)
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	// send logs to stderr so we can use 'kubectl logs'
	_ = flag.Set("logtostderr", "true")
	_ = flag.Set("v", "3")

	flag.Parse()

	client, err := utils.MongoConnection()
	if err != nil {
		log.Fatal("database connection error $s", err)
	}

	db := client.Database(utils.DBName)

	// Creating User Collection
	err = utils.CreateCollection(utils.UserCollection, db)
	if err != nil {
		log.Fatalf("failed to create collection  %s", err)
	}

	err = utils.CreateIndex(utils.UserCollection, utils.UsernameField, db)
	if err != nil {
		log.Fatalf("failed to create index  %s", err)
	}

	// Creating Project Collection
	err = utils.CreateCollection(utils.ProjectCollection, db)
	if err != nil {
		log.Fatalf("failed to create collection  %s", err)
	}

	userCollection := db.Collection(utils.UserCollection)
	userRepo := user.NewRepo(userCollection)

	projectCollection := db.Collection(utils.ProjectCollection)
	projectRepo := project.NewRepo(projectCollection)

	miscRepo := misc.NewRepo(db, client)

	applicationService := services.NewService(userRepo, projectRepo, miscRepo, db)

	validatedAdminSetup(applicationService)

	go runGrpcServer(applicationService)
	runRestServer(applicationService)
}

func validatedAdminSetup(service services.ApplicationService) {

	// Assigning UID to admin
	uID := uuid.Must(uuid.NewRandom()).String()

	// Generating password hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(utils.AdminPassword), utils.PasswordEncryptionCost)
	if err != nil {
		log.Println("Error generating password for admin")
	}
	password := string(hashedPassword)

	adminUser := entities.User{
		ID:       uID,
		UserName: utils.AdminName,
		Password: password,
		Role:     entities.RoleAdmin,
		Audit: entities.Audit{
			CreatedAt: time.Now().UnixMilli(),
			UpdatedAt: time.Now().UnixMilli(),
		},
	}

	_, err = service.CreateUser(&adminUser)
	if err != nil && err == utils.ErrUserExists {
		log.Println("Admin already exists in the database, not creating a new admin")
	} else if err != nil {
		log.Panicf("Unable to create admin, error: %v", err)
	}
}

func printVersion() {
	log.Info(fmt.Sprintf("Go Version: %s", runtime.Version()))
	log.Info(fmt.Sprintf("Go OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH))
}

func runRestServer(applicationService services.ApplicationService) {
	// Starting REST server using Gin
	gin.SetMode(gin.ReleaseMode)
	gin.EnableJsonDecoderDisallowUnknownFields()
	app := gin.Default()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))
	// Enable dex routes only if passed via environment variables
	if utils.DexEnabled {
		routes.DexRouter(app, applicationService)
	}
	routes.MiscRouter(app, applicationService)
	routes.UserRouter(app, applicationService)
	routes.ProjectRouter(app, applicationService)

	log.Infof("Listening and serving HTTP on %s", utils.Port)
	err := app.Run(utils.Port)
	if err != nil {
		log.Fatalf("Failure to start litmus-portal authentication REST server due to %v", err)
	}
}

func runGrpcServer(applicationService services.ApplicationService) {
	// Starting gRPC server
	lis, err := net.Listen("tcp", utils.GrpcPort)
	if err != nil {
		log.Fatalf("Failure to start litmus-portal authentication server due"+
			" to %s", err)
	}
	grpcApplicationServer := grpcHandler.ServerGrpc{ApplicationService: applicationService}
	grpcServer := grpc.NewServer()
	grpcPresenter.RegisterAuthRpcServiceServer(grpcServer, &grpcApplicationServer)
	log.Infof("Listening and serving gRPC on %s", utils.GrpcPort)
	err = grpcServer.Serve(lis)
	if err != nil {
		log.Fatalf("Failure to start litmus-portal authentication GRPC server due to %v", err)
	}
}
