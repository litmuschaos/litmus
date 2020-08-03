package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller"
	github "github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller/GithubUser"
	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/controller/user"
)

const (
	loginRoute     = "/login"
	updateRoute    = "/update"
	githubMidRoute = "/login/github"
	oauthRoute     = "/oauth/github"
)

var (
	userController   controller.UserController   = user.New()
	GithubController controller.GithubController = github.New()
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
	router.GET(githubMidRoute, GithubController.Login)
	router.GET(oauthRoute, GithubController.OAuth)
	return router
}
