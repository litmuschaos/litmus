package authorization

import (
	"context"
	"errors"

	jwt "github.com/dgrijalva/jwt-go"
	dbOperationsProject "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/project"
	dbOperationsUserManagement "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/usermanagement"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
)

// ValidateRole Validates the role of a user in a given project
func ValidateRole(ctx context.Context, projectID string, requiredRoles []model.MemberRole, invitation string) error {
	claims := ctx.Value(UserClaim).(jwt.MapClaims)
	uid := claims["uid"].(string)

	filter := bson.D{
		{"_id", projectID},
		{"members", bson.D{
			{"$elemMatch", bson.D{
				{"user_id", uid},
				{"deactivated_at", ""},
				{"role", bson.D{
					{"$in", requiredRoles},
				}},
				{"invitation", invitation},
			}},
		}},
	}

	_, err := dbOperationsProject.GetProject(ctx, filter)

	if err != nil {
		return errors.New("permission denied")
	}

	return nil
}

// ValidateUserStatus checks if the user with given uid is deactivated or not
func ValidateUserStatus(ctx context.Context, uid string) error {
	user, err := dbOperationsUserManagement.GetUserByUserID(ctx, uid)
	if err != nil {
		return err
	}

	if user.DeactivatedAt != "" {
		return errors.New("user has been deactivated")
	}

	return nil
}
