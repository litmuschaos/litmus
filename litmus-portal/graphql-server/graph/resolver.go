package graph

import (
	"context"
	"fmt"

	"github.com/99designs/gqlgen/graphql"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct{}

func NewConfig() generated.Config {
	fmt.Println("Inside New Config")
	config := generated.Config{Resolvers: &Resolver{}}
	config.Directives.Authorized = func(ctx context.Context, obj interface{}, next graphql.Resolver) (interface{}, error) {
		fmt.Println("Authorized")
		token := ctx.Value(authorization.AuthKey).(string)
		user, err := authorization.UserValidateJWT(token)
		if err != nil {
			return nil, err
		}
		newCtx := context.WithValue(ctx, authorization.UserClaim, user)
		return next(newCtx)
	}
	config.Directives.HasRole = func(ctx context.Context, obj interface{}, next graphql.Resolver, role model.Role) (res interface{}, err error) {
		token := ctx.Value(authorization.AuthKey).(string)
		user, err := authorization.UserValidateJWT(token)
		if err != nil {
			return nil, err
		}
		fmt.Println("Inside hasrole")
		fmt.Println("userID : ", user["uid"])
		fmt.Println("context ", &ctx)

		fmt.Println("complete data: ", graphql.GetFieldContext(ctx))

		// Fetching data from graphQL
		data := graphql.GetFieldContext(ctx).Args["member"]
		// // data := graphql.WithFieldContext(ctx, ).Args["member"]
		fmt.Println("data : ", data)

		x, ok := data.(map[int]interface{})
		// project := x[0]
		fmt.Println("x: ", x[1])
		fmt.Println("ok: ", ok)

		// fmt.Println("project: ", project)

		// if ok {
		// 	fmt.Println("project: ", project)
		// }

		// s := reflect.ValueOf(x)
		// fmt.Println("keys", s.MapKeys())
		// for _, k := range s.MapKeys() {
		// 	fmt.Println(s.MapIndex(k))
		// }

		// if !getCurrentUser(ctx).HasRole(role) {
		// 	// block calling the next resolver
		// 	return nil, fmt.Errorf("Access denied")
		// }

		// Implement the check here ...

		// or let it pass through
		return next(ctx)
	}

	return config
}
