package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/sirupsen/logrus"
)

func (r *mutationResolver) GitopsNotifier(ctx context.Context, clusterInfo model.InfraIdentity, experimentID string) (string, error) {
	infra, err := r.chaosInfrastructureService.VerifyInfra(clusterInfo)
	if err != nil {
		logrus.Error("Validation failed : ", clusterInfo.InfraID)
		return "Validation failed", err
	}
	return r.gitopsService.GitOpsNotificationHandler(ctx, *infra, experimentID)
}

func (r *mutationResolver) EnableGitOps(ctx context.Context, projectID string, configurations model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.EnableGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return r.gitopsService.EnableGitOpsHandler(ctx, projectID, configurations)
}

func (r *mutationResolver) DisableGitOps(ctx context.Context, projectID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DisableGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return r.gitopsService.DisableGitOpsHandler(ctx, projectID)
}

func (r *mutationResolver) UpdateGitOps(ctx context.Context, projectID string, configurations model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return r.gitopsService.UpdateGitOpsDetailsHandler(ctx, projectID, configurations)
}

func (r *queryResolver) GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetGitOpsDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.gitopsService.GetGitOpsDetails(ctx, projectID)
}
