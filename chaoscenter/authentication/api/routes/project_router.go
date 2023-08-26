package routes

import (
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/middleware"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

// ProjectRouter creates all the required routes for project related purposes.
func ProjectRouter(router *gin.Engine, service services.ApplicationService) {
	router.Use(middleware.JwtMiddleware(service))
	router.GET("/get_project/:project_id", rest.GetProject(service))
	router.GET("/get_project_members/:project_id/:state", rest.GetActiveProjectMembers(service))
	router.GET("/get_user_with_project/:username", rest.GetUserWithProject(service))
	router.GET("/get_owner_projects", rest.GetOwnerProjects(service))
	router.GET("/get_project_role/:project_id", rest.GetProjectRole(service))
	router.GET("/list_projects", rest.GetProjectsByUserID(service))
	router.GET("/get_projects_stats", rest.GetProjectStats(service))
	router.GET("/list_invitations_with_filters/:invitation_state", rest.ListInvitations(service))
	router.POST("/create_project", rest.CreateProject(service))
	router.POST("/send_invitation", rest.SendInvitation(service))
	router.POST("/accept_invitation", rest.AcceptInvitation(service))
	router.POST("/decline_invitation", rest.DeclineInvitation(service))
	router.POST("/remove_invitation", rest.RemoveInvitation(service))
	router.POST("/leave_project", rest.LeaveProject(service))
	router.POST("/update_project_name", rest.UpdateProjectName(service))
}
