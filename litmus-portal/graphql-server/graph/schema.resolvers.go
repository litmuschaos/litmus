package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"log"
	"strconv"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	analyticsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	wfHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	clusterHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster/handler"
	data_store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	gitOpsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
	myHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/project"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/usermanagement"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *mutationResolver) UserClusterReg(ctx context.Context, clusterInput model.ClusterInput) (*model.ClusterRegResponse, error) {
	return clusterHandler.ClusterRegister(clusterInput)
}

func (r *mutationResolver) CreateChaosWorkFlow(ctx context.Context, input model.ChaosWorkFlowInput) (*model.ChaosWorkFlowResponse, error) {
	return wfHandler.CreateChaosWorkflow(ctx, &input, data_store.Store)
}

func (r *mutationResolver) ReRunChaosWorkFlow(ctx context.Context, workflowID string) (string, error) {
	return wfHandler.ReRunWorkflow(workflowID)
}

func (r *mutationResolver) CreateUser(ctx context.Context, user model.CreateUserInput) (*model.User, error) {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	userUID := claims["uid"].(string)
	role := claims["role"].(string)

	return usermanagement.CreateUser(ctx, user, userUID, role)
}

func (r *mutationResolver) UpdateUser(ctx context.Context, user model.UpdateUserInput) (string, error) {
	return usermanagement.UpdateUser(ctx, user)
}

func (r *mutationResolver) DeleteChaosWorkflow(ctx context.Context, workflowid string) (bool, error) {
	return wfHandler.DeleteWorkflow(ctx, workflowid, data_store.Store)
}

func (r *mutationResolver) SendInvitation(ctx context.Context, member model.MemberInput) (*model.Member, error) {
	return project.SendInvitation(ctx, member)
}

func (r *mutationResolver) AcceptInvitation(ctx context.Context, member model.MemberInput) (string, error) {
	return project.AcceptInvitation(ctx, member)
}

func (r *mutationResolver) DeclineInvitation(ctx context.Context, member model.MemberInput) (string, error) {
	return project.DeclineInvitation(ctx, member)
}

func (r *mutationResolver) RemoveInvitation(ctx context.Context, member model.MemberInput) (string, error) {
	return project.RemoveInvitation(ctx, member)
}

func (r *mutationResolver) LeaveProject(ctx context.Context, member model.MemberInput) (string, error) {
	return project.LeaveProject(ctx, member)
}

func (r *mutationResolver) ClusterConfirm(ctx context.Context, identity model.ClusterIdentity) (*model.ClusterConfirmResponse, error) {
	return clusterHandler.ConfirmClusterRegistration(identity, *data_store.Store)
}

func (r *mutationResolver) NewClusterEvent(ctx context.Context, clusterEvent model.ClusterEventInput) (string, error) {
	return clusterHandler.NewEvent(clusterEvent, *data_store.Store)
}

func (r *mutationResolver) ChaosWorkflowRun(ctx context.Context, workflowData model.WorkflowRunInput) (string, error) {
	return wfHandler.WorkFlowRunHandler(workflowData, *data_store.Store)
}

func (r *mutationResolver) PodLog(ctx context.Context, log model.PodLog) (string, error) {
	return wfHandler.LogsHandler(log, *data_store.Store)
}

func (r *mutationResolver) AddMyHub(ctx context.Context, myhubInput model.CreateMyHub, projectID string) (*model.MyHub, error) {
	return myhub.AddMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) SaveMyHub(ctx context.Context, myhubInput model.CreateMyHub, projectID string) (*model.MyHub, error) {
	return myhub.SaveMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) SyncHub(ctx context.Context, id string) ([]*model.MyHubStatus, error) {
	return myhub.SyncHub(ctx, id)
}

func (r *mutationResolver) UpdateChaosWorkflow(ctx context.Context, input *model.ChaosWorkFlowInput) (*model.ChaosWorkFlowResponse, error) {
	return wfHandler.UpdateWorkflow(ctx, input, data_store.Store)
}

func (r *mutationResolver) DeleteClusterReg(ctx context.Context, clusterID string) (string, error) {
	return clusterHandler.DeleteCluster(clusterID, *data_store.Store)
}

