package handler

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"
)

// storedHTTPProbe returns a mongo operator mock that serves an existing HTTP probe.
func storedHTTPProbe(t *testing.T) *dbMocks.MongoOperator {
	t.Helper()
	mockOp := new(dbMocks.MongoOperator)
	existing := dbSchemaProbe.Probe{
		ProjectID:          "project-1",
		ResourceDetails:    mongodb.ResourceDetails{Name: "my-probe"},
		Type:               dbSchemaProbe.ProbeType(model.ProbeTypeHTTPProbe),
		InfrastructureType: model.InfrastructureTypeKubernetes,
	}
	singleResult := mongo.NewSingleResultFromDocument(existing, nil, nil)
	mockOp.On("Get", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything).
		Return(singleResult, nil).Once()
	return mockOp
}

func TestUpdateProbe_RejectsTypeChange(t *testing.T) {
	mockOp := storedHTTPProbe(t)
	svc := newProbeServiceWithMock(mockOp)

	_, err := svc.UpdateProbe(context.Background(), model.ProbeRequest{
		Name:               "my-probe",
		Type:               model.ProbeTypeCmdProbe,
		InfrastructureType: model.InfrastructureTypeKubernetes,
		KubernetesCMDProperties: &model.KubernetesCMDProbeRequest{
			ProbeTimeout: "1s", Interval: "1s", Command: "echo",
			Comparator: &model.ComparatorInput{Type: "string", Criteria: "==", Value: "x"},
		},
	}, "project-1", "admin")

	assert.EqualError(t, err, "probe type cannot be changed from httpProbe to cmdProbe")
	mockOp.AssertNotCalled(t, "Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}

func TestUpdateProbe_RejectsMissingProperties(t *testing.T) {
	mockOp := storedHTTPProbe(t)
	svc := newProbeServiceWithMock(mockOp)

	_, err := svc.UpdateProbe(context.Background(), model.ProbeRequest{
		Name:               "my-probe",
		Type:               model.ProbeTypeHTTPProbe,
		InfrastructureType: model.InfrastructureTypeKubernetes,
	}, "project-1", "admin")

	assert.EqualError(t, err, "http probe type's properties are empty")
	mockOp.AssertNotCalled(t, "Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}
