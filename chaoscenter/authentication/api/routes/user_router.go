package routes

import (
	"litmus/litmus-portal/authentication/api/handlers/rest"
	"litmus/litmus-portal/authentication/api/middleware"
	"litmus/litmus-portal/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

// UserRouter creates all the required routes for user authentications purposes.
func UserRouter(router *gin.Engine, service services.ApplicationService) {
	router.POST("/login", rest.LoginUser(service))
	router.Use(middleware.JwtMiddleware())
	router.POST("/update/password", rest.UpdatePassword(service))
	router.POST("/reset/password", rest.ResetPassword(service))
	router.POST("/create", rest.CreateUser(service))
	router.POST("/update/details", rest.UpdateUser(service))
	router.GET("/getUser/:uid", rest.GetUser(service))
	router.GET("/users", rest.FetchUsers(service))
	router.POST("/update/state", rest.UpdateUserState(service))
}
