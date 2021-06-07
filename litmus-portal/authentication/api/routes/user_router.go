package routes

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"litmus/litmus-portal/authentication/api/middleware"
	"litmus/litmus-portal/authentication/api/presenter"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/user"
	"litmus/litmus-portal/authentication/pkg/utils"
)

func UserRouter(router *gin.Engine, service user.Service) {
	router.POST("/login", loginUser(service))
	router.Use(middleware.JwtMiddleware())
	router.POST("/update/password", updatePassword(service))
	router.POST("/reset/password", resetPassword(service))
	router.POST("/create", createUser(service))
	router.POST("/update/details", updateUser(service))
	router.GET("/users", fetchUsers(service))
}

func createUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.MustGet("role").(string)
		if entities.Role(userRole) != entities.RoleAdmin {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorised], presenter.CreateErrorResponse(utils.ErrUnauthorised))
			return
		}
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			fmt.Println(err)
			return
		}
		if userRequest.Role == "" || userRequest.UserName == "" || userRequest.Password == "" || userRequest.Email == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
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
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		userRec, err := service.UpdateUser(&userRequest)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
		}
		c.JSON(200, userRec)
	}
}
func fetchUsers(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		users, err := service.GetUsers()
		if err != nil {
			fmt.Println(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
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
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if userRequest.UserName == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		authenticatedUser, err := service.FindUser(&userRequest)
		if err != nil {
			fmt.Println(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidCredentials], presenter.CreateErrorResponse(utils.ErrInvalidCredentials))
			return
		}
		token, err := authenticatedUser.GetSignedJWT()
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, gin.H{
			"access_token": token,
			"expires_in":   86400,
			"type":         "Bearer",
		})
	}
}

func updatePassword(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.MustGet("username").(string)
		uid := c.MustGet("uid").(string)
		var adminUser entities.User
		adminUser.UserName = username
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		userPasswordRequest.Username = username
		adminUser.ID, _ = primitive.ObjectIDFromHex(uid)
		if err != nil {
			fmt.Println(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if userPasswordRequest.OldPassword == "" || userPasswordRequest.NewPassword == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorised], presenter.CreateErrorResponse(utils.ErrUnauthorised))
			fmt.Println(err)
			return
		}
		err = service.UpdatePassword(&userPasswordRequest, true)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, gin.H{
			"message": "password has been reset",
		})
	}
}

func resetPassword(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var adminUser entities.User
		adminUser.UserName = c.MustGet("username").(string)
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		if err != nil {
			fmt.Println(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if userPasswordRequest.Username == "" || userPasswordRequest.NewPassword == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorised], presenter.CreateErrorResponse(utils.ErrUnauthorised))
			return
		}
		err = service.UpdatePassword(&userPasswordRequest, false)
		if err != nil {
			fmt.Println(err)
		}
		c.JSON(200, gin.H{
			"message": "password has been reset successfully",
		})
	}
}
