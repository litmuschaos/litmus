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

		shouldErr, err := fuzzConsumer.GetBool()
		if err != nil {
			return
		}
		var opErr error
		if shouldErr {
			opErr = context.Canceled
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		mongodbMockOperator.On("Create", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(opErr).Once()

		err = chaosExperimentOperator.InsertChaosExperiment(context.Background(), targetStruct.experiment)
		if (err != nil) != shouldErr {
			t.Errorf("InsertChaosExperiment() error = %v, shouldErr %v", err, shouldErr)
		}
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

		shouldErr, err := fuzzConsumer.GetBool()
		if err != nil {
			return
		}
		var opErr error
		if shouldErr {
			opErr = context.Canceled
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		findResult := bson.D{{Key: "experiment_id", Value: "test-id"}}
		singleResult := mongo.NewSingleResultFromDocument(findResult, nil, nil)
		var returnResult *mongo.SingleResult
		if !shouldErr {
			returnResult = singleResult
		}
		mongodbMockOperator.On("Get", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(returnResult, opErr).Once()

		_, err = chaosExperimentOperator.GetExperiment(context.Background(), targetStruct.query)
		if (err != nil) != shouldErr {
			t.Errorf("GetExperiment() error = %v, shouldErr %v", err, shouldErr)
		}
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

		shouldErr, err := fuzzConsumer.GetBool()
		if err != nil {
			return
		}
		var opErr error
		if shouldErr {
			opErr = context.Canceled
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		var returnCursor *mongo.Cursor
		if !shouldErr {
			returnCursor = cursor
		}
		mongodbMockOperator.On("List", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(returnCursor, opErr).Once()

		_, err = chaosExperimentOperator.GetExperiments(targetStruct.query)
		if (err != nil) != shouldErr {
			t.Errorf("GetExperiments() error = %v, shouldErr %v", err, shouldErr)
		}
	})
}

func FuzzGetExperimentsByInfraID(f *testing.F) {
	f.Fuzz(func(t *testing.T, infraID string, shouldErr bool) {
		var opErr error
		if shouldErr {
			opErr = context.Canceled
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		var returnCursor *mongo.Cursor
		if !shouldErr {
			returnCursor = cursor
		}
		mongodbMockOperator.On("List", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything).Return(returnCursor, opErr).Once()

		_, err := chaosExperimentOperator.GetExperimentsByInfraID(infraID)
		if (err != nil) != shouldErr {
			t.Errorf("GetExperimentsByInfraID() error = %v, shouldErr %v", err, shouldErr)
		}
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

		shouldErr, err := fuzzConsumer.GetBool()
		if err != nil {
			return
		}
		var opErr error
		if shouldErr {
			opErr = context.Canceled
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		cursor, _ := mongo.NewCursorFromDocuments(nil, nil, nil)
		var returnCursor *mongo.Cursor
		if !shouldErr {
			returnCursor = cursor
		}
		mongodbMockOperator.On("Aggregate", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(returnCursor, opErr).Once()

		_, err = chaosExperimentOperator.GetAggregateExperiments(targetStruct.pipeline)
		if (err != nil) != shouldErr {
			t.Errorf("GetAggregateExperiments() error = %v, shouldErr %v", err, shouldErr)
		}
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

		shouldErr, err := fuzzConsumer.GetBool()
		if err != nil {
			return
		}
		var opErr error
		if shouldErr {
			opErr = context.Canceled
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		var updateResult *mongo.UpdateResult
		if !shouldErr {
			updateResult = &mongo.UpdateResult{}
		}
		mongodbMockOperator.On("Update", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(updateResult, opErr).Once()

		err = chaosExperimentOperator.UpdateChaosExperiment(context.Background(), targetStruct.query, targetStruct.update)
		if (err != nil) != shouldErr {
			t.Errorf("UpdateChaosExperiment() error = %v, shouldErr %v", err, shouldErr)
		}
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

		shouldErr, err := fuzzConsumer.GetBool()
		if err != nil {
			return
		}
		var opErr error
		if shouldErr {
			opErr = context.Canceled
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		var updateResult *mongo.UpdateResult
		if !shouldErr {
			updateResult = &mongo.UpdateResult{}
		}
		mongodbMockOperator.On("UpdateMany", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything, mock.Anything).Return(updateResult, opErr).Once()

		err = chaosExperimentOperator.UpdateChaosExperiments(context.Background(), targetStruct.query, targetStruct.update)
		if (err != nil) != shouldErr {
			t.Errorf("UpdateChaosExperiments() error = %v, shouldErr %v", err, shouldErr)
		}
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

		shouldErr, err := fuzzConsumer.GetBool()
		if err != nil {
			return
		}
		var opErr error
		if shouldErr {
			opErr = context.Canceled
		}

		chaosExperimentOperator, mongodbMockOperator := newOperator()
		mongodbMockOperator.On("CountDocuments", mock.Anything, mongodb.ChaosExperimentCollection, mock.Anything, mock.Anything).Return(int64(0), opErr).Once()

		_, err = chaosExperimentOperator.CountChaosExperiments(context.Background(), targetStruct.query)
		if (err != nil) != shouldErr {
			t.Errorf("CountChaosExperiments() error = %v, shouldErr %v", err, shouldErr)
		}
	})
}
