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
	"go.mongodb.org/mongo-driver/bson"
)

func isDeactivation(update bson.D) bool {
	for _, e := range update {
		set, ok := e.Value.(bson.D)
		if !ok {
			continue
		}
		for _, f := range set {
			if f.Key == "is_active" {
				v, isBool := f.Value.(bool)
				return isBool && !v
			}
		}
	}
	return false
}

// newInfraMock returns a mock whose deactivation call signals on the returned
// channel. That call is the last thing the disconnect goroutine does, so
// receiving from the channel guarantees the goroutine has finished.
func newInfraMock(infraID string) (*mocks.InfraService, chan struct{}) {
	disconnected := make(chan struct{}, 2)
	m := new(mocks.InfraService)
	m.On("VerifyInfra", mock.Anything).
		Return(&dbChaosInfra.ChaosInfra{InfraID: infraID}, nil)
	m.On("UpdateInfra", mock.Anything, mock.MatchedBy(isDeactivation)).
		Run(func(mock.Arguments) { disconnected <- struct{}{} }).Return(nil)
	m.On("UpdateInfra", mock.Anything, mock.Anything).Return(nil)
	m.On("SendInfraEvent", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).
		Return().Maybe()
	return m, disconnected
}

func waitDisconnected(t *testing.T, ch <-chan struct{}) {
	t.Helper()
	select {
	case <-ch:
	case <-time.After(2 * time.Second):
		t.Fatal("timed out waiting for disconnect handling")
	}
}

func connectedChannel(infraID string) <-chan *model.InfraActionResponse {
	data_store.Store.Mutex.Lock()
	defer data_store.Store.Mutex.Unlock()
	return data_store.Store.ConnectedInfra[infraID]
}

// TestInfraConnect_ReplacesStaleConnection reproduces litmuschaos/litmus#4789:
// a stale ConnectedInfra entry must not block the infra from reconnecting.
func TestInfraConnect_ReplacesStaleConnection(t *testing.T) {
	infraID := "test-infra-stale"
	mockService, disconnected := newInfraMock(infraID)
	r := &subscriptionResolver{&Resolver{chaosInfrastructureService: mockService}}

	staleChannel := make(chan *model.InfraActionResponse, 1)
	data_store.Store.Mutex.Lock()
	data_store.Store.ConnectedInfra[infraID] = staleChannel
	data_store.Store.Mutex.Unlock()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	newChannel, err := r.InfraConnect(ctx, model.InfraIdentity{InfraID: infraID})
	require.NoError(t, err, "a verified reconnect must not be rejected because of a stale entry")
	select {
	case _, ok := <-staleChannel:
		require.True(t, ok, "stale channel must not be closed")
	default:
	}

	require.Equal(t, newChannel, connectedChannel(infraID))

	cancel()
	waitDisconnected(t, disconnected)
}

// TestInfraConnect_SecondConnectSucceedsAfterFirst simulates a reconnect while
// the server still holds the previous connection for the same infra.
func TestInfraConnect_SecondConnectSucceedsAfterFirst(t *testing.T) {
	infraID := "test-infra-reconnect"
	mockService, disconnected := newInfraMock(infraID)
	r := &subscriptionResolver{&Resolver{chaosInfrastructureService: mockService}}

	ctx1, cancel1 := context.WithCancel(context.Background())
	defer cancel1()
	ctx2, cancel2 := context.WithCancel(context.Background())
	defer cancel2()

	_, err := r.InfraConnect(ctx1, model.InfraIdentity{InfraID: infraID})
	require.NoError(t, err)

	secondChannel, err := r.InfraConnect(ctx2, model.InfraIdentity{InfraID: infraID})
	require.NoError(t, err, "reconnect must succeed instead of being rejected")
	require.Equal(t, secondChannel, connectedChannel(infraID))

	cancel1()
	require.Never(t, func() bool {
		return connectedChannel(infraID) != secondChannel
	}, 50*time.Millisecond, 5*time.Millisecond,
		"old connection's cleanup must not remove the new connection")

	cancel2()
	waitDisconnected(t, disconnected)
	require.Nil(t, connectedChannel(infraID))
}
