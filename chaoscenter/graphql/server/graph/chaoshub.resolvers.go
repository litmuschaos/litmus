package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	chaosHubOps "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/ops"
)

func (r *mutationResolver) AddChaosHub(ctx context.Context, projectID string, request model.CreateChaosHubRequest) (*model.ChaosHub, error) {
	if err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.AddChaosHub],
		model.InvitationAccepted.String()); err != nil {
		return nil, err
	}

	return r.chaosHubService.AddChaosHub(ctx, request, projectID)
}

func (r *mutationResolver) AddRemoteChaosHub(ctx context.Context, projectID string, request model.CreateRemoteChaosHub) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.SaveChaosHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosHubService.AddRemoteChaosHub(ctx, request, projectID)
}

func (r *mutationResolver) SaveChaosHub(ctx context.Context, projectID string, request model.CreateChaosHubRequest) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.SaveChaosHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.chaosHubService.SaveChaosHub(ctx, request, projectID)
}

func (r *mutationResolver) SyncChaosHub(ctx context.Context, id string, projectID string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}
	return r.chaosHubService.SyncChaosHub(ctx, id, projectID)
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

func (r *mutationResolver) UpdateChaosHub(ctx context.Context, projectID string, request model.UpdateChaosHubRequest) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateChaosHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return r.chaosHubService.UpdateChaosHub(ctx, request, projectID)
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

func (r *queryResolver) ListChaosFaults(ctx context.Context, hubID string, projectID string) ([]*model.Chart, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListCharts],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return r.chaosHubService.ListChaosFaults(ctx, hubID, projectID)
}

func (r *queryResolver) GetChaosFault(ctx context.Context, projectID string, request model.ExperimentRequest) (*model.FaultDetails, error) {
	return r.chaosHubService.GetChaosFault(ctx, request, projectID)
}

func (r *queryResolver) ListChaosHub(ctx context.Context, projectID string, request *model.ListChaosHubRequest) ([]*model.ChaosHubStatus, error) {
	return r.chaosHubService.ListChaosHubs(ctx, projectID, request)
}

func (r *queryResolver) GetChaosHub(ctx context.Context, projectID string, chaosHubID string) (*model.ChaosHubStatus, error) {
	return r.chaosHubService.GetChaosHub(ctx, chaosHubID, projectID)
}

func (r *queryResolver) ListPredefinedExperiments(ctx context.Context, hubID string, projectID string) ([]*model.PredefinedExperimentList, error) {
	return r.chaosHubService.ListPredefinedExperiments(ctx, hubID, projectID)
}

func (r *queryResolver) GetPredefinedExperiment(ctx context.Context, hubID string, experimentName []string, projectID string) ([]*model.PredefinedExperimentList, error) {
	return r.chaosHubService.GetPredefinedExperiment(ctx, hubID, experimentName, projectID)
}

func (r *queryResolver) GetChaosHubStats(ctx context.Context, projectID string) (*model.GetChaosHubStatsResponse, error) {
	return r.chaosHubService.GetChaosHubStats(ctx, projectID)
}
