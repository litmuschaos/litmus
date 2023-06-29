package rest

import (
	"litmus/litmus-portal/authentication/api/presenter"
	"litmus/litmus-portal/authentication/api/types"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/services"
	"litmus/litmus-portal/authentication/pkg/utils"
	"litmus/litmus-portal/authentication/pkg/validations"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// GetUserWithProject returns user and project details based on username
func GetUserWithProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		username := c.Param("username")

		// Validating logged in user
		if c.MustGet("username").(string) != username {
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

		outputUser := user.GetUserWithProject()

		projects, err := service.GetProjectsByUserID(outputUser.ID, false)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		outputUser.Projects = projects

		c.JSON(200, gin.H{"data": outputUser})
	}
}

// GetProject queries the project with a given projectID from the database
func GetProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("project_id")

		err := validations.RbacValidator(c.MustGet("uid").(string), projectID,
			validations.MutationRbacRules["getProject"], string(entities.AcceptedInvitation), service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		project, err := service.GetProjectByProjectID(projectID)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		// Fetching user ids of all the members in the project
		var uids []string
		for _, member := range project.Members {
			uids = append(uids, member.UserID)
		}

		authUsers, err := service.FindUsersByUID(uids)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		memberMap := make(map[string]entities.User)
		for _, authUser := range *authUsers {
			memberMap[authUser.ID] = authUser
		}

		var members []*types.Member

		// Adding additional details of project members
		for _, member := range project.Members {
			members = append(members, &types.Member{
				UserID:        memberMap[member.UserID].ID,
				UserName:      memberMap[member.UserID].UserName,
				Name:          memberMap[member.UserID].Name,
				Role:          member.Role,
				Email:         memberMap[member.UserID].Email,
				Invitation:    member.Invitation,
				JoinedAt:      member.JoinedAt,
				DeactivatedAt: memberMap[member.UserID].DeactivatedAt,
			})
		}

		c.JSON(200, gin.H{"data": types.Project{
			ID:    project.ID,
			Name:  project.Name,
			State: project.State,
			Audit: entities.Audit{
				IsRemoved: project.IsRemoved,
				CreatedAt: project.CreatedAt,
				CreatedBy: project.UpdatedBy,
				UpdatedAt: project.UpdatedAt,
				UpdatedBy: project.UpdatedBy,
			},
			Members: members,
		}})
	}
}

// GetProjectsByUserID queries the project with a given userID from the database and returns it in the appropriate format
func GetProjectsByUserID(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uID := c.MustGet("uid").(string)
		projects, err := service.GetProjectsByUserID(uID, false)
		if projects == nil {
			c.JSON(200, gin.H{
				"message": "No projects found",
			})
		}
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		var uids []string

		// Fetching user ids of all members from all user's projects
		for _, project := range projects {
			for _, member := range project.Members {
				uids = append(uids, member.UserID)
			}
		}
		authUsers, err := service.FindUsersByUID(uids)
		if err != nil || authUsers == nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		memberMap := make(map[string]entities.User)

		for _, authUser := range *authUsers {
			memberMap[authUser.ID] = authUser
		}

		var outputProjects []*types.Project

		// Adding additional details of project members
		for _, project := range projects {
			var members []*types.Member
			for _, member := range project.Members {
				members = append(members, &types.Member{
					UserID:        memberMap[member.UserID].ID,
					UserName:      memberMap[member.UserID].UserName,
					Name:          memberMap[member.UserID].Name,
					Role:          member.Role,
					Email:         memberMap[member.UserID].Email,
					Invitation:    member.Invitation,
					JoinedAt:      member.JoinedAt,
					DeactivatedAt: memberMap[member.UserID].DeactivatedAt,
				})
			}
			outputProjects = append(outputProjects, &types.Project{
				ID:      project.ID,
				Name:    project.Name,
				Members: members,
				State:   project.State,
				Audit: entities.Audit{
					IsRemoved: project.IsRemoved,
					CreatedAt: project.CreatedAt,
					CreatedBy: project.UpdatedBy,
					UpdatedAt: project.UpdatedAt,
					UpdatedBy: project.UpdatedBy,
				},
			})
		}

		c.JSON(200, gin.H{"data": outputProjects})
	}
}

