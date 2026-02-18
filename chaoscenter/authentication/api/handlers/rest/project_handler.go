package rest

import (
	"errors"
	"net/http"
	"time"

	response "github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/types"
	projectUtils "github.com/litmuschaos/litmus/chaoscenter/authentication/api/utils"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/validations"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// GetUserWithProject 		godoc
//
//	@Summary		Get user with project.
//	@Description	Return users who have a project.
//	@Tags			ProjectRouter
//	@Param			username	path	string	true	"Username"
//	@Accept			json
//	@Produce		json
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		400	{object}	response.ErrUserNotFound
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.UserWithProject{}
//	@Router			/get_user_with_project/:username [get]
//
// GetUserWithProject returns user and project details based on username
func GetUserWithProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		// Validating logged-in user
		// Must be either requesting info from the logged-in user
		// or any user if it has the admin role
		role := c.MustGet("role").(string)
		if c.MustGet("username").(string) != username && role != string(entities.RoleAdmin) {
			log.Error("auth error: unauthorized")
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		user, err := service.FindUserByUsername(username)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		}

		request := projectUtils.GetProjectFilters(c)
		request.UserID = user.ID

		res, err := service.GetProjectsByUserID(request)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		outputUser := entities.UserWithProject{
			Username: user.Username,
			ID:       user.ID,
			Email:    user.Email,
			Name:     user.Name,
			Projects: res.Projects,
		}

		c.JSON(http.StatusOK, response.UserWithProject{Data: outputUser})
	}
}

// GetProject 		godoc
//
//	@Summary		Get user with project.
//	@Description	Return a project.
//	@Tags			ProjectRouter
//	@Param			project_id	path	string	true	"Project ID"
//	@Accept			json
//	@Produce		json
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Project{}
//	@Router			/get_project/:project_id [get]
//
// GetProject queries the project with a given projectID from the database
func GetProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("project_id")
		userRole := c.MustGet("role").(string)

		if userRole != string(entities.RoleAdmin) {
			err := validations.RbacValidator(c.MustGet("uid").(string), projectID,
				validations.MutationRbacRules["getProject"], string(entities.AcceptedInvitation), service)
			if err != nil {
				log.Warn(err)
				c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
					presenter.CreateErrorResponse(utils.ErrUnauthorized))
				return
			}
		}

		project, err := service.GetProjectByProjectID(projectID)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.Project{Data: *project})
	}
}

// GetProjectsByUserID 		godoc
//
//	@Summary		Get stats of a project.
//	@Description	Return stats of a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.ListProjectResponse{}
//	@Router			/list_projects [get]
//
// GetProjectsByUserID queries the project with a given userID from the database and returns it in the appropriate format
func GetProjectsByUserID(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		request := projectUtils.GetProjectFilters(c)

		res, err := service.GetProjectsByUserID(request)
		if res == nil || (res.TotalNumberOfProjects != nil && *res.TotalNumberOfProjects == 0) {
			c.JSON(http.StatusOK, gin.H{
				"message": "No projects found",
			})
			return
		}
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.ListProjectResponse{Data: *res})
	}
}

// GetProjectStats 		godoc
//
//	@Summary		Get stats of a project.
//	@Description	Return stats of a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.ProjectStats{}
//	@Router			/get_projects_stats [get]
//
// GetProjectStats is used to retrieve stats related to projects in the DB
func GetProjectStats(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.MustGet("role").(string)
		if role != string(entities.RoleAdmin) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Permission denied, user is not admin",
			})
		}
		project, err := service.GetProjectStats()
		if project == nil {
			c.JSON(http.StatusOK, gin.H{
				"message": "No projects found",
			})
		}
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(http.StatusOK, response.ProjectStats{Data: project})
	}
}

