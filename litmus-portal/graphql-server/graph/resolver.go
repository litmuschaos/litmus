package graph

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	data_store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct{}

var store = data_store.New()

func NewConfig() generated.Config {
	config := generated.Config{Resolvers: &Resolver{}}
	config.Directives.Authorized = func(ctx context.Context, obj interface{}, next graphql.Resolver) (interface{}, error) {
		token := ctx.Value(authorization.AuthKey).(string)
		_, err := authorization.UserValidateJWT(token)
		if err != nil {
			return nil, err
		}
		return next(ctx)
	}
	return config
}
