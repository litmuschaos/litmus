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

func ValidateRole(ctx context.Context, projectID string, requiredRoles []model.MemberRole) error {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	uid := claims["uid"].(string)

	filter := bson.D{{"members", bson.D{{"$elemMatch", bson.D{{"user_id", uid}, {"role", bson.D{{"$in", requiredRoles}}}}}}}, {"_id", projectID}}
	_, err := dbOperationsProject.GetProject(ctx, filter)

	if err != nil {
		return errors.New("Permission Denied")
	}

	return nil
}
