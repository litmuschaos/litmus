package handler

import (
	"context"
	"errors"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
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
	mockOp.AssertNotCalled(t, "Create", mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}

