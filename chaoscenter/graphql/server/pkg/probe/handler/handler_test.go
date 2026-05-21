package handler

import (
	"context"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbMocks "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestAddProbe_DuplicateName(t *testing.T) {
	mockOp := new(dbMocks.MongoOperator)
	probeOp := dbSchemaProbe.NewChaosProbeOperator(mockOp)
	svc := NewProbeService(probeOp)

	ctx := context.Background()
	projectID := "project-1"
	req := minimalHTTPProbeRequest("postman-test-probe-1")

	// IsProbeUnique → CountDocuments returns 1
	mockOp.On("CountDocuments", mock.Anything, mongodb.ChaosProbeCollection, mock.Anything, mock.Anything).
		Return(int64(1), nil).Once()

	_, err := svc.AddProbe(ctx, req, projectID)

	assert.Error(t, err)
	assert.Equal(t, "probe already exists", err.Error())
	mockOp.AssertNotCalled(t, "Create", mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}

func minimalHTTPProbeRequest(name string) model.ProbeRequest {
	criteria := "=="
	code := "200"
	return model.ProbeRequest{
		Name:               name,
		Type:               model.ProbeTypeHTTPProbe,
		InfrastructureType: model.InfrastructureTypeKubernetes,
		KubernetesHTTPProperties: &model.KubernetesHTTPProbeRequest{
			ProbeTimeout: "5",
			Interval:     "5",
			URL:          "https://example.com",
			Method: &model.MethodRequest{
				Get: &model.GETRequest{
					Criteria:     criteria,
					ResponseCode: code,
				},
			},
		},
	}
}
