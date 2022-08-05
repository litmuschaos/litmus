package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	wfHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	clusterHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster/handler"
	data_store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/handlers"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *mutationResolver) RegisterCluster(ctx context.Context, request model.RegisterClusterRequest) (*model.RegisterClusterResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.UserClusterReg],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return clusterHandler.RegisterCluster(request)
}

func (r *mutationResolver) ConfirmClusterRegistration(ctx context.Context, request model.ClusterIdentity) (*model.ConfirmClusterRegistrationResponse, error) {
	return clusterHandler.ConfirmClusterRegistration(request, *data_store.Store)
}

func (r *mutationResolver) NewClusterEvent(ctx context.Context, request model.NewClusterEventRequest) (string, error) {
	return clusterHandler.NewClusterEvent(request, *data_store.Store)
}

func (r *mutationResolver) DeleteClusters(ctx context.Context, projectID string, clusterIDs []*string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteClusters],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	return clusterHandler.DeleteClusters(ctx, projectID, clusterIDs, *data_store.Store)
}

func (r *mutationResolver) PodLog(ctx context.Context, request model.PodLog) (string, error) {
	return wfHandler.PodLog(request, *data_store.Store)
}

func (r *mutationResolver) KubeObj(ctx context.Context, request model.KubeObjectData) (string, error) {
	return wfHandler.KubeObj(request, *data_store.Store)
}

func (r *queryResolver) GetServerVersion(ctx context.Context) (*model.ServerVersionResponse, error) {
	return wfHandler.QueryServerVersion(ctx)
}

func (r *queryResolver) ListClusters(ctx context.Context, projectID string, clusterType *string) ([]*model.Cluster, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListClusters],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return clusterHandler.ListClusters(projectID, clusterType)
}

func (r *queryResolver) GetAgentDetails(ctx context.Context, clusterID string, projectID string) (*model.Cluster, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetAgentDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return clusterHandler.GetAgentDetails(ctx, clusterID, projectID)
}

func (r *queryResolver) GetManifest(ctx context.Context, projectID string, clusterID string, accessKey string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetManifest],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	response, err := handlers.GetManifestWithClusterID(clusterID, accessKey)
	if err != nil {
		return "", err
	}

	return string(response), nil
}

func (r *subscriptionResolver) GetClusterEvents(ctx context.Context, projectID string) (<-chan *model.ClusterEventResponse, error) {
	logrus.Print("NEW EVENT ", projectID)
	clusterEvent := make(chan *model.ClusterEventResponse, 1)

	data_store.Store.Mutex.Lock()
	data_store.Store.ClusterEventPublish[projectID] = append(data_store.Store.ClusterEventPublish[projectID], clusterEvent)
	data_store.Store.Mutex.Unlock()

	go func() {
		<-ctx.Done()
	}()

	return clusterEvent, nil
}

func (r *subscriptionResolver) ClusterConnect(ctx context.Context, clusterInfo model.ClusterIdentity) (<-chan *model.ClusterActionResponse, error) {
	logrus.Print("NEW CLUSTER CONNECT: ", clusterInfo.ClusterID)
	clusterAction := make(chan *model.ClusterActionResponse, 1)
	verifiedCluster, err := cluster.VerifyCluster(clusterInfo)
	if err != nil {
		logrus.Print("VALIDATION FAILED: ", clusterInfo.ClusterID)
		return clusterAction, err
	}
	data_store.Store.Mutex.Lock()
	if _, ok := data_store.Store.ConnectedCluster[clusterInfo.ClusterID]; ok {
		data_store.Store.Mutex.Unlock()
		return clusterAction, errors.New("CLUSTER ALREADY CONNECTED")
	}
	data_store.Store.ConnectedCluster[clusterInfo.ClusterID] = clusterAction
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		verifiedCluster.IsActive = false

		newVerifiedCluster := model.Cluster{}
		copier.Copy(&newVerifiedCluster, &verifiedCluster)

		clusterHandler.SendClusterEvent("cluster-status", "Cluster Offline", "Cluster Disconnect", newVerifiedCluster, *data_store.Store)

		data_store.Store.Mutex.Lock()
		delete(data_store.Store.ConnectedCluster, clusterInfo.ClusterID)
		data_store.Store.Mutex.Unlock()
		query := bson.D{{"cluster_id", clusterInfo.ClusterID}}
		update := bson.D{{"$set", bson.D{{"is_active", false}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

		err = dbOperationsCluster.UpdateCluster(query, update)
		if err != nil {
			logrus.Print("Error", err)
		}
	}()

	query := bson.D{{"cluster_id", clusterInfo.ClusterID}}
	update := bson.D{{"$set", bson.D{{"is_active", true}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}, {"version", clusterInfo.Version}}}}

	err = dbOperationsCluster.UpdateCluster(query, update)
	if err != nil {
		return clusterAction, err
	}

	newVerifiedCluster := model.Cluster{}
	copier.Copy(&newVerifiedCluster, &verifiedCluster)

	verifiedCluster.IsActive = true
	clusterHandler.SendClusterEvent("cluster-status", "Cluster Live", "Cluster is Live and Connected", newVerifiedCluster, *data_store.Store)
	return clusterAction, nil
}

func (r *subscriptionResolver) GetPodLog(ctx context.Context, request model.PodLogRequest) (<-chan *model.PodLogResponse, error) {
	logrus.Print("NEW LOG REQUEST: ", request.ClusterID, request.PodName)
	workflowLog := make(chan *model.PodLogResponse, 1)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.WorkflowLog[reqID.String()] = workflowLog
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		logrus.Print("CLOSED LOG LISTENER: ", request.ClusterID, request.PodName)
		delete(data_store.Store.WorkflowLog, reqID.String())
	}()
	go wfHandler.GetLogs(reqID.String(), request, *data_store.Store)
	return workflowLog, nil
}

func (r *subscriptionResolver) GetKubeObject(ctx context.Context, request model.KubeObjectRequest) (<-chan *model.KubeObjectResponse, error) {
	logrus.Print("NEW KUBEOBJECT REQUEST", request.ClusterID)
	kubeObjData := make(chan *model.KubeObjectResponse)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.KubeObjectData[reqID.String()] = kubeObjData
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		logrus.Println("Closed KubeObj Listener")
		delete(data_store.Store.KubeObjectData, reqID.String())
	}()
	go wfHandler.GetKubeObjData(reqID.String(), request, *data_store.Store)
	return kubeObjData, nil
}
