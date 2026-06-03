package fuzz_tests

import (
	"context"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func newOperator() (*dbChaosExperiment.Operator, *dbMocks.MongoOperator) {
	mongodbMockOperator := new(dbMocks.MongoOperator)
	chaosExperimentOperator := dbChaosExperiment.NewChaosExperimentOperator(mongodbMockOperator)
	return chaosExperimentOperator, mongodbMockOperator
}

func FuzzInsertChaosExperiment(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			experiment dbChaosExperiment.ChaosExperimentRequest
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		mongodbMockOperator.On("Create", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(nil).Once()

		_ = chaosExperimentOperator.InsertChaosExperiment(context.Background(), targetStruct.experiment)
	})
}

func FuzzGetExperiment(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			query bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		findResult := bson.D{{Key: "experiment_id", Value: "test-id"}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(singleResult, nil).Once()

		_, _ = chaosExperimentOperator.GetExperiment(context.Background(), targetStruct.query)
	})
}

func FuzzGetExperiments(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			query bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongodbMockOperator.On("List", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(cursor, nil).Once()

		_, _ = chaosExperimentOperator.GetExperiments(targetStruct.query)
	})
}

func FuzzGetExperimentsByInfraID(f *testing.F) {
	f.Fuzz(func(t *testing.T, infraID string) {
		chaosExperimentOperator, mongodbMockOperator := newOperator()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongodbMockOperator.On("List", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(cursor, nil).Once()

		_, _ = chaosExperimentOperator.GetExperimentsByInfraID(infraID)
	})
}

func FuzzGetAggregateExperiments(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			pipeline mongo.Pipeline
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(cursor, nil).Once()

		_, _ = chaosExperimentOperator.GetAggregateExperiments(targetStruct.pipeline)
	})
}

func FuzzUpdateChaosExperiment(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			query  bson.D
			update bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()

		_ = chaosExperimentOperator.UpdateChaosExperiment(context.Background(), targetStruct.query, targetStruct.update)
	})
}

func FuzzUpdateChaosExperiments(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			query  bson.D
			update bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		mongodbMockOperator.On("UpdateMany", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(&mongo.UpdateResult{}, nil).Once()

		_ = chaosExperimentOperator.UpdateChaosExperiments(context.Background(), targetStruct.query, targetStruct.update)
	})
}

func FuzzCountChaosExperiments(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			query bson.D
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		mongodbMockOperator.On("CountDocuments", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(int64(0), nil).Once()

		_, _ = chaosExperimentOperator.CountChaosExperiments(context.Background(), targetStruct.query)
	})
}
