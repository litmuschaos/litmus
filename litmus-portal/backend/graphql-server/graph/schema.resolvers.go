package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/cluster"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/graphql/mutations"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/graphql/queries"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/graphql/subscriptions"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *mutationResolver) UserClusterReg(ctx context.Context, clusterInput model.ClusterInput) (string, error) {
	return mutations.ClusterRegister(clusterInput)
}

func (r *mutationResolver) ClusterConfirm(ctx context.Context, identity model.ClusterIdentity) (*model.ClusterConfirmResponse, error) {
	return mutations.ConfirmClusterRegistration(identity, *store)
}

func (r *mutationResolver) NewClusterEvent(ctx context.Context, clusterEvent model.ClusterEventInput) (string, error) {
	return mutations.NewEvent(clusterEvent, *store)
}

func (r *mutationResolver) CreateChaosWorkFlow(ctx context.Context, input model.ChaosWorkFlowInput) (*model.ChaosWorkFlowResponse, error) {
	return mutations.CreateChaosWorkflow(&input, *store)
}

func (r *mutationResolver) ChaosWorkflowRun(ctx context.Context, workflowData model.WorkflowRunInput) (string, error) {
	return mutations.WorkFlowRunHandler(workflowData, *store)
}

func (r *mutationResolver) PodLog(ctx context.Context, log model.PodLog) (string, error) {
	return mutations.LogsHandler(log, *store)
}

func (r *queryResolver) GetWorkFlowRuns(ctx context.Context, projectID string) ([]*model.WorkflowRun, error) {
	return queries.QueryWorkflowRuns(projectID)
}

func (r *subscriptionResolver) ClusterEventListener(ctx context.Context, projectID string) (<-chan *model.ClusterEvent, error) {
	log.Print("NEW EVENT ", projectID)
	clusterEvent := make(chan *model.ClusterEvent, 1)

	store.Mutex.Lock()
	store.ClusterEventPublish[projectID] = append(store.ClusterEventPublish[projectID], clusterEvent)
	store.Mutex.Unlock()

	go func() {
		<-ctx.Done()
	}()

	return clusterEvent, nil
}

func (r *subscriptionResolver) ClusterConnect(ctx context.Context, clusterInfo model.ClusterIdentity) (<-chan *model.ClusterAction, error) {
	clusterAction := make(chan *model.ClusterAction, 1)
	verifiedCluster, err := cluster.VerifyCluster(clusterInfo)
	if err != nil {
		return clusterAction, err
	}

	store.Mutex.Lock()
	if _, ok := store.ConnectedCluster[clusterInfo.ClusterID]; ok {
		store.Mutex.Unlock()
		return clusterAction, errors.New("CLUSTER ALREADY CONNECTED")
	}
	store.ConnectedCluster[clusterInfo.ClusterID] = clusterAction
	store.Mutex.Unlock()

	go func() {
		<-ctx.Done()
		verifiedCluster.IsActive = false

		subscriptions.SendClusterEvent("cluster-status", "Cluster Offline", "Cluster Disconnect", model.Cluster(*verifiedCluster), *store)
		store.Mutex.Lock()
		delete(store.ConnectedCluster, clusterInfo.ClusterID)
		store.Mutex.Unlock()
		query := bson.D{{"cluster_id", clusterInfo.ClusterID}}
		update := bson.D{{"$set", bson.D{{"is_active", false}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

		err = database.UpdateCluster(query, update)
		if err != nil {
			log.Print("Error", err)
		}
	}()

	query := bson.D{{"cluster_id", clusterInfo.ClusterID}}
	update := bson.D{{"$set", bson.D{{"is_active", true}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err = database.UpdateCluster(query, update)
	if err != nil {
		return clusterAction, err
	}

	verifiedCluster.IsActive = true
	subscriptions.SendClusterEvent("cluster-status", "Cluster Live", "Cluster is Live and Connected", model.Cluster(*verifiedCluster), *store)

	return clusterAction, nil
}

func (r *subscriptionResolver) WorkflowEventListener(ctx context.Context, projectID string) (<-chan *model.WorkflowRun, error) {
	log.Print("NEW WORKFLOW EVENT LISTENER", projectID)
	workflowEvent := make(chan *model.WorkflowRun, 1)
	store.Mutex.Lock()
	store.WorkflowEventPublish[projectID] = append(store.WorkflowEventPublish[projectID], workflowEvent)
	store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Print("CLOSED WORKFLOW LISTENER", projectID)
	}()
	return workflowEvent, nil
}

func (r *subscriptionResolver) GetPodLog(ctx context.Context, podDetails model.PodLogRequest) (<-chan *model.PodLogResponse, error) {
	log.Print("NEW LOG REQUEST", podDetails.ClusterID, podDetails.PodName)
	workflowLog := make(chan *model.PodLogResponse, 1)
	cid := uuid.New()
	store.Mutex.Lock()
	store.WorkflowLog[cid.String()] = workflowLog
	store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Print("CLOSED LOG LISTENER", podDetails.ClusterID, podDetails.PodName)
		delete(store.WorkflowLog, cid.String())
	}()
	go queries.GetLogs(cid.String(), podDetails, *store)
	return workflowLog, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
