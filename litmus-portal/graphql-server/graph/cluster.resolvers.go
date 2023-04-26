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
	data_store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *mutationResolver) RegisterCluster(ctx context.Context, request model.RegisterClusterRequest) (*model.RegisterClusterResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.UserClusterReg],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.clusterService.RegisterCluster(request)
}

func (r *mutationResolver) ConfirmClusterRegistration(ctx context.Context, request model.ClusterIdentity) (*model.ConfirmClusterRegistrationResponse, error) {
	return r.clusterService.ConfirmClusterRegistration(request, *data_store.Store)
}

func (r *mutationResolver) NewClusterEvent(ctx context.Context, request model.NewClusterEventRequest) (string, error) {
	return r.clusterService.NewClusterEvent(request, *data_store.Store)
}

func (r *mutationResolver) DeleteClusters(ctx context.Context, projectID string, clusterIDs []*string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteClusters],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	return r.clusterService.DeleteClusters(ctx, projectID, clusterIDs, *data_store.Store)
}

func (r *mutationResolver) PodLog(ctx context.Context, request model.PodLog) (string, error) {
	return r.chaosWorkflowHandler.PodLog(request, *data_store.Store)
}

func (r *mutationResolver) KubeObj(ctx context.Context, request model.KubeObjectData) (string, error) {
	return r.chaosWorkflowHandler.KubeObj(request, *data_store.Store)
}

func (r *queryResolver) GetServerVersion(ctx context.Context) (*model.ServerVersionResponse, error) {
	return r.chaosWorkflowHandler.QueryServerVersion(ctx)
}

func (r *queryResolver) ListClusters(ctx context.Context, projectID string, clusterType *string) ([]*model.Cluster, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListClusters],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.clusterService.ListClusters(projectID, clusterType)
}

func (r *queryResolver) GetAgentDetails(ctx context.Context, clusterID string, projectID string) (*model.Cluster, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetAgentDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return r.clusterService.GetAgentDetails(ctx, clusterID, projectID)
}

func (r *queryResolver) GetManifest(ctx context.Context, projectID string, clusterID string, accessKey string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetManifest],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	response, err := r.clusterService.GetManifestWithClusterID(clusterID, accessKey)
	if err != nil {
		return "", err
	}

	return string(response), nil
}

func (r *subscriptionResolver) GetClusterEvents(ctx context.Context, projectID string) (<-chan *model.ClusterEventResponse, error) {
	log.Info("new cluster event ", projectID)
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
	log.Info("new cluster connect: ", clusterInfo.ClusterID)
	clusterAction := make(chan *model.ClusterActionResponse, 1)
	verifiedCluster, err := r.clusterService.VerifyCluster(clusterInfo)
	if err != nil {
		log.Error("validation failed: ", clusterInfo.ClusterID)
		return clusterAction, err
	}
	data_store.Store.Mutex.Lock()
	if _, ok := data_store.Store.ConnectedCluster[clusterInfo.ClusterID]; ok {
		data_store.Store.Mutex.Unlock()
		return clusterAction, errors.New("cluster already connected")
	}
	data_store.Store.ConnectedCluster[clusterInfo.ClusterID] = clusterAction
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		verifiedCluster.IsActive = false

		newVerifiedCluster := model.Cluster{}
		copier.Copy(&newVerifiedCluster, &verifiedCluster)

		r.clusterService.SendClusterEvent("cluster-status", "Cluster Offline", "Cluster Disconnect", newVerifiedCluster, *data_store.Store)

		data_store.Store.Mutex.Lock()
		delete(data_store.Store.ConnectedCluster, clusterInfo.ClusterID)
		data_store.Store.Mutex.Unlock()

		query := bson.D{{"cluster_id", clusterInfo.ClusterID}}
		update := bson.D{{"$set", bson.D{{"is_active", false}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

		err = r.clusterService.UpdateCluster(query, update)
		if err != nil {
			log.Error(err)
		}
	}()

	query := bson.D{{"cluster_id", clusterInfo.ClusterID}}
	update := bson.D{{"$set", bson.D{{"is_active", true}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}, {"version", clusterInfo.Version}}}}

	err = r.clusterService.UpdateCluster(query, update)
	if err != nil {
		return clusterAction, err
	}

	newVerifiedCluster := model.Cluster{}
	copier.Copy(&newVerifiedCluster, &verifiedCluster)

	verifiedCluster.IsActive = true
	r.clusterService.SendClusterEvent("cluster-status", "Cluster Live", "Cluster is Live and Connected", newVerifiedCluster, *data_store.Store)
	return clusterAction, nil
}

func (r *subscriptionResolver) GetPodLog(ctx context.Context, request model.PodLogRequest) (<-chan *model.PodLogResponse, error) {
	log.Info("new log request: ", request.ClusterID, request.PodName)
	workflowLog := make(chan *model.PodLogResponse, 1)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.WorkflowLog[reqID.String()] = workflowLog
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Info("closed log listener: ", request.ClusterID, request.PodName)
		delete(data_store.Store.WorkflowLog, reqID.String())
	}()
	go r.chaosWorkflowHandler.GetLogs(reqID.String(), request, *data_store.Store)
	return workflowLog, nil
}

func (r *subscriptionResolver) GetKubeObject(ctx context.Context, request model.KubeObjectRequest) (<-chan *model.KubeObjectResponse, error) {
	log.Info("new KubeObj request", request.ClusterID)
	kubeObjData := make(chan *model.KubeObjectResponse)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.KubeObjectData[reqID.String()] = kubeObjData
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Info("closed KubeObj Listener")
		delete(data_store.Store.KubeObjectData, reqID.String())
	}()
	go r.chaosWorkflowHandler.GetKubeObjData(reqID.String(), request, *data_store.Store)
	return kubeObjData, nil
}
