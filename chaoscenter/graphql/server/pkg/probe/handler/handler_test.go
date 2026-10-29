package handler

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"
)

func newProbeServiceWithMock(mockOp *dbMocks.MongoOperator) Service {
	return NewProbeService(dbSchemaProbe.NewChaosProbeOperator(mockOp))
}

func TestValidateUniqueProbe_ReturnsTrue_WhenUnique(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	mockOp.On("CountDocuments", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, mock.Anything).
		Return(int64(0), nil).Once()

	unique, err := svc.ValidateUniqueProbe(context.Background(), "my-probe", "project-1")

	assert.NoError(t, err)
	assert.True(t, unique)
	mockOp.AssertExpectations(t)
}

func TestValidateUniqueProbe_ReturnsFalse_WhenDuplicate(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	mockOp.On("CountDocuments", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, mock.Anything).
		Return(int64(1), nil).Once()

	unique, err := svc.ValidateUniqueProbe(context.Background(), "my-probe", "project-1")

	assert.NoError(t, err)
	assert.False(t, unique)
	mockOp.AssertExpectations(t)
}

func TestValidateUniqueProbe_ReturnsError_WhenDBFails(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	dbErr := errors.New("db down")
	mockOp.On("CountDocuments", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, mock.Anything).
		Return(int64(0), dbErr).Once()

	unique, err := svc.ValidateUniqueProbe(context.Background(), "my-probe", "project-1")

	assert.Error(t, err)
	assert.Equal(t, dbErr, err)
	assert.False(t, unique)
	mockOp.AssertExpectations(t)
}

func TestAddProbe_DuplicateName(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	mockOp.On("CountDocuments", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, mock.Anything).
		Return(int64(1), nil).Once()

	_, err := svc.AddProbe(context.Background(), model.ProbeRequest{Name: "postman-test-probe-1"}, "project-1")

	assert.Error(t, err)
	assert.Equal(t, "probe already exists", err.Error())
	mockOp.AssertNotCalled(t, "Create", mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}

func TestAddProbe_MissingJWTToken(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	mockOp.On("CountDocuments", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, mock.Anything).
		Return(int64(0), nil).Once()

	_, err := svc.AddProbe(context.Background(), model.ProbeRequest{
		Name: "my-probe",
		Type: model.ProbeTypeHTTPProbe,
	}, "project-1")

	assert.Error(t, err)
	assert.Equal(t, "JWT token not found", err.Error())
	mockOp.AssertNotCalled(t, "Create", mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}

func TestAddProbe_DBErrorOnUniquenessCheck(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	dbErr := errors.New("mongo connection lost")
	mockOp.On("CountDocuments", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, mock.Anything).
		Return(int64(0), dbErr).Once()

	_, err := svc.AddProbe(context.Background(), model.ProbeRequest{
		Name: "my-probe",
		Type: model.ProbeTypeHTTPProbe,
	}, "project-1")

	assert.Error(t, err)
	assert.Equal(t, dbErr, err)
	mockOp.AssertNotCalled(t, "Create", mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}

func TestGetProbe_DBError(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	dbErr := errors.New("db connection failed")
	singleResult := mongo.NewSingleResultFromDocument(nil, dbErr, nil)
	mockOp.On("Get", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything).
		Return(singleResult, nil).Once()

	_, err := svc.GetProbe(context.Background(), "my-probe", "project-1")

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "document is nil")
	mockOp.AssertExpectations(t)
}

func probeReferenceRun(experimentID string, updatedAt int) interface{} {
	return bson.D{
		{Key: "experiment_id", Value: experimentID},
		{Key: "experiment_name", Value: "exp-" + experimentID},
		{Key: "execution_data", Value: `{"nodes":{}}`},
		{Key: "updated_at", Value: updatedAt},
		{Key: "updated_by", Value: bson.D{{Key: "username", Value: "admin"}}},
		{Key: "probes", Value: bson.A{
			bson.D{{Key: "fault_name", Value: "pod-delete"}, {Key: "probe_names", Value: bson.A{"my-probe"}}},
		}},
	}
}

func TestGetProbeReference_FetchesExecutionHistorySeparately(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	probeCursor, err := mongo.NewCursorFromDocuments([]interface{}{
		bson.D{{Key: "project_id", Value: "project-1"}, {Key: "name", Value: "my-probe"}},
	}, nil, nil)
	assert.NoError(t, err)
	runsCursor, err := mongo.NewCursorFromDocuments([]interface{}{
		probeReferenceRun("e1", 100),
		probeReferenceRun("e2", 200),
	}, nil, nil)
	assert.NoError(t, err)

	// The probe query must not embed the runs: a $lookup into a single
	// document fails with BSONObjectTooLarge for heavily used probes.
	mockOp.On("Aggregate", mock.Anything, mongodb.ChaosProbeCollection, mock.MatchedBy(func(pipeline mongo.Pipeline) bool {
		for _, stage := range pipeline {
			for _, elem := range stage {
				if elem.Key == "$lookup" {
					return false
				}
			}
		}
		return true
	}), mock.Anything).Return(probeCursor, nil).Once()
	mockOp.On("Aggregate", mock.Anything, mongodb.ChaosExperimentRunsCollection, mock.MatchedBy(func(pipeline mongo.Pipeline) bool {
		match, ok := pipeline[0].Map()["$match"].(bson.D)
		if !ok {
			return false
		}
		m := match.Map()
		return m["project_id"] != nil && m["probes.probe_names"] != nil
	}), mock.Anything).Return(runsCursor, nil).Once()

	resp, err := svc.GetProbeReference(context.Background(), "my-probe", "project-1")

	assert.NoError(t, err)
	assert.Equal(t, "my-probe", resp.Name)
	assert.Equal(t, 2, resp.TotalRuns)
	assert.Len(t, resp.RecentExecutions, 1)
	assert.Len(t, resp.RecentExecutions[0].ExecutionHistory, 2)
	assert.Equal(t, "e2", resp.RecentExecutions[0].ExecutionHistory[0].ExecutedByExperiment.ExperimentID)
	mockOp.AssertExpectations(t)
}

func TestGetProbeReference_ProbeNotFound(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)

	probeCursor, err := mongo.NewCursorFromDocuments([]interface{}{}, nil, nil)
	assert.NoError(t, err)
	mockOp.On("Aggregate", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, mock.Anything).
		Return(probeCursor, nil).Once()

	resp, err := svc.GetProbeReference(context.Background(), "missing", "project-1")

	assert.Error(t, err)
	assert.Nil(t, resp)
	mockOp.AssertExpectations(t)
}
