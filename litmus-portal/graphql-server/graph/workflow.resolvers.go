package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	wfHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
	data_store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/sirupsen/logrus"
)

// CreateChaosWorkFlow is the resolver for the createChaosWorkFlow field.
func (r *mutationResolver) CreateChaosWorkFlow(ctx context.Context, request model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.CreateChaosWorkFlow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return wfHandler.CreateChaosWorkflow(ctx, &request, data_store.Store)
}

// ReRunChaosWorkFlow is the resolver for the reRunChaosWorkFlow field.
func (r *mutationResolver) ReRunChaosWorkFlow(ctx context.Context, projectID string, workflowID string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ReRunChaosWorkFlow],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		logrus.Print("Error getting username: ", err)
		return "", err
	}

	return wfHandler.ReRunChaosWorkFlow(projectID, workflowID, username)
}

// UpdateChaosWorkflow is the resolver for the updateChaosWorkflow field.
func (r *mutationResolver) UpdateChaosWorkflow(ctx context.Context, request *model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return wfHandler.UpdateChaosWorkflow(ctx, request, data_store.Store)
}

// DeleteChaosWorkflow is the resolver for the deleteChaosWorkflow field.
func (r *mutationResolver) DeleteChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.DeleteChaosWorkflow(ctx, projectID, workflowID, workflowRunID, data_store.Store)
}

// TerminateChaosWorkflow is the resolver for the terminateChaosWorkflow field.
func (r *mutationResolver) TerminateChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.TerminateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.TerminateChaosWorkflow(ctx, projectID, workflowID, workflowRunID, data_store.Store)
}

// ChaosWorkflowRun is the resolver for the chaosWorkflowRun field.
func (r *mutationResolver) ChaosWorkflowRun(ctx context.Context, request model.WorkflowRunRequest) (string, error) {
	return wfHandler.ChaosWorkflowRun(request, *data_store.Store)
}

// SyncWorkflowRun is the resolver for the syncWorkflowRun field.
func (r *mutationResolver) SyncWorkflowRun(ctx context.Context, projectID string, workflowID string, workflowRunID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.SyncWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.SyncWorkflowRun(ctx, projectID, workflowID, workflowRunID, data_store.Store)
}

// ListWorkflows is the resolver for the listWorkflows field.
func (r *queryResolver) ListWorkflows(ctx context.Context, request model.ListWorkflowsRequest) (*model.ListWorkflowsResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.ListWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.ListWorkflows(request)
}

// ListWorkflowRuns is the resolver for the listWorkflowRuns field.
func (r *queryResolver) ListWorkflowRuns(ctx context.Context, request model.ListWorkflowRunsRequest) (*model.ListWorkflowRunsResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.ListWorkflowRuns],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.ListWorkflowRuns(request)
}

// GetWorkflowEvents is the resolver for the getWorkflowEvents field.
func (r *subscriptionResolver) GetWorkflowEvents(ctx context.Context, projectID string) (<-chan *model.WorkflowRun, error) {
	logrus.Print("NEW WORKFLOW EVENT LISTENER: ", projectID)
	workflowEvent := make(chan *model.WorkflowRun, 1)
	data_store.Store.Mutex.Lock()
	data_store.Store.WorkflowEventPublish[projectID] = append(data_store.Store.WorkflowEventPublish[projectID], workflowEvent)
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		logrus.Print("CLOSED WORKFLOW LISTENER: ", projectID)
	}()
	return workflowEvent, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
