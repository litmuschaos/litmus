package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	wfHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
)

// CreateWorkflowTemplate is the resolver for the createWorkflowTemplate field.
func (r *mutationResolver) CreateWorkflowTemplate(ctx context.Context, request *model.TemplateInput) (*model.WorkflowTemplate, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.CreateWorkflowTemplate],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.CreateWorkflowTemplate(ctx, request)
}

// DeleteWorkflowTemplate is the resolver for the deleteWorkflowTemplate field.
func (r *mutationResolver) DeleteWorkflowTemplate(ctx context.Context, projectID string, templateID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteWorkflowTemplate],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.DeleteWorkflowTemplate(ctx, projectID, templateID)
}

// ListWorkflowManifests is the resolver for the listWorkflowManifests field.
func (r *queryResolver) ListWorkflowManifests(ctx context.Context, projectID string) ([]*model.WorkflowTemplate, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListWorkflowManifests],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.ListWorkflowManifests(ctx, projectID)
}

// GetWorkflowManifestByID is the resolver for the getWorkflowManifestByID field.
func (r *queryResolver) GetWorkflowManifestByID(ctx context.Context, projectID string, templateID string) (*model.WorkflowTemplate, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetWorkflowManifestByID],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.GetWorkflowManifestByID(ctx, templateID)
}
