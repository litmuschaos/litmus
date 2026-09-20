package graph

import (
	"context"
	"testing"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure/model/mocks"
	data_store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// TestInfraConnect_ReplacesStaleConnection reproduces litmuschaos/litmus#4789:
// a stale ConnectedInfra map entry (left behind by an abruptly-killed subscriber)
// must not permanently block the infra from reconnecting.
func TestInfraConnect_ReplacesStaleConnection(t *testing.T) {
	infraID := "test-infra-stale"

	mockService := new(mocks.InfraService)
	mockService.On("VerifyInfra", mock.Anything).
		Return(&dbChaosInfra.ChaosInfra{InfraID: infraID}, nil)
	mockService.On("UpdateInfra", mock.Anything, mock.Anything).
		Return(nil)
	mockService.On("SendInfraEvent", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
		Return().Maybe()

	r := &subscriptionResolver{&Resolver{chaosInfrastructureService: mockService}}
	staleChannel := make(chan *model.InfraActionResponse, 1)
	data_store.Store.Mutex.Lock()
	data_store.Store.ConnectedInfra[infraID] = staleChannel
	data_store.Store.Mutex.Unlock()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	newChannel, err := r.InfraConnect(ctx, model.InfraIdentity{InfraID: infraID})

	require.NoError(t, err, "a verified reconnect must not be rejected because of a stale entry")
	_, ok := <-staleChannel
	require.False(t, ok, "stale channel should have been closed")
	data_store.Store.Mutex.Lock()
	current := data_store.Store.ConnectedInfra[infraID]
	data_store.Store.Mutex.Unlock()
	require.Equal(t, newChannel, (<-chan *model.InfraActionResponse)(current))

	cancel()
	time.Sleep(50 * time.Millisecond)
}

func TestInfraConnect_SecondConnectSucceedsAfterFirst(t *testing.T) {
	infraID := "test-infra-reconnect"

	mockService := new(mocks.InfraService)
	mockService.On("VerifyInfra", mock.Anything).
		Return(&dbChaosInfra.ChaosInfra{InfraID: infraID}, nil)
	mockService.On("UpdateInfra", mock.Anything, mock.Anything).
		Return(nil)
	mockService.On("SendInfraEvent", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
		Return().Maybe()

	r := &subscriptionResolver{&Resolver{chaosInfrastructureService: mockService}}

	ctx1, cancel1 := context.WithCancel(context.Background())
	defer cancel1()
	ctx2, cancel2 := context.WithCancel(context.Background())
	defer cancel2()

	_, err := r.InfraConnect(ctx1, model.InfraIdentity{InfraID: infraID})
	require.NoError(t, err)

	secondChannel, err := r.InfraConnect(ctx2, model.InfraIdentity{InfraID: infraID})
	require.NoError(t, err, "reconnect must succeed instead of returning CLUSTER ALREADY CONNECTED")

	data_store.Store.Mutex.Lock()
	current := data_store.Store.ConnectedInfra[infraID]
	data_store.Store.Mutex.Unlock()
	require.Equal(t, secondChannel, (<-chan *model.InfraActionResponse)(current))

	cancel1()
	cancel2()
	time.Sleep(50 * time.Millisecond)
}
