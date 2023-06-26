package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/service"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	chaosWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchemaAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
	dbSchemaChaosHub "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/chaoshub"
	dbSchemaCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsGitOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/gitops"
	dbOperationsImageRegistry "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/image_registry"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbOperationsWorkflowTemplate "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflowtemplate"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops"
	imageRegistry "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/image_registry"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
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
	imageRegistryService imageRegistry.Service
}

// NewConfig returns a new generated.Config
func NewConfig(mongodbOperator mongodb.MongoOperator, kubeClients *k8s.KubeClients) generated.Config {
	// operator
	chaosHubOperator := dbSchemaChaosHub.NewChaosHubOperator(mongodbOperator)
	clusterOperator := dbSchemaCluster.NewClusterOperator(mongodbOperator)
	chaosWorkflowOperator := dbOperationsWorkflow.NewChaosWorkflowOperator(mongodbOperator)
	gitOpsOperator := dbOperationsGitOps.NewGitOpsOperator(mongodbOperator)
	chaosWorkflowTemplateOperator := dbOperationsWorkflowTemplate.NewWorkflowTemplateOperator(mongodbOperator)
	analyticsOperator := dbSchemaAnalytics.NewAnalyticsOperator(mongodbOperator)
	imageRegistryOperator := dbOperationsImageRegistry.NewImageRegistryOperator(mongodbOperator)

	// service
	clusterService := cluster.NewService(clusterOperator, chaosWorkflowOperator, kubeClients)
	chaosHubService := chaoshub.NewService(chaosHubOperator)
	analyticsService := service.NewService(analyticsOperator, chaosWorkflowOperator, clusterService)
	usageService := usage.NewService(clusterOperator)
	chaosWorkflowService := chaosWorkflow.NewService(chaosWorkflowOperator, clusterOperator)
	gitOpsService := gitops.NewService(gitOpsOperator, chaosWorkflowService)
	imageRegistryService := imageRegistry.NewService(imageRegistryOperator)

	// handler
	chaosWorkflowHandler := handler.NewChaosWorkflowHandler(
		chaosWorkflowService, clusterService, gitOpsService, chaosWorkflowOperator, chaosWorkflowTemplateOperator, mongodbOperator,
	)

	config := generated.Config{
		Resolvers: &Resolver{
			chaosHubService:      chaosHubService,
			chaosWorkflowHandler: chaosWorkflowHandler,
			clusterService:       clusterService,
			gitOpsService:        gitOpsService,
			analyticsService:     analyticsService,
			usageService:         usageService,
			imageRegistryService: imageRegistryService,
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
