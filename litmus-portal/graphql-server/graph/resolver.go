package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/service"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/usage"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	chaosHubService      chaoshub.Service
	chaosWorkflowHandler *handler.ChaosWorkflowHandler
	clusterService       cluster.Service
	gitOpsService        gitops.Service
	analyticsService     service.Service
	usageService         usage.Service
}

func NewConfig(mongodbOperator mongodb.MongoOperator) generated.Config {
	config := generated.Config{Resolvers: &Resolver{
		chaosHubService:      chaoshub.NewService(mongodbOperator),
		chaosWorkflowHandler: handler.NewChaosWorkflowHandler(mongodbOperator),
		clusterService:       cluster.NewService(mongodbOperator),
		gitOpsService:        gitops.NewService(mongodbOperator),
		analyticsService:     service.NewService(mongodbOperator),
		usageService:         usage.NewService(mongodbOperator),
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
