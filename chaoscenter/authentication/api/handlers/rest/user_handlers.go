package rest

import (
	"net/http"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
)

const BearerSchema = "Bearer "

// CreateUser		godoc
//
//	@Description	Create new user.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		400	{object}	response.ErrInvalidEmail
//	@Failure		401	{object}	response.ErrUserExists
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.UserResponse{}
//	@Router			/create_user [post]
func CreateUser(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.MustGet("role").(string)

		if entities.Role(userRole) != entities.RoleAdmin {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		if userRequest.Role != entities.RoleUser && userRequest.Role != entities.RoleAdmin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		userRequest.Username = utils.SanitizeString(userRequest.Username)
		if userRequest.Role == "" || userRequest.Username == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Assigning UID to user
		uID := uuid.Must(uuid.NewRandom()).String()
		userRequest.ID = uID

		// Generating password hash
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userRequest.Password), utils.PasswordEncryptionCost)
		if err != nil {
			log.Error("auth error: Error generating password")
		}
		password := string(hashedPassword)
		userRequest.Password = password

		// Validating email address
		if userRequest.Email != "" {
			if !userRequest.IsEmailValid(userRequest.Email) {
				log.Error("auth error: invalid email")
				c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidEmail], presenter.CreateErrorResponse(utils.ErrInvalidEmail))
				return
			}
		}

		createdAt := time.Now().UnixMilli()
		userRequest.CreatedAt = createdAt

		userResponse, err := service.CreateUser(&userRequest)
		if err == utils.ErrUserExists {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserExists], presenter.CreateErrorResponse(utils.ErrUserExists))
			return
		}
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, userResponse)
	}
}

// UpdateUser		godoc
//
//	@Description	Update users details.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/update/details [post]
func UpdateUser(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.UserDetails
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		uid := c.MustGet("uid").(string)
		userRequest.ID = uid

		// Checking if password is updated
		if userRequest.Password != "" {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userRequest.Password), utils.PasswordEncryptionCost)
			if err != nil {
				return
			}
			userRequest.Password = string(hashedPassword)
		}

		err = service.UpdateUser(&userRequest)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
		}
		c.JSON(http.StatusOK, gin.H{"message": "User details updated successfully"})
	}
}

// GetUser		godoc
//
//	@Description	Get user.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrUserNotFound
//	@Success		200	{object}	response.UserResponse{}
//	@Router			/get_user/:uid [get]
//
// GetUser returns the user that matches the uid passed in parameter
func GetUser(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Param("uid")
		user, err := service.GetUser(uid)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}
		c.JSON(http.StatusOK, user)
	}
}

// FetchUsers		godoc
//
//	@Description	Fetch users.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.UserResponse{}
//	@Router			/users [get]
func FetchUsers(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.MustGet("role").(string)

		if entities.Role(userRole) != entities.RoleAdmin {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
		users, err := service.GetUsers()
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(http.StatusOK, users)
	}
}

// InviteUsers		godoc
//
//	@Description	Invite users.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.UserResponse{}
//	@Router			/invite_users/:project_id [get]
func InviteUsers(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("project_id")
		if projectID == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		projectMembers, err := service.GetProjectMembers(projectID, "all")

		var uids []string
		for _, k := range projectMembers {
			uids = append(uids, k.UserID)
		}
		users, err := service.InviteUsers(uids)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": users})
	}
}

// LoginUser		godoc
//
//	@Description	User Login.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		400	{object}	response.ErrUserNotFound
//	@Failure		400	{object}	response.ErrUserDeactivated
//	@Failure		400	{object}	response.ErrInvalidCredentials
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.LoginResponse{}
//	@Router			/login [post]
func LoginUser(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.User
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		userRequest.Username = utils.SanitizeString(userRequest.Username)
		if userRequest.Username == "" || userRequest.Password == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Checking if user exists
		user, err := service.FindUserByUsername(userRequest.Username)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}

		// Checking if user is deactivated
		if user.DeactivatedAt != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserDeactivated], presenter.CreateErrorResponse(utils.ErrUserDeactivated))
			return
		}

		// Validating password
		err = service.CheckPasswordHash(user.Password, userRequest.Password)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidCredentials], presenter.CreateErrorResponse(utils.ErrInvalidCredentials))
			return
		}

		token, err := service.GetSignedJWT(user)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		expiryTime := time.Duration(utils.JWTExpiryDuration) * 60

		var defaultProject string
		ownerProjects, err := service.GetOwnerProjectIDs(c, user.ID)

		if len(ownerProjects) > 0 {
			defaultProject = ownerProjects[0].ID
		} else {
			// Adding user as project owner in project's member list
			newMember := &entities.Member{
				UserID:     user.ID,
				Role:       entities.RoleOwner,
				Invitation: entities.AcceptedInvitation,
				Username:   user.Username,
				Name:       user.Name,
				Email:      user.Email,
				JoinedAt:   time.Now().UnixMilli(),
			}
			var members []*entities.Member
			members = append(members, newMember)
			state := "active"
			newProject := &entities.Project{
				ID:      uuid.Must(uuid.NewRandom()).String(),
				Name:    user.Username + "-project",
				Members: members,
				State:   &state,
				Audit: entities.Audit{
					IsRemoved: false,
					CreatedAt: time.Now().UnixMilli(),
					CreatedBy: entities.UserDetailResponse{
						Username: user.Username,
						UserID:   user.ID,
						Email:    user.Email,
					},
					UpdatedAt: time.Now().UnixMilli(),
					UpdatedBy: entities.UserDetailResponse{
						Username: user.Username,
						UserID:   user.ID,
						Email:    user.Email,
					},
				},
			}
			err := service.CreateProject(newProject)
			if err != nil {
				return
			}
			defaultProject = newProject.ID
		}

		c.JSON(http.StatusOK, gin.H{
			"accessToken": token,
			"projectID":   defaultProject,
			"projectRole": entities.RoleOwner,
			"expiresIn":   expiryTime,
			"type":        "Bearer",
		})
	}
}

