package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller/user"
)

const (
	loginRoute  = "/login"
	updateRoute = "/update"
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
	router.POST(updateRoute, userController.Update)

	return router
}
