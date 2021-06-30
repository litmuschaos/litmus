package handlers

import (
	"litmus/litmus-portal/authentication/api/presenter"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/user"
	"litmus/litmus-portal/authentication/pkg/utils"
	"time"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
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
		userRequest.UserName = utils.SanitizeString(userRequest.UserName)
		if userRequest.Role == "" || userRequest.UserName == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
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
		userRequest.UserName = utils.SanitizeString(userRequest.UserName)
		if userRequest.UserName == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Checking if user exists
		user, err := service.FindUser(userRequest.UserName)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}

		// Checking if user is removed
		if user.RemovedAt != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserRemoved], presenter.CreateErrorResponse(utils.ErrUserRemoved))
			return
		}

		// Validating password
		err = service.CheckPasswordHash(user.Password, userRequest.Password)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidCredentials], presenter.CreateErrorResponse(utils.ErrInvalidCredentials))
			return
		}

		token, err := user.GetSignedJWT()
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
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		userPasswordRequest.Username = username
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if utils.StrictPasswordPolicy {
			err := utils.ValidateStrictPassword(userPasswordRequest.NewPassword)
			if err != nil {
				c.JSON(utils.ErrorStatusCodes[utils.ErrStrictPasswordPolicyViolation], presenter.CreateErrorResponse(utils.ErrStrictPasswordPolicyViolation))
				return
			}
		}
		if userPasswordRequest.NewPassword == "" {
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
		adminUser.ID = uid
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if utils.StrictPasswordPolicy {
			err := utils.ValidateStrictPassword(userPasswordRequest.NewPassword)
			if err != nil {
				c.JSON(utils.ErrorStatusCodes[utils.ErrStrictPasswordPolicyViolation], presenter.CreateErrorResponse(utils.ErrStrictPasswordPolicyViolation))
				return
			}
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

func UpdateUserState(service user.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var adminUser entities.User
		adminUser.UserName = c.MustGet("username").(string)
		adminUser.ID = c.MustGet("uid").(string)
		var request entities.UpdateUserState
		err := c.BindJSON(&request)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Checking if loggedIn user is admin
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			log.Info(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorised], presenter.CreateErrorResponse(utils.ErrUnauthorised))
			return
		}

		// Checking if user exists
		user, err := service.FindUser(request.Username)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}

		// Checking if updated user is admin
		if user.Role == entities.RoleAdmin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrUpdatingAdmin], presenter.CreateErrorResponse(utils.ErrUpdatingAdmin))
			return
		}

		if request.IsDisable == true {
			// Checking if user is already removed
			if user.RemovedAt != nil {
				c.JSON(utils.ErrorStatusCodes[utils.ErrUserAlreadyRemoved], presenter.CreateErrorResponse(utils.ErrUserAlreadyRemoved))
				return
			}
		}

		err = service.UpdateUserState(request.Username, request.IsDisable)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, gin.H{
			"message": "user's state updated successfully",
		})
	}
}
