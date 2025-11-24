package validations

import "github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"

var MutationRbacRules = map[string][]string{
	"sendInvitation":   {string(entities.RoleOwner)},
	"acceptInvitation": {string(entities.RoleOwner), string(entities.RoleViewer),
		string(entities.RoleExecutor), string(entities.RoleEditor)},
	"declineInvitation": {string(entities.RoleOwner), string(entities.RoleViewer),
		string(entities.RoleExecutor), string(entities.RoleEditor)},
	"removeInvitation":  {string(entities.RoleOwner)},
	"leaveProject":      {string(entities.RoleOwner), string(entities.RoleViewer),
		string(entities.RoleExecutor), string(entities.RoleEditor)},
	"updateProjectName": {string(entities.RoleOwner)},
	"updateMemberRole":  {string(entities.RoleOwner)},
	"deleteProject":     {string(entities.RoleOwner)},
	"getProject":        {string(entities.RoleOwner), string(entities.RoleViewer), string(entities.RoleExecutor), string(entities.RoleEditor)},
}