// GetActiveProjectMembers 		godoc
//
//	@Summary		Get active project members.
//	@Description	Return list of active project members.
//	@Tags			ProjectRouter
//	@Param			state	path	string	true	"State"
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Members{}
//	@Router			/get_project_members/:project_id/:state [get]
//
// GetActiveProjectMembers returns the list of active project members
func GetActiveProjectMembers(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("project_id")
		state := c.Param("state")
		role := c.MustGet("role").(string)
		if role != string(entities.RoleAdmin) {
			err := validations.RbacValidator(c.MustGet("uid").(string), projectID,
				validations.MutationRbacRules["getProject"], string(entities.AcceptedInvitation), service)
			if err != nil {
				log.Warn(err)
				c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
					presenter.CreateErrorResponse(utils.ErrUnauthorized))
				return
			}
		}

		members, err := service.GetProjectMembers(projectID, state)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(http.StatusOK, response.Members{Data: members})
	}
}

// GetActiveProjectOwners 		godoc
//
//	@Summary		Get active project Owners.
//	@Description	Return list of active project owners.
//	@Tags			ProjectRouter
//	@Param			state	path	string	true	"State"
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Members{}
//	@Router			/get_project_owners/:project_id/:state [get]
//
// GetActiveProjectOwners returns the list of active project owners
func GetActiveProjectOwners(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("project_id")
		owners, err := service.GetProjectOwners(projectID)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(http.StatusOK, response.Members{Data: owners})
	}
}

// getInvitation returns the Invitation status
func getInvitation(service services.ApplicationService, member entities.MemberInput) (entities.Invitation, error) {
	project, err := service.GetProjectByProjectID(member.ProjectID)
	if err != nil {
		return "", err
	}
	for _, projectMember := range project.Members {
		if projectMember.UserID == member.UserID {
			return projectMember.Invitation, nil
		}
	}

	return "", nil
}

// ListInvitations 		godoc
//
//	@Summary		List invitations.
//	@Description	Return list of invitations.
//	@Tags			ProjectRouter
//	@Param			invitation_state	path	string	true	"Invitation State"
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.ListInvitationResponse{}
//	@Router			/list_invitations_with_filters/:invitation_state [get]
//
// ListInvitations returns the Invitation status
func ListInvitations(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uID := c.MustGet("uid").(string)
		invitationState := c.Param("invitation_state")
		var res []entities.ListInvitationResponse
		projects, err := service.ListInvitations(uID, entities.Invitation(invitationState))
		if err != nil {
			log.Errorf("Error while fetching invitations: %v", err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		for _, project := range projects {
			var inviteRes entities.ListInvitationResponse
			inviteRes.ProjectName = project.Name
			inviteRes.ProjectID = project.ID
			for _, member := range project.Members {
				if member.Role == entities.RoleOwner {
					inviteRes.ProjectOwner = *member
				} else {
					inviteRes.InvitationRole = member.Role
				}
			}
			res = append(res, inviteRes)
		}
		c.JSON(http.StatusOK, response.ListInvitationResponse{Data: res})
	}
}

// CreateProject 		godoc
//
//	@Summary		Create project.
//	@Description	Create a new project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Project{}
//	@Router			/create_project [post]
//
// CreateProject is used to create a new project
func CreateProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.CreateProjectInput
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		userRequest.UserID = c.MustGet("uid").(string)

		// admin/user shouldn't be able to perform any task if it's default pwd is not changes(initial login is true)
		initialLogin, err := CheckInitialLogin(service, userRequest.UserID)
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if initialLogin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrPasswordNotUpdated))
			return
		}

		// checking if project name is empty
		if userRequest.ProjectName == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrEmptyProjectName], presenter.CreateErrorResponse(utils.ErrEmptyProjectName))
			return
		}

		if userRequest.Description == nil {
			// If description is not provided, set it to an empty string
			emptyDescription := ""
			userRequest.Description = &emptyDescription
		}

		if userRequest.Tags == nil {
			// If tags are not provided, set it to an empty slice
			emptyTags := make([]*string, 0)
			userRequest.Tags = emptyTags
		}

		user, err := service.GetUser(userRequest.UserID)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		// Checking for duplicate project name
		filter := bson.D{{"name", userRequest.ProjectName}}
		projects, err := service.GetProjects(filter)
		if err != nil {
			return
		}

		if len(projects) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "project with name:" + userRequest.ProjectName + " already exists"})
			return
		}
		pID := uuid.Must(uuid.NewRandom()).String()

		// Adding user as project owner in project's member list
		newMember := &entities.Member{
			UserID:     user.ID,
			Username:   user.Name,
			Email:      user.Email,
			Role:       entities.RoleOwner,
			Invitation: entities.AcceptedInvitation,
			JoinedAt:   time.Now().UnixMilli(),
		}
		var members []*entities.Member
		members = append(members, newMember)
		state := string(types.MemberStateActive)
		newProject := &entities.Project{
			ID:          pID,
			Name:        userRequest.ProjectName,
			Members:     members,
			State:       &state,
			Description: userRequest.Description,
			Tags:        userRequest.Tags,
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

		err = service.CreateProject(newProject)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.Project{Data: *newProject.GetProjectOutput()})

	}

}

