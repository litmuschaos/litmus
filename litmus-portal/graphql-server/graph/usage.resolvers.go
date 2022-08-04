package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"

	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/usage"
)

// GetUsageData is the resolver for the getUsageData field.
func (r *queryResolver) GetUsageData(ctx context.Context, request model.UsageDataRequest) (*model.UsageDataResponse, error) {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	if claims["role"].(string) != "admin" {
		return nil, errors.New("only portal admin access")
	}
	return usage.GetUsageData(ctx, request)
}
