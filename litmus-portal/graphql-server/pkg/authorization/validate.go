package authorization

import (
	"context"
	"errors"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authentication"
)

// ValidateRole Validates the role of a user in a given project
func ValidateRole(ctx context.Context, projectID string,
	requiredRoles []string, invitation string) error {
	jwt := ctx.Value(AuthKey).(string)

	authService := authentication.NewService()

	err := authService.ValidatorGRPCRequest(jwt, projectID, requiredRoles, invitation)
	if err != nil {
		return errors.New("permission_denied")
	}
	return nil
}
