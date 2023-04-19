package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	dataStore "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	log "github.com/sirupsen/logrus"
)

func (r *mutationResolver) CreateChaosWorkFlow(ctx context.Context, request model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.CreateChaosWorkFlow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return r.chaosWorkflowHandler.CreateChaosWorkflow(ctx, &request, dataStore.Store)
}

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
		log.Error("error getting username: ", err)
		return "", err
	}

	return r.chaosWorkflowHandler.ReRunChaosWorkFlow(projectID, workflowID, username)
}

func (r *mutationResolver) UpdateChaosWorkflow(ctx context.Context, request *model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return r.chaosWorkflowHandler.UpdateChaosWorkflow(ctx, request, dataStore.Store)
}

func (r *mutationResolver) DeleteChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return r.chaosWorkflowHandler.DeleteChaosWorkflow(ctx, projectID, workflowID, workflowRunID, dataStore.Store)
}

func (r *mutationResolver) TerminateChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.TerminateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return r.chaosWorkflowHandler.TerminateChaosWorkflow(ctx, projectID, workflowID, workflowRunID, dataStore.Store)
}

func (r *mutationResolver) ChaosWorkflowRun(ctx context.Context, request model.WorkflowRunRequest) (string, error) {
	return r.chaosWorkflowHandler.ChaosWorkflowRun(request, *dataStore.Store)
}

func (r *mutationResolver) SyncWorkflowRun(ctx context.Context, projectID string, workflowID string, workflowRunID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.SyncWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return r.chaosWorkflowHandler.SyncWorkflowRun(ctx, projectID, workflowID, workflowRunID, dataStore.Store)
}

func (r *queryResolver) ListWorkflows(ctx context.Context, request model.ListWorkflowsRequest) (*model.ListWorkflowsResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.ListWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosWorkflowHandler.ListWorkflows(request)
}

func (r *queryResolver) ListWorkflowRuns(ctx context.Context, request model.ListWorkflowRunsRequest) (*model.ListWorkflowRunsResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.ListWorkflowRuns],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosWorkflowHandler.ListWorkflowRuns(request)
}

func (r *subscriptionResolver) GetWorkflowEvents(ctx context.Context, projectID string) (<-chan *model.WorkflowRun, error) {
	log.Info("new workflow event listener: ", projectID)
	workflowEvent := make(chan *model.WorkflowRun, 1)
	dataStore.Store.Mutex.Lock()
	dataStore.Store.WorkflowEventPublish[projectID] = append(dataStore.Store.WorkflowEventPublish[projectID], workflowEvent)
	dataStore.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Info("closed workflow listener: ", projectID)
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