// SendInvitation 		godoc
//
//	@Summary		Send invitation.
//	@Description	Send invitation to a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		400	{object}	response.ErrInvalidRole
//	@Failure		400	{object}	response.ErrUserNotFound
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Member{}
//	@Router			/send_invitation [post]
//
// SendInvitation sends an invitation to a new user and returns an error if the member is already part of the project
func SendInvitation(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var member entities.MemberInput
		err := c.BindJSON(&member)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		err = validations.RbacValidator(c.MustGet("uid").(string), member.ProjectID,
			validations.MutationRbacRules["sendInvitation"], string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		// admin/user shouldn't be able to perform any task if it's default pwd is not changes(initial login is true)
		initialLogin, err := CheckInitialLogin(service, c.MustGet("uid").(string))
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if initialLogin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrPasswordNotUpdated))
			return
		}

		// Validating member role
		if member.Role == nil || (*member.Role != entities.RoleExecutor && *member.Role != entities.RoleViewer && *member.Role != entities.RoleOwner && *member.Role != entities.RoleEditor) {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRole], presenter.CreateErrorResponse(utils.ErrInvalidRole))
			return
		}

		user, err := service.GetUser(member.UserID)

		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		} else if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		invitation, err := getInvitation(service, member)
		if errors.Is(err, mongo.ErrNoDocuments) {
			c.JSON(utils.ErrorStatusCodes[utils.ErrProjectNotFound], presenter.CreateErrorResponse(utils.ErrProjectNotFound))
			return
		} else if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if invitation == entities.AcceptedInvitation {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], gin.H{"message": "user is already a member of this project"})
			return
		} else if invitation == entities.PendingInvitation || invitation == entities.DeclinedInvitation || invitation == entities.ExitedProject {
			err = service.UpdateInvite(member.ProjectID, member.UserID, entities.PendingInvitation, member.Role)
			if err != nil {
				log.Error(err)
				c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Invitation sent successfully"})
			return
		}

		newMember := &entities.Member{
			UserID:     user.ID,
			Role:       *member.Role,
			Username:   user.Username,
			Name:       user.Name,
			Email:      user.Email,
			Invitation: entities.PendingInvitation,
			JoinedAt:   time.Now().UnixMilli(),
		}

		err = service.AddMember(member.ProjectID, newMember)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.Member{Data: entities.Member{
			UserID:     user.ID,
			Username:   user.Username,
			Name:       user.Name,
			Role:       newMember.Role,
			Email:      user.Email,
			Invitation: newMember.Invitation,
			JoinedAt:   newMember.JoinedAt,
		}})
	}
}

// AcceptInvitation 		godoc
//
//	@Summary		Accept invitation.
//	@Description	Accept invitation to a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/accept_invitation [post]
//
// AcceptInvitation is used to accept an invitation
func AcceptInvitation(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var member entities.MemberInput
		err := c.BindJSON(&member)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// admin/user shouldn't be able to perform any task if it's default pwd is not changes(initial login is true)
		initialLogin, err := CheckInitialLogin(service, c.MustGet("uid").(string))
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if initialLogin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrPasswordNotUpdated))
			return
		}

		err = validations.RbacValidator(c.MustGet("uid").(string), member.ProjectID,
			validations.MutationRbacRules["acceptInvitation"],
			string(entities.PendingInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		err = service.UpdateInvite(member.ProjectID, member.UserID, entities.AcceptedInvitation, nil)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.MessageResponse{Message: "Successful"})
	}
}

