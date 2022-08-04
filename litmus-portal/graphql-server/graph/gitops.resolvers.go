package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	gitOpsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
)

// GitopsNotifier is the resolver for the gitopsNotifier field.
func (r *mutationResolver) GitopsNotifier(ctx context.Context, clusterInfo model.ClusterIdentity, workflowID string) (string, error) {
	return gitOpsHandler.GitOpsNotificationHandler(ctx, clusterInfo, workflowID)
}

// EnableGitOps is the resolver for the enableGitOps field.
func (r *mutationResolver) EnableGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, config.ProjectID,
		authorization.MutationRbacRules[authorization.EnableGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return gitOpsHandler.EnableGitOpsHandler(ctx, config)
}

// DisableGitOps is the resolver for the disableGitOps field.
func (r *mutationResolver) DisableGitOps(ctx context.Context, projectID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DisableGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return gitOpsHandler.DisableGitOpsHandler(ctx, projectID)
}

// UpdateGitOps is the resolver for the updateGitOps field.
func (r *mutationResolver) UpdateGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, config.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return gitOpsHandler.UpdateGitOpsDetailsHandler(ctx, config)
}

// GetGitOpsDetails is the resolver for the getGitOpsDetails field.
func (r *queryResolver) GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetGitOpsDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return gitOpsHandler.GetGitOpsDetails(ctx, projectID)
}
