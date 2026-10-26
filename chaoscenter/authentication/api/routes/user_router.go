package routes

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/middleware"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

// UserRouter creates all the required routes for user authentications purposes.
func UserRouter(router *gin.Engine, service services.ApplicationService) {
	router.POST("/login", rest.LoginUser(service))
	router.POST("/logout", rest.LogoutUser(service))
	router.Use(middleware.JwtMiddleware(service))
	router.GET("/token/:uid", rest.GetApiTokens(service))
	router.POST("/create_token", rest.CreateApiToken(service))
	router.POST("/remove_token", rest.DeleteApiToken(service))
	router.POST("/update/password", rest.UpdatePassword(service))
	router.POST("/reset/password", rest.ResetPassword(service))
	router.POST("/create_user", rest.CreateUser(service))
	router.POST("/update/details", rest.UpdateUser(service))
	router.GET("/get_user/:uid", rest.GetUser(service))
	router.GET("/users", rest.FetchUsers(service))
	router.GET("/invite_users/:project_id", rest.InviteUsers(service))
	router.POST("/update/state", rest.UpdateUserState(service))
}
