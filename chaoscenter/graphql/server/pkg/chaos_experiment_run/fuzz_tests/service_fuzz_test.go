package fuzz_tests

import (
	"context"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MockServices struct {
	ChaosExperimentOperator     *dbChaosExperiment.Operator
	ChaosExperimentRunOperator  *dbChaosExperimentRun.Operator
	ChaosInfrastructureOperator *dbChaosInfra.Operator
	MongodbOperator             *dbMocks.MongoOperator
	ChaosExperimentRunService   chaos_experiment_run.Service
}

func NewMockServices() *MockServices {
	var (
		mongodbMockOperator                                      = new(dbMocks.MongoOperator)
		chaosExperimentOperator                                  = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
		chaosExperimentRunOperator                               = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
		chaosInfrastructureOperator                              = dbChaosInfra.NewInfrastructureOperator(mongodbMockOperator)
		chaosExperimentRunService   chaos_experiment_run.Service = chaos_experiment_run.NewChaosExperimentRunService(
			chaosExperimentOperator,
			chaosInfrastructureOperator,
			chaosExperimentRunOperator,
		)
	)
	return &MockServices{
		ChaosExperimentOperator:     chaosExperimentOperator,
		ChaosExperimentRunOperator:  chaosExperimentRunOperator,
		ChaosInfrastructureOperator: chaosInfrastructureOperator,
		MongodbOperator:             mongodbMockOperator,
		ChaosExperimentRunService:   chaosExperimentRunService,
	}
}

func FuzzProcessExperimentRunDelete(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			Query          bson.D
			WorkflowRunID  *string
			ExperimentRun  dbChaosExperimentRun.ChaosExperimentRun
			Workflow       dbChaosExperiment.ChaosExperimentRequest
			Username       string
			StoreStateData *store.StateData
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("Update", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()

		err = mockServices.ChaosExperimentRunService.ProcessExperimentRunDelete(
			context.Background(),
			targetStruct.Query,
			targetStruct.WorkflowRunID,
			targetStruct.ExperimentRun,
			targetStruct.Workflow,
			targetStruct.Username,
			targetStruct.StoreStateData,
		)
		if err != nil {
			t.Errorf("ProcessExperimentRunDelete() error = %v", err)
		}
	})
}

func FuzzProcessExperimentRunStop(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			Query           bson.D
			ExperimentRunID *string
			Experiment      dbChaosExperiment.ChaosExperimentRequest
			Username        string
			ProjectID       string
			StoreStateData  *store.StateData
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()
		err = mockServices.ChaosExperimentRunService.ProcessExperimentRunStop(
			context.Background(),
			targetStruct.Query,
			targetStruct.ExperimentRunID,
			targetStruct.Experiment,
			targetStruct.Username,
			targetStruct.ProjectID,
			targetStruct.StoreStateData,
		)
		if err != nil {
			t.Errorf("ProcessExperimentRunStop() error = %v", err)
		}
	})
}

func FuzzProcessCompletedExperimentRun(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			ExecData chaos_experiment_run.ExecutionData
			WfID     string
			RunID    string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		findResult := []interface{}{bson.D{
			{Key: "experiment_id", Value: targetStruct.WfID},
		}}
		mockServices := NewMockServices()
		singleResult := mongo.NewSingleResultFromDocument(findResult[0], nil, nil)
		mockServices.MongodbOperator.On("Get", mock.Anything, mock.Anything, mock.Anything).Return(singleResult, nil).Once()

		_, err = mockServices.ChaosExperimentRunService.ProcessCompletedExperimentRun(
			targetStruct.ExecData,
			targetStruct.WfID,
			targetStruct.RunID,
		)
		if err != nil {
			t.Errorf("ProcessCompletedExperimentRun() error = %v", err)
		}
	})
}
