package main

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"litmus/litmus-portal/authentication/api/routes"
	"litmus/litmus-portal/authentication/pkg/user"
	"log"
	"os"
	"time"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	db, err := DatabaseConnection()
	if err != nil {
		log.Fatal("Database Connection Error $s", err)
	}
	fmt.Println("Database connection success!")

	userCollection := db.Collection("users")
	userRepo := user.NewRepo(userCollection)
	userService := user.NewService(userRepo)
	r := gin.Default()
	routes.UserRouter(r, userService)
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "litmus-portal authentication server is running",
		})
	})
	r.Run()
}

func DatabaseConnection() (*mongo.Database, error) {
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("MONGO_URI")))
	if err != nil {
		return nil, err
	}
	db := client.Database(os.Getenv("DB_NAME"))
	return db, nil
}
