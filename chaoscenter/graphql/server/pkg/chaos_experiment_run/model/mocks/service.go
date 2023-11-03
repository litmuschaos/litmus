package mocks

import (
	"context"

	types "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
)

type ChaosExperimentRunService struct {
	mock.Mock
}

// ProcessExperimentRunDelete mocks the ProcessExperimentRunDelete of chaos-experiment-run service
func (c *ChaosExperimentRunService) ProcessExperimentRunDelete(ctx context.Context, query bson.D, workflowRunID *string, experimentRun dbChaosExperimentRun.ChaosExperimentRun, workflow dbChaosExperiment.ChaosExperimentRequest, username string, r *store.StateData) error {
	args := c.Called(ctx, query, workflowRunID, experimentRun, workflow, username, r)
	return args.Error(0)
}

// ProcessCompletedExperimentRun mocks the ProcessCompletedExperimentRun of chaos-experiment-run service
func (c *ChaosExperimentRunService) ProcessCompletedExperimentRun(execData types.ExecutionData, wfID string, runID string) (types.ExperimentRunMetrics, error) {
	args := c.Called(execData, wfID, runID)
	return args.Get(0).(types.ExperimentRunMetrics), args.Error(1)
}
