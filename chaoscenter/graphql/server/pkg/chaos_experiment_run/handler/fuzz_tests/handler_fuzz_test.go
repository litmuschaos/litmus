package fuzz_tests

import (
	"context"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/handler"
	chaosExperimentRunMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run/model/mocks"
	chaosInfraMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbGitOpsMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops/model/mocks"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/stretchr/testify/mock"
)

type MockServices struct {
	ChaosExperimentRunService  *chaosExperimentRunMocks.ChaosExperimentRunService
	InfrastructureService      *chaosInfraMocks.InfraService
	GitOpsService              *dbGitOpsMocks.GitOpsService
	ChaosExperimentOperator    *dbChaosExperiment.Operator
	ChaosExperimentRunOperator *dbChaosExperimentRun.Operator
	MongodbOperator            *dbMocks.MongoOperator
	ChaosExperimentRunHandler  *handler.ChaosExperimentRunHandler
}

func NewMockServices() *MockServices {
	var (
		mongodbMockOperator        = new(dbMocks.MongoOperator)
		infrastructureService      = new(chaosInfraMocks.InfraService)
		gitOpsService              = new(dbGitOpsMocks.GitOpsService)
		chaosExperimentRunService  = new(chaosExperimentRunMocks.ChaosExperimentRunService)
		chaosExperimentOperator    = dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
		chaosExperimentRunOperator = dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
	)
	var chaosExperimentRunHandler = handler.NewChaosExperimentRunHandler(
		chaosExperimentRunService,
		infrastructureService,
		gitOpsService,
		chaosExperimentOperator,
		chaosExperimentRunOperator,
		mongodbMockOperator,
	)
	return &MockServices{
		ChaosExperimentRunService:  chaosExperimentRunService,
		InfrastructureService:      infrastructureService,
		GitOpsService:              gitOpsService,
		ChaosExperimentOperator:    chaosExperimentOperator,
		ChaosExperimentRunOperator: chaosExperimentRunOperator,
		MongodbOperator:            mongodbMockOperator,
		ChaosExperimentRunHandler:  chaosExperimentRunHandler,
	}
}

func FuzzGetExperimentRun(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			ProjectID       string
			ExperimentRunID *string
			NotifyID        *string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("GetAggregateExperimentRuns", mock.Anything).Return(mock.Anything, nil).Once()

		res, err := mockServices.ChaosExperimentRunHandler.GetExperimentRun(context.Background(), targetStruct.ProjectID, targetStruct.ExperimentRunID, targetStruct.NotifyID)
		if err != nil {
			t.Errorf("GetExperimentRun() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}

func FuzzListExperimentRun(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			ProjectID string
			Request   model.ListExperimentRunRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("GetAggregateExperimentRuns", mock.Anything).Return(mock.Anything, nil).Once()

		res, err := mockServices.ChaosExperimentRunHandler.ListExperimentRun(targetStruct.ProjectID, targetStruct.Request)
		if err != nil {
			t.Errorf("ListExperimentRun() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}

func FuzzRunChaosWorkFlow(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			ProjectID string
			Workflow  dbChaosExperiment.ChaosExperimentRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("StartSession").Return(mock.Anything, nil).Once()

		res, err := mockServices.ChaosExperimentRunHandler.RunChaosWorkFlow(context.Background(), targetStruct.ProjectID, targetStruct.Workflow, nil)
		if err != nil {
			t.Errorf("RunChaosWorkFlow() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}

func FuzzGetExperimentRunStats(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		projectID, err := fuzzConsumer.GetString()
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("GetAggregateExperimentRuns", mock.Anything).Return(mock.Anything, nil).Once()

		res, err := mockServices.ChaosExperimentRunHandler.GetExperimentRunStats(context.Background(), projectID)
		if err != nil {
			t.Errorf("GetExperimentRunStats() error = %v", err)
			return
		}
		if res == nil {
			t.Errorf("Returned response is nil")
		}
	})
}
