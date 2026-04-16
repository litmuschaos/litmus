package rest

import (
	"net/http"
	"time"

	response "github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/validations"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// AddGroupToProject 		godoc
//
//	@Summary		Add group to project.
//	@Description	Assign an OIDC group with a role to a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		400	{object}	response.ErrInvalidRole
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.GroupMember{}
//	@Router			/add_group_to_project [post]
//
// AddGroupToProject assigns an OIDC group with a specific role to a project
func AddGroupToProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input entities.GroupMemberInput
		err := c.BindJSON(&input)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Only project owners can add groups
		err = validations.RbacValidator(c.MustGet("uid").(string), input.ProjectID,
			validations.MutationRbacRules["sendInvitation"], string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		// Validate role
		if input.Role == nil || (*input.Role != entities.RoleExecutor && *input.Role != entities.RoleViewer && *input.Role != entities.RoleOwner) {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRole], presenter.CreateErrorResponse(utils.ErrInvalidRole))
			return
		}

		// Validate group name is not empty
		if input.Group == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Check if group is already assigned to the project
		existingGroups, err := service.GetProjectGroupMembers(input.ProjectID)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}
		for _, gm := range existingGroups {
			if gm.Group == input.Group {
				c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], gin.H{"message": "group is already assigned to this project"})
				return
			}
		}

		groupMember := &entities.GroupMember{
			Group:      input.Group,
			Role:       *input.Role,
			AssignedAt: time.Now().UnixMilli(),
		}

		err = service.AddGroupMember(input.ProjectID, groupMember)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.GroupMember{Data: *groupMember})
	}
}

// RemoveGroupFromProject 		godoc
//
//	@Summary		Remove group from project.
//	@Description	Remove an OIDC group from a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/remove_group_from_project [post]
//
// RemoveGroupFromProject removes an OIDC group from a project
func RemoveGroupFromProject(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input entities.GroupMemberInput
		err := c.BindJSON(&input)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Only project owners can remove groups
		err = validations.RbacValidator(c.MustGet("uid").(string), input.ProjectID,
			validations.MutationRbacRules["removeInvitation"], string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		if input.Group == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		err = service.RemoveGroupMember(input.ProjectID, input.Group)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Group removed from project successfully"})
	}
}

// UpdateGroupRole 		godoc
//
//	@Summary		Update group role.
//	@Description	Update the role of an OIDC group in a project.
//	@Tags			ProjectRouter
//	@Accept			json
//	@Produce		json
//	@Failure		400	{object}	response.ErrInvalidRequest
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		400	{object}	response.ErrInvalidRole
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.MessageResponse{}
//	@Router			/update_group_role [post]
//
// UpdateGroupRole updates the role of an OIDC group in a project
func UpdateGroupRole(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input entities.GroupMemberInput
		err := c.BindJSON(&input)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		// Only project owners can update group roles
		err = validations.RbacValidator(c.MustGet("uid").(string), input.ProjectID,
			validations.MutationRbacRules["updateMemberRole"], string(entities.AcceptedInvitation),
			service)
		if err != nil {
			log.Warn(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
				presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}

		if input.Role == nil || (*input.Role != entities.RoleExecutor && *input.Role != entities.RoleViewer && *input.Role != entities.RoleOwner) {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRole], presenter.CreateErrorResponse(utils.ErrInvalidRole))
			return
		}

		if input.Group == "" {
			c.JSON(utils.ErrorStatusCodes[utils.ErrInvalidRequest], presenter.CreateErrorResponse(utils.ErrInvalidRequest))
			return
		}

		err = service.UpdateGroupMemberRole(input.ProjectID, input.Group, input.Role)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Group role updated successfully"})
	}
}

// GetProjectGroups 		godoc
//
//	@Summary		Get project groups.
//	@Description	Return groups assigned to a project.
//	@Tags			ProjectRouter
//	@Param			project_id	path	string	true	"Project ID"
//	@Accept			json
//	@Produce		json
//	@Failure		401	{object}	response.ErrUnauthorized
//	@Failure		500	{object}	response.ErrServerError
//	@Success		200	{object}	response.GroupMembers{}
//	@Router			/get_project_groups/:project_id [get]
//
// GetProjectGroups returns all groups assigned to a project
func GetProjectGroups(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("project_id")

		// Any accepted member or admin can list groups
		userRole := c.MustGet("role").(string)
		if userRole != string(entities.RoleAdmin) {
			err := validations.RbacValidator(c.MustGet("uid").(string), projectID,
				validations.MutationRbacRules["getProject"], string(entities.AcceptedInvitation),
				service)
			if err != nil {
				log.Warn(err)
				c.JSON(utils.ErrorStatusCodes[utils.ErrUnauthorized],
					presenter.CreateErrorResponse(utils.ErrUnauthorized))
				return
			}
		}

		groupMembers, err := service.GetProjectGroupMembers(projectID)
		if err != nil {
			log.Error(err)
			c.JSON(utils.ErrorStatusCodes[utils.ErrServerError], presenter.CreateErrorResponse(utils.ErrServerError))
			return
		}

		c.JSON(http.StatusOK, response.GroupMembers{Data: groupMembers})
	}
}
