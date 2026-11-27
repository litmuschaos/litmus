package handler

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/ghodss/yaml"
	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
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

// annotatedEngineTemplates is a workflow templates section holding a ChaosEngine which references
// its probe with the mode listed first and also carries an annotation that isn't a probe reference.
const annotatedEngineTemplates = `{"templates":[{"name":"pod-delete","inputs":{"artifacts":[{"name":"pod-delete","raw":{"data":` +
	`"apiVersion: litmuschaos.io/v1alpha1\nkind: ChaosEngine\nmetadata:\n  generateName: pod-delete\n  annotations:\n` +
	`    team.example.com/owner: sre\n    probeRef: '[{\"mode\":\"SOT\",\"name\":\"http-probe\"}]'\n` +
	`spec:\n  experiments:\n  - name: pod-delete\n"}}]}}]}`

func mockHTTPProbeLookup(t *testing.T, mockOp *dbMocks.MongoOperator) {
	t.Helper()

	result := mongo.NewSingleResultFromDocument(dbSchemaProbe.Probe{
		ResourceDetails:    mongodb.ResourceDetails{Name: "http-probe"},
		Type:               dbSchemaProbe.ProbeType(model.ProbeTypeHTTPProbe),
		InfrastructureType: model.InfrastructureTypeKubernetes,
		KubernetesHTTPProperties: &dbSchemaProbe.KubernetesHTTPProbe{
			URL:          "http://app.example.com",
			ProbeTimeout: "1s",
			Interval:     "1s",
		},
	}, nil, nil)
	mockOp.On("Get", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything).Return(result, nil).Once()
}

func assertEngineKeepsAnnotationAndGainsProbe(t *testing.T, engineYAML string) {
	t.Helper()

	var engine v1alpha1.ChaosEngine
	assert.NoError(t, yaml.Unmarshal([]byte(engineYAML), &engine))
	assert.Equal(t, "sre", engine.Annotations["team.example.com/owner"])
	if assert.Len(t, engine.Spec.Experiments[0].Spec.Probe, 1) {
		assert.Equal(t, "http-probe", engine.Spec.Experiments[0].Spec.Probe[0].Name)
		assert.Equal(t, "SOT", engine.Spec.Experiments[0].Spec.Probe[0].Mode)
	}
}

func TestGenerateExperimentManifestWithProbes_IgnoresOtherAnnotations(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	mockHTTPProbeLookup(t, mockOp)

	manifest, err := newProbeServiceWithMock(mockOp).GenerateExperimentManifestWithProbes(
		fmt.Sprintf(`{"kind":"Workflow","spec":%s}`, annotatedEngineTemplates), "project-1")

	assert.NoError(t, err)
	assertEngineKeepsAnnotationAndGainsProbe(t, manifest.Spec.Templates[0].Inputs.Artifacts[0].Raw.Data)
	mockOp.AssertExpectations(t)
}

func TestGenerateCronExperimentManifestWithProbes_IgnoresOtherAnnotations(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	mockHTTPProbeLookup(t, mockOp)

	manifest, err := newProbeServiceWithMock(mockOp).GenerateCronExperimentManifestWithProbes(
		fmt.Sprintf(`{"kind":"CronWorkflow","spec":{"schedule":"* * * * *","workflowSpec":%s}}`, annotatedEngineTemplates), "project-1")

	assert.NoError(t, err)
	assertEngineKeepsAnnotationAndGainsProbe(t, manifest.Spec.WorkflowSpec.Templates[0].Inputs.Artifacts[0].Raw.Data)
	mockOp.AssertExpectations(t)
}
