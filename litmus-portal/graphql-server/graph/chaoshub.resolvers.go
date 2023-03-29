package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	chaosHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaoshub/ops"
)

func (r *mutationResolver) AddChaosHub(ctx context.Context, request model.CreateChaosHubRequest) (*model.ChaosHub, error) {
	if err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.AddChaosHub],
		model.InvitationAccepted.String()); err != nil {
		return nil, err
	}

	return r.chaosHubService.AddChaosHub(ctx, request)
}

func (r *mutationResolver) AddRemoteChaosHub(ctx context.Context, request model.CreateRemoteChaosHub) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.SaveChaosHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosHubService.AddRemoteChaosHub(ctx, request)
}

func (r *mutationResolver) SaveChaosHub(ctx context.Context, request model.CreateChaosHubRequest) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.SaveChaosHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosHubService.SaveChaosHub(ctx, request)
}

func (r *mutationResolver) SyncChaosHub(ctx context.Context, id string, projectID string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}
	return r.chaosHubService.SyncHub(ctx, id, projectID)
}

func (r *mutationResolver) GenerateSSHKey(ctx context.Context) (*model.SSHKey, error) {
	publicKey, privateKey, err := chaosHubOps.GenerateKeys()
	if err != nil {
		return nil, err
	}

	return &model.SSHKey{
		PrivateKey: privateKey,
		PublicKey:  publicKey,
	}, nil
}

func (r *mutationResolver) UpdateChaosHub(ctx context.Context, request model.UpdateChaosHubRequest) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateChaosHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return r.chaosHubService.UpdateChaosHub(ctx, request)
}

func (r *mutationResolver) DeleteChaosHub(ctx context.Context, projectID string, hubID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteChaosHub],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return r.chaosHubService.DeleteChaosHub(ctx, hubID, projectID)
}

func (r *queryResolver) ListCharts(ctx context.Context, hubName string, projectID string) ([]*model.Chart, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListCharts],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosHubService.ListCharts(ctx, hubName, projectID)
}

func (r *queryResolver) GetHubExperiment(ctx context.Context, request model.ExperimentRequest) (*model.Chart, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.GetHubExperiment],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosHubService.GetHubExperiment(ctx, request)
}

func (r *queryResolver) ListHubStatus(ctx context.Context, projectID string) ([]*model.ChaosHubStatus, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListHubStatus],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosHubService.ListHubStatus(ctx, projectID)
}

func (r *queryResolver) GetYAMLData(ctx context.Context, request model.ExperimentRequest) (string, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.GetYAMLData],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	return r.chaosHubService.GetYAMLData(request)
}

func (r *queryResolver) GetExperimentDetails(ctx context.Context, request model.ExperimentRequest) (*model.ExperimentDetails, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.GetExperimentDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return r.chaosHubService.GetExperimentManifestDetails(ctx, request)
}

func (r *queryResolver) ListPredefinedWorkflows(ctx context.Context, hubName string, projectID string) ([]*model.PredefinedWorkflowList, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListPredefinedWorkflows],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosHubService.ListPredefinedWorkflows(hubName, projectID)
}

func (r *queryResolver) GetPredefinedExperimentYaml(ctx context.Context, request model.ExperimentRequest) (string, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.GetPredefinedExperimentYaml],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}
	return r.chaosHubService.GetPredefinedExperimentYAMLData(request)
}
