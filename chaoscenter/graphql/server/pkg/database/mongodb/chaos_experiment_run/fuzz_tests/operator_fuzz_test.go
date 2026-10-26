package fuzz_tests

import (
	"context"
	"testing"

	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MockServices struct {
	MongodbOperator            *dbMocks.MongoOperator
	ChaosExperimentRunOperator *dbChaosExperimentRun.Operator
}

func NewMockServices() *MockServices {
	mongodbMockOperator := new(dbMocks.MongoOperator)
	chaosExperimentRunOperator := dbChaosExperimentRun.NewChaosExperimentRunOperator(mongodbMockOperator)
	return &MockServices{
		MongodbOperator:            mongodbMockOperator,
		ChaosExperimentRunOperator: chaosExperimentRunOperator,
	}
}

func FuzzCreateExperimentRun(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			WfRun dbChaosExperimentRun.ChaosExperimentRun
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("Create",
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(nil).Once()

		err = mockServices.ChaosExperimentRunOperator.CreateExperimentRun(
			context.Background(),
			targetStruct.WfRun,
		)
		if err != nil {
			t.Logf("CreateExperimentRun() returned error (expected): %v", err)
		}
	})
}

func FuzzGetExperimentRun(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			Query bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		singleResult := mongo.NewSingleResultFromDocument(bson.D{}, nil, nil)
		mockServices.MongodbOperator.On("Get",
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(singleResult, nil).Once()

		_, err = mockServices.ChaosExperimentRunOperator.GetExperimentRun(
			targetStruct.Query,
		)
		if err != nil {
			t.Logf("GetExperimentRun() returned error (expected): %v", err)
		}
	})
}

func FuzzGetExperimentRuns(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			Query bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mockServices.MongodbOperator.On("List",
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(cursor, nil).Once()

		_, err = mockServices.ChaosExperimentRunOperator.GetExperimentRuns(
			targetStruct.Query,
		)
		if err != nil {
			t.Logf("GetExperimentRuns() returned error (expected): %v", err)
		}
	})
}

func FuzzUpdateExperimentRun(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			WfRun dbChaosExperimentRun.ChaosExperimentRun
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("CountDocuments",
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(int64(0), nil).Once()
		mockServices.MongodbOperator.On("Create",
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(nil).Once()

		_, err = mockServices.ChaosExperimentRunOperator.UpdateExperimentRun(
			context.Background(),
			targetStruct.WfRun,
		)
		if err != nil {
			t.Logf("UpdateExperimentRun() returned error (expected): %v", err)
		}
	})
}

func FuzzUpdateExperimentRunWithQuery(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			Query  bson.D
			Update bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("Update",
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(&mongo.UpdateResult{}, nil).Once()

		err = mockServices.ChaosExperimentRunOperator.UpdateExperimentRunWithQuery(
			context.Background(),
			targetStruct.Query,
			targetStruct.Update,
		)
		if err != nil {
			t.Logf("UpdateExperimentRunWithQuery() returned error (expected): %v", err)
		}
	})
}

func FuzzUpdateExperimentRunsWithQuery(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			Query  bson.D
			Update bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		mockServices.MongodbOperator.On("UpdateMany",
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(&mongo.UpdateResult{}, nil).Once()

		err = mockServices.ChaosExperimentRunOperator.UpdateExperimentRunsWithQuery(
			context.Background(),
			targetStruct.Query,
			targetStruct.Update,
		)
		if err != nil {
			t.Logf("UpdateExperimentRunsWithQuery() returned error (expected): %v", err)
		}
	})
}

func FuzzGetExperimentRunsByInfraID(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			InfraID string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mockServices.MongodbOperator.On("List",
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(cursor, nil).Once()

		_, err = mockServices.ChaosExperimentRunOperator.GetExperimentRunsByInfraID(
			targetStruct.InfraID,
		)
		if err != nil {
			t.Logf("GetExperimentRunsByInfraID() returned error (expected): %v", err)
		}
	})
}

func FuzzGetAggregateExperimentRuns(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			Pipeline mongo.Pipeline
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		mockServices := NewMockServices()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mockServices.MongodbOperator.On("Aggregate",
			mock.Anything,
			mock.Anything,
			mock.Anything,
			mock.Anything,
		).Return(cursor, nil).Once()

		_, err = mockServices.ChaosExperimentRunOperator.GetAggregateExperimentRuns(
			targetStruct.Pipeline,
		)
		if err != nil {
			t.Logf("GetAggregateExperimentRuns() returned error (expected): %v", err)
		}
	})
}
