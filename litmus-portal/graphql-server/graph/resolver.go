package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	ChaosHubService chaoshub.Service
}

func NewConfig() generated.Config {
	config := generated.Config{Resolvers: &Resolver{
		ChaosHubService: chaoshub.NewService(),
	}}
	config.Directives.Authorized = func(ctx context.Context, obj interface{}, next graphql.Resolver) (interface{}, error) {
		token := ctx.Value(authorization.AuthKey).(string)
		user, err := authorization.UserValidateJWT(token)
		if err != nil {
			return nil, err
		}
		newCtx := context.WithValue(ctx, authorization.UserClaim, user)
		return next(newCtx)
	}

	return config
}
