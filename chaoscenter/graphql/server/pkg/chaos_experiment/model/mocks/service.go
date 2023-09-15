package mocks

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
)

type ChaosExperimentService struct {
	mock.Mock
}

func (m *ChaosExperimentService) ProcessExperiment(workflow *model.ChaosExperimentRequest, projectID string, revID string) (*model.ChaosExperimentRequest, *dbChaosExperiment.ChaosExperimentType, error) {
	args := m.Called(workflow, projectID, revID)
	return args.Get(0).(*model.ChaosExperimentRequest), args.Get(1).(*dbChaosExperiment.ChaosExperimentType), args.Error(2)
}

func (m *ChaosExperimentService) ProcessExperimentCreation(ctx context.Context, input *model.ChaosExperimentRequest, username string, projectID string, wfType *dbChaosExperiment.ChaosExperimentType, revisionID string, r *store.StateData) error {
	args := m.Called(ctx, input, username, projectID, wfType, revisionID, r)
	return args.Error(0)
}

func (m *ChaosExperimentService) ProcessExperimentUpdate(workflow *model.ChaosExperimentRequest, username string, wfType *dbChaosExperiment.ChaosExperimentType, revisionID string, updateRevision bool, projectID string, r *store.StateData) error {
	args := m.Called(workflow, username, wfType, revisionID, updateRevision, projectID, r)
	return args.Error(0)
}

func (m *ChaosExperimentService) ProcessExperimentDelete(query bson.D, workflow dbChaosExperiment.ChaosExperimentRequest, username string, r *store.StateData) error {
	args := m.Called(query, workflow, username, r)
	return args.Error(0)
}
