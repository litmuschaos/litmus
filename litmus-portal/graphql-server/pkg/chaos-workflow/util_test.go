package chaos_workflow_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	chaosWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	dataStore "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/stretchr/testify/assert"
)

// TestSendWorkflowToSubscriber
func TestSendWorkflowToSubscriber(t *testing.T) {
	// given
	state := dataStore.NewStore()
	username := "username"
	requestType := "type"
	testcases := []struct {
		workflow *model.ChaosWorkFlowRequest
	}{
		{
			workflow: &model.ChaosWorkFlowRequest{
				ProjectID:        uuid.NewString(),
				ClusterID:        uuid.NewString(),
				WorkflowManifest: uuid.NewString(),
			},
		},
		{
			workflow: &model.ChaosWorkFlowRequest{
				ProjectID:        uuid.NewString(),
				ClusterID:        uuid.NewString(),
				WorkflowManifest: uuid.NewString(),
			},
		},
		{
			workflow: &model.ChaosWorkFlowRequest{
				ProjectID:        uuid.NewString(),
				ClusterID:        uuid.NewString(),
				WorkflowManifest: uuid.NewString(),
			},
		},
	}
	for _, tc := range testcases {
		// given
		action := make(chan *model.ClusterActionResponse, 1)
		t.Cleanup(func() { delete(state.ConnectedCluster, tc.workflow.ClusterID) })
		state.ConnectedCluster[tc.workflow.ClusterID] = action
		// when
		chaosWorkflow.SendWorkflowToSubscriber(tc.workflow, &username, nil, requestType, state)
		// then
		select {
		case result := <-action:
			assert.Equal(t, tc.workflow.ProjectID, result.ProjectID)
			assert.Equal(t, requestType, result.Action.RequestType)
			assert.Equal(t, username, *result.Action.Username)
		case <-time.After(5 * time.Second):
			t.Errorf("timeout")
		}
	}
}
