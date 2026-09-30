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

func TestValidateProbeUpdate_RejectsTypeChangeWithoutWriting(t *testing.T) {
	mockOp := storedHTTPProbe(t)
	svc := newProbeServiceWithMock(mockOp)

	err := svc.ValidateProbeUpdate(context.Background(), model.ProbeRequest{
		Name:               "my-probe",
		Type:               model.ProbeTypeK8sProbe,
		InfrastructureType: model.InfrastructureTypeKubernetes,
		K8sProperties:      &model.K8SProbeRequest{ProbeTimeout: "1s", Interval: "1s", Version: "v1", Resource: "pods", Operation: "present"},
	}, "project-1")

	assert.EqualError(t, err, "probe type cannot be changed from httpProbe to k8sProbe")
	mockOp.AssertNotCalled(t, "Update", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}

func TestValidateProbeUpdate_AcceptsMatchingRequest(t *testing.T) {
	mockOp := storedHTTPProbe(t)
	svc := newProbeServiceWithMock(mockOp)

	err := svc.ValidateProbeUpdate(context.Background(), model.ProbeRequest{
		Name:               "my-probe",
		Type:               model.ProbeTypeHTTPProbe,
		InfrastructureType: model.InfrastructureTypeKubernetes,
		KubernetesHTTPProperties: &model.KubernetesHTTPProbeRequest{
			ProbeTimeout: "1s", Interval: "1s", URL: "http://x",
			Method: &model.MethodRequest{Get: &model.GETRequest{Criteria: "==", ResponseCode: "200"}},
		},
	}, "project-1")

	assert.NoError(t, err)
	mockOp.AssertExpectations(t)
}

func TestValidateProbeUpdate_UnknownProbe(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	svc := newProbeServiceWithMock(mockOp)
	mockOp.On("Get", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything).
		Return(mongo.NewSingleResultFromDocument(nil, nil, nil), nil).Once()

	err := svc.ValidateProbeUpdate(context.Background(), model.ProbeRequest{Name: "ghost", Type: model.ProbeTypeHTTPProbe}, "project-1")

	assert.Error(t, err)
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
