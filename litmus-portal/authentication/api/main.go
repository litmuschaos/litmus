package main

import (
	"flag"
	"fmt"
	"litmus/litmus-portal/authentication/api/routes"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/project"
	"litmus/litmus-portal/authentication/pkg/services"
	"litmus/litmus-portal/authentication/pkg/user"
	"litmus/litmus-portal/authentication/pkg/utils"
	"runtime"
	"strconv"
	"time"

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
	log.Printf("Go Version: %s", runtime.Version())
	log.Printf("Go OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)

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
	// Version Info
	printVersion()

	db, err := utils.DatabaseConnection()
	if err != nil {
		log.Fatal("database connection error $s", err)
	}

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

	applicationService := services.NewService(userRepo, projectRepo, db)

	validatedAdminSetup(applicationService)

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
	routes.UserRouter(app, applicationService)
	routes.ProjectRouter(app, applicationService)

	err = app.Run(utils.Port)
	if err != nil {
		log.Fatalf("Failure to start litmus-portal authentication server due to %s", err)
	}
}

func validatedAdminSetup(service services.ApplicationService) {
	configs := map[string]string{"ADMIN_PASSWORD": utils.AdminPassword, "ADMIN_USERNAME": utils.AdminName, "DB_USER": utils.DBUser, "DB_SERVER": utils.DBUrl, "DB_NAME": utils.DBName, "DB_PASSWORD": utils.DBPassword, "JWT_SECRET": utils.JwtSecret}
	for configName, configValue := range configs {
		if configValue == "" {
			log.Fatalf("Config %s has not been set", configName)
		}
	}

	// Assigning UID to admin
	uID := uuid.Must(uuid.NewRandom()).String()

	// Generating password hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(utils.AdminPassword), utils.PasswordEncryptionCost)
	if err != nil {
		log.Println("Error generating password for admin")
	}
	password := string(hashedPassword)

	createdAt := strconv.FormatInt(time.Now().Unix(), 10)

	adminUser := entities.User{
		ID:        uID,
		UserName:  utils.AdminName,
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
