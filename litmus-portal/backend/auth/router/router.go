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
	createRoute         = "/create"
	updateUserIDRoute   = "/update/userID"
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
	router.POST(loginRoute, userController.Login)
	router.POST(updatePasswordRoute, userController.UpdatePassword)
	router.POST(updateUserIDRoute, userController.UpdateUserID)
	router.POST(createRoute, userController.Create)

	return router
}
