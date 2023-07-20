package validations

import "github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"

var MutationRbacRules = map[string][]string{
	"sendInvitation":   {string(entities.RoleOwner)},
	"acceptInvitation": {string(entities.RoleViewer), string(entities.RoleEditor)},
	"declineInvitation": {string(entities.RoleViewer),
		string(entities.RoleEditor)},
	"removeInvitation":  {string(entities.RoleOwner)},
	"leaveProject":      {string(entities.RoleViewer), string(entities.RoleEditor)},
	"updateProjectName": {string(entities.RoleOwner)},
	"getProject":        {string(entities.RoleOwner), string(entities.RoleViewer), string(entities.RoleEditor)},
}
