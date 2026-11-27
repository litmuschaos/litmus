package handler

import (
	"context"
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// A re-run has to get past reading the ChaosEngine annotations, up to the first database write,
// when the engine carries annotations that aren't probe references.
func TestChaosExperimentRunHandler_RunChaosWorkFlow_IgnoresOtherAnnotations(t *testing.T) {
	const manifest = `{"kind":"Workflow","metadata":{"name":"exp","labels":{"infra_id":"infra-1"}},"spec":{"templates":[{"name":"pod-delete",` +
		`"inputs":{"artifacts":[{"name":"pod-delete","raw":{"data":"apiVersion: litmuschaos.io/v1alpha1\nkind: ChaosEngine\n` +
		`metadata:\n  generateName: pod-delete\n  annotations:\n    team.example.com/owner: sre\n` +
		`    probeRef: '[{\"name\":\"http-probe\",\"mode\":\"SOT\"}]'\nspec:\n  experiments:\n  - name: pod-delete\n"}}]}}]}}`

	mockOp := new(dbMocks.MongoOperator)
	infra := mongo.NewSingleResultFromDocument(bson.D{{Key: "infra_id", Value: "infra-1"}, {Key: "is_active", Value: true}}, nil, nil)
	mockOp.On("Get", mock.Anything, mongodb.ChaosInfraCollection, mock.Anything).Return(infra, nil).Once()
	updateErr := errors.New("update failed")
	mockOp.On("Update", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).
		Return(&mongo.UpdateResult{}, updateErr).Once()

	runHandler := NewChaosExperimentRunHandler(nil, nil, nil, dbChaosExperiment.NewChaosExperimentOperator(mockOp), nil, nil, mockOp)
	_, err := runHandler.RunChaosWorkFlow(context.Background(), "project-1", dbChaosExperiment.ChaosExperimentRequest{
		ExperimentID: "experiment-1",
		InfraID:      "infra-1",
		Revision:     []dbChaosExperiment.ExperimentRevision{{ExperimentManifest: manifest}},
	}, nil)

	assert.ErrorIs(t, err, updateErr)
	mockOp.AssertExpectations(t)
}
