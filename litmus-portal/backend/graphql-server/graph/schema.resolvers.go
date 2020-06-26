package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"math/rand"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
)

var clusterPublish map[string]chan *model.ClusterResponse

func (r *mutationResolver) CreateCluster(ctx context.Context, input model.ClusterInput) (*model.ClusterResponse, error) {
	newCluster := &model.ClusterResponse{
		Data: input.Data,
		ID:   input.ID,
	}

	for _, observer := range clusterPublish {
		observer <- newCluster
	}
	return newCluster, nil
}

func (r *subscriptionResolver) ClusterSubscription(ctx context.Context) (<-chan *model.ClusterResponse, error) {
	id := rand.Int()

	clusterEvent := make(chan *model.ClusterResponse, 1)

	go func() {
		<-ctx.Done()
	}()

	clusterPublish[string(id)] = clusterEvent
	return clusterEvent, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type mutationResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
