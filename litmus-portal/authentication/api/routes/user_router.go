package routes

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/user"
)

func UserRouter(router *gin.Engine, service user.Service) {
	router.POST("/users", createUser(service))
	router.POST("/update/details", updateUser(service))
	router.GET("/users", fetchUsers(service))
}

func createUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var dummyUser entities.User
		err := c.BindJSON(&dummyUser)
		if err != nil {
			fmt.Println(err)
		}
		userRec, err := service.CreateUser(&dummyUser)
		c.JSON(200, gin.H{
			"message": userRec,
		})
	}
}
func updateUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var dummyUser entities.User
		err := c.BindJSON(&dummyUser)
		if err != nil {
			fmt.Println(err)
		}
		userRec, err := service.UpdateUser(&dummyUser)
		c.JSON(200, gin.H{
			"message": userRec,
		})
	}
}
func fetchUsers(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		users, err := service.GetUsers()
		if err != nil {
			fmt.Println(err)
			c.JSON(500, gin.H{
				"message": "F",
			})
			return
		}
		c.JSON(200, gin.H{
			"message": users,
		})
	}
}
