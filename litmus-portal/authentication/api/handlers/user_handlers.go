package handlers

import (
	"litmus/litmus-portal/authentication/api/presenter"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/user"
	"litmus/litmus-portal/authentication/pkg/utils"
	"time"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.MustGet("role").(string)
		if entities.Role(userRole) != entities.RoleAdmin {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorised], presenter.CreateErrorResponse(utils.ErrUnauthorised))
			return
		}
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if userRequest.Role == "" || userRequest.UserName == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		userRequest.UserName = utils.SanitizeString(userRequest.UserName)
		userResponse, err := service.CreateUser(&userRequest)
		if err == utils.ErrUserExists {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserExists], presenter.CreateErrorResponse(utils.ErrUserExists))
			return
		}
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, userResponse)
	}
}
func UpdateUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		userResponse, err := service.UpdateUser(&userRequest)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
		}
		c.JSON(200, userResponse)
	}
}
func FetchUsers(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		users, err := service.GetUsers()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, users)
	}
}

func LoginUser(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if userRequest.UserName == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		userRequest.UserName = utils.SanitizeString(userRequest.UserName)
		authenticatedUser, err := service.FindUser(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidCredentials], presenter.CreateErrorResponse(utils.ErrInvalidCredentials))
			return
		}
		token, err := authenticatedUser.GetSignedJWT()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		expiryTime := time.Duration(utils.JWTExpiryDuration) * 60
		c.JSON(200, gin.H{
			"access_token": token,
			"expires_in":   expiryTime,
			"type":         "Bearer",
		})
	}
}

func UpdatePassword(service user.Service) gin.HandlerFunc {
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
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if userPasswordRequest.OldPassword == "" || userPasswordRequest.NewPassword == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		err = service.UpdatePassword(&userPasswordRequest, true)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidCredentials], presenter.CreateErrorResponse(utils.ErrInvalidCredentials))
			return
		}
		c.JSON(200, gin.H{
			"message": "password has been reset",
		})
	}
}

func ResetPassword(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet("uid").(string)
		var adminUser entities.User
		adminUser.UserName = c.MustGet("username").(string)
		adminUser.ID, _ = primitive.ObjectIDFromHex(uid)
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if userPasswordRequest.Username == "" || userPasswordRequest.NewPassword == "" {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			log.Info(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorised], presenter.CreateErrorResponse(utils.ErrUnauthorised))
			return
		}
		err = service.UpdatePassword(&userPasswordRequest, false)
		if err != nil {
			log.Error(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, gin.H{
			"message": "password has been reset successfully",
		})
	}
}
