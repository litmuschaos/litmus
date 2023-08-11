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
	"strconv"
	"time"

	"google.golang.org/grpc"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kelseyhightower/envconfig"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

func init() {
	printVersion()

	var c utils.Configurations
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

	db := client.Database(utils.Config.DbName)

	// Creating User Collection
	err = utils.CreateCollection(utils.Config.UserCollection, db)
	if err != nil {
		log.Fatalf("failed to create collection  %s", err)
	}

	err = utils.CreateIndex(utils.Config.UserCollection, utils.Config.UsernameField, db)
	if err != nil {
		log.Fatalf("failed to create index  %s", err)
	}

	// Creating Project Collection
	err = utils.CreateCollection(utils.Config.ProjectCollection, db)
	if err != nil {
		log.Fatalf("failed to create collection  %s", err)
	}

	userCollection := db.Collection(utils.Config.UserCollection)
	userRepo := user.NewRepo(userCollection)

	projectCollection := db.Collection(utils.Config.ProjectCollection)
	projectRepo := project.NewRepo(projectCollection)

	miscRepo := misc.NewRepo(db, client)

	applicationService := services.NewService(userRepo, projectRepo, miscRepo, db)

	validatedAdminSetup(applicationService)

	go runGrpcServer(applicationService)
	runRestServer(applicationService)
}

func validatedAdminSetup(service services.ApplicationService) {
	configs := map[string]string{"ADMIN_PASSWORD": utils.Config.AdminPassword, "ADMIN_USERNAME": utils.Config.AdminUserName, "DB_USER": utils.Config.DbUser, "DB_SERVER": utils.Config.DbServer, "DB_NAME": utils.Config.DbName, "DB_PASSWORD": utils.Config.DbPassword, "JWT_SECRET": utils.Config.JwtSecret}
	for configName, configValue := range configs {
		if configValue == "" {
			log.Fatalf("Config %s has not been set", configName)
		}
	}

	// Assigning UID to admin
	uID := uuid.Must(uuid.NewRandom()).String()

	// Generating password hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(utils.Config.AdminPassword), utils.Config.PasswordEncryptionCost)
	if err != nil {
		log.Println("Error generating password for admin")
	}
	password := string(hashedPassword)

	createdAt := strconv.FormatInt(time.Now().Unix(), 10)

	adminUser := entities.User{
		ID:        uID,
		UserName:  utils.Config.AdminUserName,
		Password:  password,
		Role:      entities.RoleAdmin,
		CreatedAt: &createdAt,
	}

	_, err = service.CreateUser(&adminUser)
	if err == utils.ErrUserExists {
		log.Println("Admin already exists in the database, not creating a new admin")
	}
	if err != nil && err != utils.ErrUserExists {
		log.Panicf("Unable to create admin, error: %s", err)
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
	if utils.Config.DexEnabled {
		routes.DexRouter(app, applicationService)
	}
	routes.MiscRouter(app, applicationService)
	routes.UserRouter(app, applicationService)
	routes.ProjectRouter(app, applicationService)

	log.Infof("Listening and serving HTTP on %s", utils.Config.Port)
	err := app.Run(utils.Config.Port)
	if err != nil {
		log.Fatalf("Failure to start litmus-portal authentication server due to %s", err)
	}
}

func runGrpcServer(applicationService services.ApplicationService) {
	// Starting gRPC server
	lis, err := net.Listen("tcp", utils.Config.GrpcPort)
	if err != nil {
		log.Fatalf("Failure to start litmus-portal authentication server due"+
			" to %s", err)
	}
	grpcApplicationServer := grpcHandler.ServerGrpc{ApplicationService: applicationService}
	grpcServer := grpc.NewServer()
	grpcPresenter.RegisterAuthRpcServiceServer(grpcServer, &grpcApplicationServer)
	log.Infof("Listening and serving gRPC on %s", utils.Config.GrpcPort)
	err = grpcServer.Serve(lis)
	if err != nil {
		log.Fatalf("Failure to start litmus-portal authentication server due"+
			" to %s", err)
	}
}
