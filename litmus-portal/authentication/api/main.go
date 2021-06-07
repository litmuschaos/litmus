package main

import (
	"context"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"litmus/litmus-portal/authentication/api/routes"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/user"
	"litmus/litmus-portal/authentication/pkg/utils"
	"log"
	"time"
)

func main() {
	db, err := DatabaseConnection()
	if err != nil {
		log.Fatal("Database Connection Error $s", err)
	}
	userCollection := db.Collection("users")
	userRepo := user.NewRepo(userCollection)
	userService := user.NewService(userRepo)
	validatedAdminSetup(userService)

	gin.SetMode(gin.ReleaseMode)
	gin.EnableJsonDecoderDisallowUnknownFields()
	app := gin.Default()
	config := cors.DefaultConfig()
	config.AddAllowHeaders("Access-Control-Allow-Origin")
	config.AllowAllOrigins = true
	app.Use(cors.New(config))
	routes.UserRouter(app, userService)
	err = app.Run()
	if err != nil {
		log.Fatalf("Failure to start litmus-portal authentication server due to %s", err)
	}
}

func DatabaseConnection() (*mongo.Database, error) {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	mongoURI := fmt.Sprintf("mongodb://%s:%s@%s:27017", utils.DBUser, utils.DBPassword, utils.DBUrl)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		return nil, err
	}
	db := client.Database(utils.DBName)
	return db, nil
}

func validatedAdminSetup(service user.Service) {
	configs := map[string]string{"ADMIN_PASSWORD": utils.AdminPassword, "ADMIN_USERNAME": utils.AdminName, "DB_USER": utils.DBUser, "DB_SERVER": utils.DBUrl, "DB_NAME": utils.DBName, "DB_PASSWORD": utils.DBPassword, "JW_SECRET": utils.JwtSecret}
	for configName, configValue := range configs {
		if configValue == "" {
			log.Fatalf("Config %s has not been set", configName)
		}
	}
	adminUser := &entities.User{
		UserName: utils.AdminName,
		Password: utils.AdminPassword,
		Role:     entities.RoleAdmin,
	}
	_, err := service.CreateUser(adminUser)
	if err != nil {
		log.Panicf("Unable to create admin, error: %s", err)
	}
}
