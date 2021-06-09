package routes

import (
	"github.com/gin-gonic/gin"
	"litmus/litmus-portal/authentication/api/handlers"
	"litmus/litmus-portal/authentication/api/middleware"
	"litmus/litmus-portal/authentication/pkg/user"
)

//UserRouter creates all the required routes for user authentications purposes.
func UserRouter(router *gin.Engine, service user.Service) {
	router.POST("/login", handlers.LoginUser(service))
	router.Use(middleware.JwtMiddleware())
	router.POST("/update/password", handlers.UpdatePassword(service))
	router.POST("/reset/password", handlers.ResetPassword(service))
	router.POST("/create", handlers.CreateUser(service))
	router.POST("/update/details", handlers.UpdateUser(service))
	router.GET("/users", handlers.FetchUsers(service))
}
