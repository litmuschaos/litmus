package cluster_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	dataStore "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/stretchr/testify/assert"
)

func TestSendRequestToSubscriber(t *testing.T) {
	// given
	state := dataStore.NewStore()
	workflow := cluster.SubscriberRequests{
		ProjectID: uuid.NewString(),
		ClusterID: uuid.NewString(),
	}
	t.Run("success", func(t *testing.T) {
		// given
		action := make(chan *model.ClusterActionResponse, 1)
		t.Cleanup(func() { delete(state.ConnectedCluster, workflow.ClusterID) })
		state.ConnectedCluster[workflow.ClusterID] = action
		// when
		cluster.SendRequestToSubscriber(workflow, *state)
		// then
		select {
		case result := <-action:
			assert.Equal(t, workflow.ProjectID, result.ProjectID)
		case <-time.After(5 * time.Second):
			t.Errorf("timeout")
		}
	})
}
