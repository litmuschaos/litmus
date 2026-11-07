package handler

import (
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func TestChaosExperimentRunHandler_ListExperimentRun_SearchesLiterally(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	var pipeline mongo.Pipeline
	mockOp.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything).
		Run(func(args mock.Arguments) {
			pipeline = args.Get(2).(mongo.Pipeline)
		}).Return((*mongo.Cursor)(nil), errors.New("stop after the pipeline is built")).Once()

	runHandler := NewChaosExperimentRunHandler(nil, nil, nil, nil, dbChaosExperimentRun.NewChaosExperimentRunOperator(mockOp), nil, mockOp)
	name, runID := "exp (a.b", "run+1"
	_, err := runHandler.ListExperimentRun("project-1", model.ListExperimentRunRequest{
		Filter: &model.ExperimentRunFilterInput{ExperimentName: &name, ExperimentRunID: &runID},
	})

	assert.Error(t, err)
	assert.Contains(t, pipeline, bson.D{{"$match", bson.D{{"experiment.name", bson.D{{"$regex", `exp \(a\.b`}}}}}})
	assert.Contains(t, pipeline, bson.D{{"$match", bson.D{{"experiment_run_id", bson.D{{"$regex", `run\+1`}}}}}})
}
