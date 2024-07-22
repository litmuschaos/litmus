package validations

import "github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"

var MutationRbacRules = map[string][]string{
	"sendInvitation":   {string(entities.RoleOwner)},
	"acceptInvitation": {string(entities.RoleOwner), string(entities.RoleViewer), string(entities.RoleExecutor)},
	"declineInvitation": {string(entities.RoleOwner), string(entities.RoleViewer),
		string(entities.RoleExecutor)},
	"removeInvitation":  {string(entities.RoleOwner)},
	"leaveProject":      {string(entities.RoleOwner), string(entities.RoleViewer), string(entities.RoleExecutor)},
	"updateProjectName": {string(entities.RoleOwner)},
	"updateMemberRole":  {string(entities.RoleOwner)},
	"deleteProject":     {string(entities.RoleOwner)},
	"getProject":        {string(entities.RoleOwner), string(entities.RoleViewer), string(entities.RoleExecutor)},
}