// DeclineInvitation 		godoc
//
//	@Summary		Decline invitation.
//	@Description	Decline invitation to a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/decline_invitation [post]
//
// DeclineInvitation is used to decline an invitation
func DeclineInvitation(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var member entities.MemberInput
		err := c.BindJSON(&member)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// admin/user shouldn't be able to perform any task if it's default pwd is not changes(initial login is true)
		initialLogin, err := CheckInitialLogin(service, c.MustGet("uid").(string))
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if initialLogin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrPasswordNotUpdated))
			return
		}

		err = validations.RbacValidator(c.MustGet("uid").(string), member.ProjectID,
			validations.MutationRbacRules["declineInvitation"],
			string(entities.PendingInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		err = service.UpdateInvite(member.ProjectID, member.UserID, entities.DeclinedInvitation, nil)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.MessageResponse{Message: "successful"})
	}
}

// LeaveProject 		godoc
//
//	@Summary		Leave project.
//	@Description	Leave project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/leave_project [post]
//
// LeaveProject is used to leave a project
func LeaveProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var member entities.MemberInput
		err := c.BindJSON(&member)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		if member.Role != nil && *member.Role == entities.RoleOwner {
			owners, err := service.GetProjectOwners(member.ProjectID)
			if err != nil {
				log.Error(err)
				c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
				return
			}

			if len(owners) == 1 {
				c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], gin.H{"message": "Cannot leave project. There must be at least one owner."})
				return
			}
		}

		// admin/user shouldn't be able to perform any task if it's default pwd is not changes(initial login is true)
		initialLogin, err := CheckInitialLogin(service, c.MustGet("uid").(string))
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if initialLogin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrPasswordNotUpdated))
			return
		}

		err = validations.RbacValidator(c.MustGet("uid").(string), member.ProjectID,
			validations.MutationRbacRules["leaveProject"],
			string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		err = service.UpdateInvite(member.ProjectID, member.UserID, entities.ExitedProject, nil)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.MessageResponse{Message: "successful"})
	}
}

// RemoveInvitation 		godoc
//
//	@Summary		Remove invitation.
//	@Description	Remove invitation of a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/remove_invitation [post]
//
// RemoveInvitation removes member or cancels invitation
func RemoveInvitation(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var member entities.MemberInput
		err := c.BindJSON(&member)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		if member.UserID == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// admin/user shouldn't be able to perform any task if it's default pwd is not changes(initial login is true)
		initialLogin, err := CheckInitialLogin(service, c.MustGet("uid").(string))
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if initialLogin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrPasswordNotUpdated))
			return
		}

		err = validations.RbacValidator(c.MustGet("uid").(string), member.ProjectID,
			validations.MutationRbacRules["removeInvitation"],
			string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		uid := c.MustGet("uid").(string)
		if uid == member.UserID {
			c.JSON(http.StatusBadRequest, gin.H{"message": "User cannot remove invitation of themselves use Leave Project."})
			return
		}

		invitation, err := getInvitation(service, member)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		switch invitation {
		case entities.AcceptedInvitation, entities.PendingInvitation:
			{
				err := service.RemoveInvitation(member.ProjectID, member.UserID, invitation)
				if err != nil {
					log.Error(err)
					c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
					return
				}
			}

		case entities.DeclinedInvitation, entities.ExitedProject:
			{
				c.JSON(http.StatusBadRequest, gin.H{"message": "User is not a part of your project"})
				return
			}
		}

		c.JSON(http.StatusOK, response.MessageResponse{Message: "successful"})
	}
}

