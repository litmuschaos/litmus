package routes

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/user"
)

func UserRouter(router *gin.Engine, service user.Service) {
	router.POST("/login", loginUser(service))
	router.POST("/update/password", updatePassword(service))
	router.POST("/reset/password", resetPassword(service))
	router.POST("/users", createUser(service))
	router.POST("/update/details", updateUser(service))
	router.GET("/users", fetchUsers(service))
}

func createUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			fmt.Println(err)
		}
		userRec, err := service.CreateUser(&userRequest)
		c.JSON(200, userRec)
	}
}
func updateUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			fmt.Println(err)
		}
		userRec, err := service.UpdateUser(&userRequest)
		c.JSON(200, userRec)
	}
}
func fetchUsers(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		users, err := service.GetUsers()
		if err != nil {
			fmt.Println(err)
			c.JSON(500, gin.H{
				"message": "error has occured",
			})
			return
		}
		c.JSON(200, users)
	}
}

func loginUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			fmt.Println(err)
		}
		authenticatedUser, err := service.FindUser(&userRequest)
		if err != nil {
			fmt.Println(err)
			c.JSON(404, gin.H{
				"message": "invalid user",
			})
			return
		}
		c.JSON(200, authenticatedUser)
	}
}

func updatePassword(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var adminUser entities.User
		adminUser.UserName = "admin"
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		if err != nil {
			fmt.Println(err)
		}
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			fmt.Println(err)
		}
		err = service.UpdatePassword(&userPasswordRequest, false)
		if err != nil {
			fmt.Println(err)
		}
		c.JSON(200, gin.H{
			"message": "password has been reset",
		})
	}
}

func resetPassword(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var adminUser entities.User
		adminUser.UserName = "admin"
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		userPasswordRequest.Username = "admin"
		adminUser.ID, _ = primitive.ObjectIDFromHex("60bceb8cc06369ba0886a902")
		if err != nil {
			fmt.Println(err)
		}
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			c.JSON(500, gin.H{
				"message": err.Error(),
			})
			fmt.Println(err)
			return
		}
		err = service.UpdatePassword(&userPasswordRequest, true)
		if err != nil {
			c.JSON(500, gin.H{
				"message": err.Error(),
			})
			fmt.Println(err)
			return
		}
		c.JSON(200, gin.H{
			"message": "password has been reset",
		})
	}
}
