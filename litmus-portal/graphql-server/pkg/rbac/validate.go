package validate

import (
	"context"
	"errors"

	jwt "github.com/dgrijalva/jwt-go"
	dbOperationsProject "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/project"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
)

// ValidateRole :Validates the role of a user in a given project
func ValidateRole(ctx context.Context, projectID string, requiredRoles []model.MemberRole, invitation string) error {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	uid := claims["uid"].(string)

	filter := bson.D{{"members", bson.D{{"$elemMatch", bson.D{{"user_id", uid}, {"role", bson.D{{"$in", requiredRoles}}}, {"invitation", invitation}}}}}, {"_id", projectID}}
	_, err := dbOperationsProject.GetProject(ctx, filter)

	if err != nil {
		return errors.New("Permission Denied")
	}

	return nil
}