// UpdateProjectName 		godoc
//
//	@Summary		Update project name.
//	@Description	Return updated project name.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/update_project_name [post]
//
// UpdateProjectName is used to update a project's name
func UpdateProjectName(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.ProjectInput
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// admin/user shouldn't be able to perform any task if it's default pwd is not changes(initial login is true)
		initialLogin, err := CheckInitialLogin(service, c.MustGet("uid").(string))
		if err != nil {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if initialLogin {
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrPasswordNotUpdated))
			return
		}

		err = validations.RbacValidator(c.MustGet("uid").(string),
			userRequest.ProjectID,
			validations.MutationRbacRules["updateProjectName"],
			string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		uid := c.MustGet("uid").(string)

		// Checking for duplicate project name
		filter := bson.D{{"name", userRequest.ProjectName}, {"members.user_id", uid}, {"members.role", entities.RoleOwner}}
		projects, err := service.GetProjects(filter)
		if err != nil {
			return
		}

		if len(projects) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"message": "project with name: " + userRequest.ProjectName + " already exists"})
			return
		}

		err = service.UpdateProjectName(userRequest.ProjectID, userRequest.ProjectName)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.MessageResponse{Message: "successful"})
	}
}

// UpdateMemberRole 		godoc
//
//	@Summary		Update member role.
//	@Description	Return updated member role.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/update_member_role [post]
//
// UpdateMemberRole is used to update a member role in the project
func UpdateMemberRole(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var member entities.MemberInput
		err := c.BindJSON(&member)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Validating member role
		if member.Role == nil || (*member.Role != entities.RoleExecutor && *member.Role != entities.RoleViewer && *member.Role != entities.RoleOwner && *member.Role != entities.RoleEditor) {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRole], presenter.CreateErrorResponse(utils.ErrInvalidRole))
			return
		}

		err = validations.RbacValidator(c.MustGet("uid").(string),
			member.ProjectID,
			validations.MutationRbacRules["updateMemberRole"],
			string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		uid := c.MustGet("uid").(string)
		if uid == member.UserID {
			c.JSON(http.StatusBadRequest, gin.H{"message": "User cannot change their own role."})
			return
		}

		err = service.UpdateMemberRole(member.ProjectID, member.UserID, member.Role)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.MessageResponse{Message: "successful"})
	}
}

// GetOwnerProjects 		godoc
//
//	@Summary		Get projects owner.
//	@Description	Return owner of projects.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.Projects{}
//	@Router			/get_owner_projects [get]
//
// GetOwnerProjects returns an array of projects in which user is an owner
func GetOwnerProjects(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet("uid").(string)
		res, err := service.GetOwnerProjectIDs(c, uid)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.Projects{Data: res})

	}
}

// GetProjectRole 		godoc
//
//	@Summary		Get project Role.
//	@Description	Return role of a project.
//	@Tags			ProjectRouter
//	@Param			project_id	path	int	true	"Project ID"
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrProjectNotFound
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.ProjectRole{}
//	@Router			/get_project_role/:project_id [get]
//
// GetProjectRole returns the role of a user in the project
func GetProjectRole(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet("uid").(string)
		projectID := c.Param("project_id")
		role := "N/A"
		res, err := service.GetProjectRole(projectID, uid)
		if err != nil {
			log.Error(err)
			if errors.Is(err, mongo.ErrNoDocuments) {
				c.JSON(utils.ErrorStatusCodes[utils.ErrProjectNotFound], presenter.CreateErrorResponse(utils.ErrProjectNotFound))
				return
			}
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if res != nil {
			role = string(*res)
		}
		c.JSON(http.StatusOK, response.ProjectRole{Role: role})

	}
}

// DeleteProject  		godoc
//
//	@Description	Delete a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrProjectNotFound
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/delete_project/:project_id [post]
//
// DeleteProject is used to delete a project.
func DeleteProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("project_id")

		err := validations.RbacValidator(c.MustGet("uid").(string),
			projectID,
			validations.MutationRbacRules["deleteProject"],
			string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		err = service.DeleteProject(projectID)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.MessageResponse{Message: "Successfully deleted project."})
	}
}
