package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/sirupsen/logrus"
)

func (r *mutationResolver) GitopsNotifier(ctx context.Context, clusterInfo model.ClusterIdentity, workflowID string) (string, error) {
	cluster, err := r.clusterService.VerifyCluster(clusterInfo)
	if err != nil {
		logrus.Error("Validation failed : ", clusterInfo.ClusterID)
		return "Validation failed", err
	}
	return r.gitOpsService.GitOpsNotificationHandler(ctx, cluster, workflowID)
}

func (r *mutationResolver) EnableGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, config.ProjectID,
		authorization.MutationRbacRules[authorization.EnableGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return r.gitOpsService.EnableGitOpsHandler(ctx, config)
}

func (r *mutationResolver) DisableGitOps(ctx context.Context, projectID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DisableGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return r.gitOpsService.DisableGitOpsHandler(ctx, projectID)
}

func (r *mutationResolver) UpdateGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, config.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return r.gitOpsService.UpdateGitOpsDetailsHandler(ctx, config)
}

func (r *queryResolver) GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetGitOpsDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.gitOpsService.GetGitOpsDetails(ctx, projectID)
}