func (r *mutationResolver) GeneraterSSHKey(ctx context.Context) (*model.SSHKey, error) {
	publicKey, privateKey, err := myHubOps.GenerateKeys()
	if err != nil {
		return nil, err
	}

	return &model.SSHKey{
		PrivateKey: privateKey,
		PublicKey:  publicKey,
	}, nil
}

func (r *mutationResolver) UpdateMyHub(ctx context.Context, myhubInput model.UpdateMyHub, projectID string) (*model.MyHub, error) {
	return myhub.UpdateMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) DeleteMyHub(ctx context.Context, hubID string) (bool, error) {
	return myhub.DeleteMyHub(ctx, hubID)
}

func (r *mutationResolver) GitopsNotifer(ctx context.Context, clusterInfo model.ClusterIdentity, workflowID string) (string, error) {
	return gitOpsHandler.GitOpsNotificationHandler(ctx, clusterInfo, workflowID)
}

func (r *mutationResolver) EnableGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	return gitOpsHandler.EnableGitOpsHandler(ctx, config)
}

func (r *mutationResolver) DisableGitOps(ctx context.Context, projectID string) (bool, error) {
	return gitOpsHandler.DisableGitOpsHandler(ctx, projectID)
}

func (r *mutationResolver) CreateDataSource(ctx context.Context, datasource *model.DSInput) (*model.DSResponse, error) {
	return analyticsHandler.CreateDataSource(datasource)
}

func (r *mutationResolver) CreateDashBoard(ctx context.Context, dashboard *model.CreateDBInput) (string, error) {
	return analyticsHandler.CreateDashboard(dashboard)
}

func (r *mutationResolver) UpdateDataSource(ctx context.Context, datasource model.DSInput) (*model.DSResponse, error) {
	return analyticsHandler.UpdateDataSource(datasource)
}

func (r *mutationResolver) UpdateDashboard(ctx context.Context, dashboard *model.UpdataDBInput) (string, error) {
	return analyticsHandler.UpdateDashBoard(dashboard)
}

func (r *mutationResolver) UpdatePanel(ctx context.Context, panelInput []*model.Panel) (string, error) {
	return analyticsHandler.UpdatePanel(panelInput)
}

func (r *mutationResolver) DeleteDashboard(ctx context.Context, dbID *string) (bool, error) {
	return analyticsHandler.DeleteDashboard(dbID)
}

func (r *mutationResolver) DeleteDataSource(ctx context.Context, input model.DeleteDSInput) (bool, error) {
	return analyticsHandler.DeleteDataSource(input)
}

func (r *queryResolver) GetWorkFlowRuns(ctx context.Context, projectID string) ([]*model.WorkflowRun, error) {
	return wfHandler.QueryWorkflowRuns(projectID)
}

func (r *queryResolver) GetCluster(ctx context.Context, projectID string, clusterType *string) ([]*model.Cluster, error) {
	return clusterHandler.QueryGetClusters(projectID, clusterType)
}

func (r *queryResolver) GetUser(ctx context.Context, username string) (*model.User, error) {
	return usermanagement.GetUser(ctx, username)
}

func (r *queryResolver) GetProject(ctx context.Context, projectID string) (*model.Project, error) {
	return project.GetProject(ctx, projectID)
}

func (r *queryResolver) ListProjects(ctx context.Context) ([]*model.Project, error) {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	userUID := claims["uid"].(string)
	return project.GetProjectsByUserID(ctx, userUID)
}

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	return usermanagement.GetUsers(ctx)
}

func (r *queryResolver) GetScheduledWorkflows(ctx context.Context, projectID string) ([]*model.ScheduledWorkflows, error) {
	return wfHandler.QueryWorkflows(projectID)
}

func (r *queryResolver) ListWorkflow(ctx context.Context, projectID string, workflowIds []*string) ([]*model.Workflow, error) {
	if len(workflowIds) == 0 {
		return wfHandler.QueryListWorkflow(projectID)
	} else {
		return wfHandler.QueryListWorkflowByIDs(workflowIds)
	}
}

