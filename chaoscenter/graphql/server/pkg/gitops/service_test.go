package gitops

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
)

func TestUpdateExperiment_ReturnsDBError(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	dbErr := errors.New("connection refused")
	mockOp.On("List", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).
		Return((*mongo.Cursor)(nil), dbErr).Once()

	g := &gitOpsService{chaosExperimentOps: *chaos_experiment.NewChaosExperimentOperator(mockOp)}
	data := `{"metadata":{"name":"exp-1","labels":{"infra_id":"infra-1"}}}`

	err := g.updateExperiment(context.Background(), data, "exp-id-1", "experiments/exp-1.yaml", GitConfig{ProjectID: "project-1"})

	if !errors.Is(err, dbErr) {
		t.Errorf("updateExperiment() error = %v, want the DB error %q", err, dbErr)
	}
	mockOp.AssertExpectations(t)
}
