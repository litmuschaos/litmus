package validations

import "github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"

var MutationRbacRules = map[string][]string{
	"sendInvitation":   {string(entities.RoleOwner)},
	"acceptInvitation": {string(entities.RoleViewer), string(entities.RoleExecuter)},
	"declineInvitation": {string(entities.RoleViewer),
		string(entities.RoleExecuter)},
	"removeInvitation":  {string(entities.RoleOwner)},
	"leaveProject":      {string(entities.RoleViewer), string(entities.RoleExecuter)},
	"updateProjectName": {string(entities.RoleOwner)},
	"getProject":        {string(entities.RoleOwner), string(entities.RoleViewer), string(entities.RoleExecuter)},
}
