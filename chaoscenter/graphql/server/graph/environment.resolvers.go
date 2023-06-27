package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/environment/handler"
	"github.com/sirupsen/logrus"
)

func (r *mutationResolver) CreateEnvironment(ctx context.Context, projectID string, request *model.CreateEnvironmentRequest) (*model.Environment, error) {
	logFields := logrus.Fields{
		"projectId": projectID,
	}
	logrus.WithFields(logFields).Info("request received to create new environment")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.CreateEnvironment],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return handler.CreateEnvironment(ctx, projectID, request)
}

func (r *mutationResolver) UpdateEnvironment(ctx context.Context, projectID string, request *model.UpdateEnvironmentRequest) (string, error) {
	logFields := logrus.Fields{
		"projectId":     projectID,
		"environmentId": request.EnvironmentID,
	}
	logrus.WithFields(logFields).Info("request received to update environment")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateEnvironment],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}
	return handler.UpdateEnvironment(ctx, projectID, request)
}

func (r *mutationResolver) DeleteEnvironment(ctx context.Context, projectID string, environmentID string) (string, error) {
	logFields := logrus.Fields{
		"projectId":     projectID,
		"environmentId": environmentID,
	}
	logrus.WithFields(logFields).Info("request received to delete environment")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteEnvironment],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}
	return handler.DeleteEnvironment(ctx, projectID, environmentID)
}

func (r *queryResolver) GetEnvironment(ctx context.Context, projectID string, environmentID string) (*model.Environment, error) {
	logFields := logrus.Fields{
		"projectId":     projectID,
		"environmentId": environmentID,
	}
	logrus.WithFields(logFields).Info("request received to get environment")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetEnvironment],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return handler.GetEnvironment(projectID, environmentID)
}

func (r *queryResolver) ListEnvironments(ctx context.Context, projectID string, request *model.ListEnvironmentRequest) (*model.ListEnvironmentResponse, error) {
	logFields := logrus.Fields{
		"projectId": projectID,
	}
	logrus.WithFields(logFields).Info("request received to list environments")
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListEnvironments],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return handler.ListEnvironments(projectID, request)
}