// GetProjectStats is used to retrive stats related to projects in the DB
func GetProjectStats(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.MustGet("role").(string)
		if role != string(entities.RoleAdmin) {
			c.JSON(400, gin.H{
				"message": "Permission denied, user is not admin",
			})
		}
		project, err := service.GetProjectStats()
		if project == nil {
			c.JSON(200, gin.H{
				"message": "No projects found",
			})
		}
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		c.JSON(200, gin.H{"data": project})
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

func CreateProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.CreateProjectInput
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}
		// checking if project name is empty
		if userRequest.ProjectName == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrEmptyProjectName], presenter.CreateErrorResponse(utils.ErrEmptyProjectName))
			return
		}

		userRequest.UserID = c.MustGet("uid").(string)

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
			c.JSON(400, gin.H{"message": "project with name:" + userRequest.ProjectName + " already exists"})
			return
		}
		pID := uuid.Must(uuid.NewRandom()).String()

		// Adding user as project owner in project's member list
		newMember := &entities.Member{
			UserID:     user.ID,
			Role:       entities.RoleOwner,
			Invitation: entities.AcceptedInvitation,
			JoinedAt:   strconv.FormatInt(time.Now().Unix(), 10),
		}
		var members []*entities.Member
		members = append(members, newMember)
		state := "active"
		newProject := &entities.Project{
			ID:      pID,
			Name:    userRequest.ProjectName,
			Members: members,
			State:   &state,
			Audit: entities.Audit{
				IsRemoved: false,
				CreatedAt: time.Now().Unix(),
				CreatedBy: user.ID,
				UpdatedAt: time.Now().Unix(),
				UpdatedBy: user.ID,
			},
		}

		err = service.CreateProject(newProject)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(200, gin.H{"data": newProject.GetProjectOutput()})

	}

}

// SendInvitation sends an invitation to a new user and
// returns an error if the member is already part of the project
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
		// Validating member role
		if member.Role == nil || (*member.Role != entities.RoleEditor && *member.Role != entities.RoleViewer) {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRole], presenter.CreateErrorResponse(utils.ErrInvalidRole))
			return
		}

		user, err := service.GetUser(member.UserID)

		if err == mongo.ErrNoDocuments {
			c.JSON(utils.ErrorStatusCodes[utils.ErrUserNotFound], presenter.CreateErrorResponse(utils.ErrUserNotFound))
			return
		} else if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		invitation, err := getInvitation(service, member)
		if err == mongo.ErrNoDocuments {
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
			Invitation: entities.PendingInvitation,
			JoinedAt:   strconv.FormatInt(time.Now().Unix(), 10),
		}

		err = service.AddMember(member.ProjectID, newMember)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(200, gin.H{"data": types.Member{
			UserID:        user.ID,
			UserName:      user.UserName,
			Name:          user.Name,
			Role:          entities.MemberRole(newMember.Role),
			Email:         user.Email,
			Invitation:    entities.Invitation(newMember.Invitation),
			JoinedAt:      newMember.JoinedAt,
			DeactivatedAt: user.DeactivatedAt,
		}})
	}
}

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

		c.JSON(200, gin.H{
			"message": "Successful",
		})
	}
}

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

		c.JSON(200, gin.H{
			"message": "Successful",
		})
	}
}

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

		c.JSON(200, gin.H{
			"message": "Successful",
		})
	}
}

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
				c.JSON(400, gin.H{"message": "User is already not a part of your project"})
				return
			}
		}

		c.JSON(200, gin.H{
			"message": "Successful",
		})
	}
}

//  UpdateProjectName is used to update a project's name
func UpdateProjectName(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var userRequest entities.ProjectInput
		err := c.BindJSON(&userRequest)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
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
			c.JSON(400, gin.H{"message": "project with name: " + userRequest.ProjectName + " already exists"})
			return
		}

		err = service.UpdateProjectName(userRequest.ProjectID, userRequest.ProjectName)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(200, gin.H{
			"message": "Successful",
		})
	}
}

// GetOwnerProject returns an array of project IDs in which user is an owner
func GetOwnerProjectIDs(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet("uid").(string)
		res, err := service.GetOwnerProjectIDs(c, uid)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": res,
		})

	}
}

// GetProjectRole returns the role of a user in the project
func GetProjectRole(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.MustGet("uid").(string)
		projectID := c.Param("project_id")
		role := "N/A"
		res, err := service.GetProjectRole(projectID, uid)
		if err != nil {
			log.Error(err)
			if err == mongo.ErrNoDocuments {
				c.JSON(utils.ErrorStatusCodes[utils.ErrProjectNotFound], presenter.CreateErrorResponse(utils.ErrProjectNotFound))
				return
			}
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		if res != nil {
			role = string(*res)
		}
		c.JSON(http.StatusOK, gin.H{
			"role": role,
		})

	}
}
