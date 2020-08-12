package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller/user"
)

const (
	loginRoute          = "/login"
	updatePasswordRoute = "/update/password"
	resetPasswordRoute  = "/reset/password"
	createRoute         = "/create"
	updateDetailsRoute  = "/update/details"
	getUsersRoute       = "/users"
	logoutRoute         = "/logout"
)

var (
	userController controller.UserController = user.New()
)

// New will create a new routes
func New() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AddAllowHeaders("Access-Control-Allow-Origin")
	config.AllowAllOrigins = true

	router.Use(cors.New(config))

	// Handle the request for chaos-schedule
	router.GET(getUsersRoute, userController.GetAllUsers)
	router.POST(logoutRoute, userController.Logout)
	router.POST(loginRoute, userController.Login)
	router.POST(updatePasswordRoute, userController.UpdatePassword)
	router.POST(createRoute, userController.Create)
	router.POST(updateDetailsRoute, userController.UpdateUserDetails)
	router.POST(resetPasswordRoute, userController.ResetPassword)
	return router
}
