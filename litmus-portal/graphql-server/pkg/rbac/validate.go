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

	filter := bson.D{{Key: "members", Value: bson.D{{Key: "$elemMatch", Value: bson.D{{Key: "user_id", Value: uid}, {Key: "role", Value: bson.D{{Key: "$in", Value: requiredRoles}}}, {Key: "invitation", Value: invitation}}}}}, {Key: "_id", Value: projectID}}
	_, err := dbOperationsProject.GetProject(ctx, filter)

	if err != nil {
		return errors.New("permission Denied")
	}

	return nil
}
