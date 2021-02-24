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
	analytics_handler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	wf_handler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	data_store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/graphql/mutations"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/graphql/queries"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/graphql/subscriptions"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/myhub_ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/project"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/usermanagement"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *mutationResolver) UserClusterReg(ctx context.Context, clusterInput model.ClusterInput) (*model.ClusterRegResponse, error) {
	return mutations.ClusterRegister(clusterInput)
}

func (r *mutationResolver) CreateChaosWorkFlow(ctx context.Context, input model.ChaosWorkFlowInput) (*model.ChaosWorkFlowResponse, error) {
	return wf_handler.CreateChaosWorkflow(ctx, &input, data_store.Store)
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
	return wf_handler.DeleteWorkflow(ctx, workflowid, data_store.Store)
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

func (r *mutationResolver) ClusterConfirm(ctx context.Context, identity model.ClusterIdentity) (*model.ClusterConfirmResponse, error) {
	return mutations.ConfirmClusterRegistration(identity, *data_store.Store)
}

func (r *mutationResolver) NewClusterEvent(ctx context.Context, clusterEvent model.ClusterEventInput) (string, error) {
	return mutations.NewEvent(clusterEvent, *data_store.Store)
}

func (r *mutationResolver) ChaosWorkflowRun(ctx context.Context, workflowData model.WorkflowRunInput) (string, error) {
	return mutations.WorkFlowRunHandler(workflowData, *data_store.Store)
}

func (r *mutationResolver) PodLog(ctx context.Context, log model.PodLog) (string, error) {
	return mutations.LogsHandler(log, *data_store.Store)
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
	return wf_handler.UpdateWorkflow(ctx, input, data_store.Store)
}

func (r *mutationResolver) DeleteClusterReg(ctx context.Context, clusterID string) (string, error) {
	return mutations.DeleteCluster(clusterID, *data_store.Store)
}

func (r *mutationResolver) GeneraterSSHKey(ctx context.Context) (*model.SSHKey, error) {
	publicKey, privateKey, err := myhub_ops.GenerateKeys()
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
	return handler.GitOpsNotificationHandler(ctx, clusterInfo, workflowID)
}

func (r *mutationResolver) EnableGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	return handler.EnableGitOpsHandler(ctx, config)
}

func (r *mutationResolver) DisableGitOps(ctx context.Context, projectID string) (bool, error) {
	return handler.DisableGitOpsHandler(ctx, projectID)
}

func (r *mutationResolver) CreateDataSource(ctx context.Context, datasource *model.DSInput) (*model.DSResponse, error) {
	return analytics_handler.CreateDataSource(datasource)
}

func (r *mutationResolver) CreateDashBoard(ctx context.Context, dashboard *model.CreateDBInput) (string, error) {
	return analytics_handler.CreateDashboard(dashboard)
}

func (r *mutationResolver) UpdateDataSource(ctx context.Context, datasource model.DSInput) (*model.DSResponse, error) {
	return analytics_handler.UpdateDataSource(datasource)
}

func (r *mutationResolver) UpdateDashboard(ctx context.Context, dashboard *model.UpdataDBInput) (string, error) {
	return analytics_handler.UpdateDashBoard(dashboard)
}

func (r *mutationResolver) UpdatePanel(ctx context.Context, panelInput []*model.Panel) (string, error) {
	return analytics_handler.UpdatePanel(panelInput)
}

func (r *mutationResolver) DeleteDashboard(ctx context.Context, dbID *string) (bool, error) {
	return analytics_handler.DeleteDashboard(dbID)
}

func (r *mutationResolver) DeleteDataSource(ctx context.Context, input model.DeleteDSInput) (bool, error) {
	return analytics_handler.DeleteDataSource(input)
}

func (r *queryResolver) GetWorkFlowRuns(ctx context.Context, projectID string) ([]*model.WorkflowRun, error) {
	return wf_handler.QueryWorkflowRuns(projectID)
}

func (r *queryResolver) GetCluster(ctx context.Context, projectID string, clusterType *string) ([]*model.Cluster, error) {
	return queries.QueryGetClusters(projectID, clusterType)
}

func (r *queryResolver) GetUser(ctx context.Context, username string) (*model.User, error) {
	return usermanagement.GetUser(ctx, username)
}

func (r *queryResolver) GetProject(ctx context.Context, projectID string) (*model.Project, error) {
	return project.GetProject(ctx, projectID)
}

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	return usermanagement.GetUsers(ctx)
}

func (r *queryResolver) GetScheduledWorkflows(ctx context.Context, projectID string) ([]*model.ScheduledWorkflows, error) {
	return wf_handler.QueryWorkflows(projectID)
}

func (r *queryResolver) ListWorkflow(ctx context.Context, projectID string, workflowIds []*string) ([]*model.Workflow, error) {
	if len(workflowIds) == 0 {
		return wf_handler.QueryListWorkflow(projectID)
	} else {
		return wf_handler.QueryListWorkflowByIDs(workflowIds)
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
	return analytics_handler.QueryListDataSource(projectID)
}

func (r *queryResolver) GetPromQuery(ctx context.Context, query *model.PromInput) ([]*model.PromResponse, error) {
	return analytics_handler.GetPromQuery(query)
}

func (r *queryResolver) ListDashboard(ctx context.Context, projectID string) ([]*model.ListDashboardReponse, error) {
	return analytics_handler.QueryListDashboard(projectID)
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
	go queries.GetLogs(reqID.String(), podDetails, *data_store.Store)
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

		subscriptions.SendClusterEvent("cluster-status", "Cluster Offline", "Cluster Disconnect", newVerifiedCluster, *data_store.Store)

		data_store.Store.Mutex.Lock()
		delete(data_store.Store.ConnectedCluster, clusterInfo.ClusterID)
		data_store.Store.Mutex.Unlock()
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

	newVerifiedCluster := model.Cluster{}
	copier.Copy(&newVerifiedCluster, &verifiedCluster)

	verifiedCluster.IsActive = true
	subscriptions.SendClusterEvent("cluster-status", "Cluster Live", "Cluster is Live and Connected", newVerifiedCluster, *data_store.Store)
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