// LogoutUser		godoc
//
//	@Description	Revokes the token passed in the Authorization header.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/logout [post]
//
// LogoutUser revokes the token passed in the Authorization header
func LogoutUser(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
		tokenString := authHeader[len(BearerSchema):]
		// revoke token
		err := service.RevokeToken(tokenString)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "successfully logged out",
		})
	}
}

// UpdatePassword		godoc
//
//	@Description	Update user password.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrStrictPasswordPolicyViolation
//	@Failure		401	{object}	response.ErrInvalidCredentials
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/update/password [post]
func UpdatePassword(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		username := c.MustGet("username").(string)
		userPasswordRequest.Username = username
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
		c.JSON(http.StatusOK, gin.H{
			"message": "password has been updated successfully",
		})
	}
}

// ResetPassword		godoc
//
//	@Description	Reset user password.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrStrictPasswordPolicyViolation
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/reset/password [post]
func ResetPassword(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.MustGet("role").(string)

		if entities.Role(userRole) != entities.RoleAdmin {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		var userPasswordRequest entities.UserPassword
		err := c.BindJSON(&userPasswordRequest)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		uid := c.MustGet("uid").(string)
		var adminUser entities.User
		adminUser.Username = c.MustGet("username").(string)
		adminUser.ID = uid
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
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
		err = service.UpdatePassword(&userPasswordRequest, false)
		if err != nil {
			log.Error(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "password has been reset successfully",
		})
	}
}

// UpdateUserState		godoc
//
//	@Description	Updates the user state.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/update/state [post]
func UpdateUserState(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {

		userRole := c.MustGet("role").(string)

		if entities.Role(userRole) != entities.RoleAdmin {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		var userRequest entities.UpdateUserState
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Info(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if userRequest.IsDeactivate == nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		var adminUser entities.User
		adminUser.Username = c.MustGet("username").(string)
		adminUser.ID = c.MustGet("uid").(string)

		// Checking if loggedIn user is admin
		err = service.IsAdministrator(&adminUser)
		if err != nil {
			log.Info(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		// Transaction to update state in user and project collection
		err = service.UpdateStateTransaction(userRequest)
		if err != nil {
			log.Info(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[err], presenter.CreateErrorResponse(err))
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "user's state updated successfully",
		})
	}
}

// CreateApiToken		godoc
//
//	@Description	Creates a new api token for the user.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		400	{object}	response.ErrUserNotFound
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.NewApiToken{}
//	@Router			/create_token [post]
//
// CreateApiToken creates a new api token for the user
func CreateApiToken(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var apiTokenRequest entities.ApiTokenInput
		err := c.BindJSON(&apiTokenRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Checking if user exists
		user, err := service.GetUser(apiTokenRequest.UserID)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}

		if token, err := service.CreateApiToken(user, apiTokenRequest); err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		} else {
			c.JSON(http.StatusOK, gin.H{
				"accessToken": token,
				"type":        "Bearer",
			})
		}
	}
}

// GetApiTokens		godoc
//
//	@Description	Returns all the api tokens for the user.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.ApiTokenResponse{}
//	@Router			/token/:uid [post]
//
// GetApiTokens returns all the api tokens for the user
func GetApiTokens(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Param("uid")
		apiTokens, err := service.GetApiTokensByUserID(uid)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"apiTokens": apiTokens,
		})
	}
}

// DeleteApiToken		godoc
//
//	@Description	Delete api token for the user.
//	@Tags			UserRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/remove_token [post]
//
// DeleteApiToken deletes the api token for the user
func DeleteApiToken(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var deleteApiTokenRequest entities.DeleteApiTokenInput
		err := c.BindJSON(&deleteApiTokenRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		token := deleteApiTokenRequest.Token
		err = service.DeleteApiToken(token)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		if err = service.RevokeToken(token); err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		} else {
			c.JSON(http.StatusOK, gin.H{
				"message": "api token deleted successfully",
			})
		}
	}
}