func (r *queryResolver) GetCharts(ctx context.Context, hubName string, projectID string) ([]*model.Chart, error) {
	return myhub.GetCharts(ctx, hubName, projectID)
}

func (r *queryResolver) GetHubExperiment(ctx context.Context, experimentInput model.ExperimentInput) (*model.Chart, error) {
	return myhub.GetExperiment(ctx, experimentInput)
}

func (r *queryResolver) GetHubStatus(ctx context.Context, projectID string) ([]*model.MyHubStatus, error) {
	return myhub.HubStatus(ctx, projectID)
}

func (r *queryResolver) GetYAMLData(ctx context.Context, experimentInput model.ExperimentInput) (string, error) {
	return myhub.GetYAMLData(ctx, experimentInput)
}

func (r *queryResolver) ListDataSource(ctx context.Context, projectID string) ([]*model.DSResponse, error) {
	return analyticsHandler.QueryListDataSource(projectID)
}

func (r *queryResolver) GetPromQuery(ctx context.Context, query *model.PromInput) ([]*model.PromResponse, error) {
	return analyticsHandler.GetPromQuery(query)
}

func (r *queryResolver) ListDashboard(ctx context.Context, projectID string) ([]*model.ListDashboardReponse, error) {
	return analyticsHandler.QueryListDashboard(projectID)
}

func (r *queryResolver) GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error) {
	return gitOpsHandler.GetGitOpsDetailsHandler(ctx, projectID)
}

func (r *subscriptionResolver) ClusterEventListener(ctx context.Context, projectID string) (<-chan *model.ClusterEvent, error) {
	log.Print("NEW EVENT ", projectID)
	clusterEvent := make(chan *model.ClusterEvent, 1)

	data_store.Store.Mutex.Lock()
	data_store.Store.ClusterEventPublish[projectID] = append(data_store.Store.ClusterEventPublish[projectID], clusterEvent)
	data_store.Store.Mutex.Unlock()

	go func() {
		<-ctx.Done()
	}()

	return clusterEvent, nil
}

func (r *subscriptionResolver) WorkflowEventListener(ctx context.Context, projectID string) (<-chan *model.WorkflowRun, error) {
	log.Print("NEW WORKFLOW EVENT LISTENER", projectID)
	workflowEvent := make(chan *model.WorkflowRun, 1)
	data_store.Store.Mutex.Lock()
	data_store.Store.WorkflowEventPublish[projectID] = append(data_store.Store.WorkflowEventPublish[projectID], workflowEvent)
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Print("CLOSED WORKFLOW LISTENER", projectID)
	}()
	return workflowEvent, nil
}

func (r *subscriptionResolver) GetPodLog(ctx context.Context, podDetails model.PodLogRequest) (<-chan *model.PodLogResponse, error) {
	log.Print("NEW LOG REQUEST", podDetails.ClusterID, podDetails.PodName)
	workflowLog := make(chan *model.PodLogResponse, 1)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.WorkflowLog[reqID.String()] = workflowLog
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Print("CLOSED LOG LISTENER", podDetails.ClusterID, podDetails.PodName)
		delete(data_store.Store.WorkflowLog, reqID.String())
	}()
	go wfHandler.GetLogs(reqID.String(), podDetails, *data_store.Store)
	return workflowLog, nil
}

func (r *subscriptionResolver) ClusterConnect(ctx context.Context, clusterInfo model.ClusterIdentity) (<-chan *model.ClusterAction, error) {
	log.Print("NEW CLUSTER CONNECT ", clusterInfo.ClusterID)
	clusterAction := make(chan *model.ClusterAction, 1)
	verifiedCluster, err := cluster.VerifyCluster(clusterInfo)
	if err != nil {
		log.Print("VALIDATION FAILED : ", clusterInfo.ClusterID)
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
			log.Print("Error", err)
		}
	}()

	query := bson.D{{"cluster_id", clusterInfo.ClusterID}}
	update := bson.D{{"$set", bson.D{{"is_active", true}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

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

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Subscription returns generated.SubscriptionResolver implementation.
func (r *Resolver) Subscription() generated.SubscriptionResolver { return &subscriptionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
