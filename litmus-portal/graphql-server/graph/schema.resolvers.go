package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/generated"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	analyticsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/handler"
	analyticsOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	wfHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/handler"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	clusterHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster/handler"
	data_store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	gitOpsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
	imageRegistryOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/image_registry/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
	myHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/project"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/usage"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/usermanagement"
	"go.mongodb.org/mongo-driver/bson"
)

func (r *mutationResolver) UserClusterReg(ctx context.Context, clusterInput model.ClusterInput) (*model.ClusterRegResponse, error) {
	return clusterHandler.ClusterRegister(clusterInput)
}

func (r *mutationResolver) CreateUser(ctx context.Context, user model.CreateUserInput) (*model.User, error) {
	return usermanagement.CreateUser(ctx, user)
}

func (r *mutationResolver) UpdateUserState(ctx context.Context, uid string, isDeactivate bool) (string, error) {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	userRole := claims["role"].(string)
	if userRole != "admin" {
		return "Unauthorized", errors.New("Unauthorized ")
	}

	return usermanagement.UpdateUserState(ctx, uid, isDeactivate)
}

func (r *mutationResolver) CreateProject(ctx context.Context, projectName string) (*model.Project, error) {
	//fetching all the user's details from jwt token
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	userUID := claims["uid"].(string)

	return project.CreateProjectWithUser(ctx, projectName, userUID)
}

func (r *mutationResolver) UpdateUser(ctx context.Context, user model.UpdateUserInput) (string, error) {
	return usermanagement.UpdateUser(ctx, user)
}

func (r *mutationResolver) CreateChaosWorkFlow(ctx context.Context, input model.ChaosWorkFlowInput) (*model.ChaosWorkFlowResponse, error) {
	err := authorization.ValidateRole(ctx, input.ProjectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return wfHandler.CreateChaosWorkflow(ctx, &input, data_store.Store)
}

func (r *mutationResolver) ReRunChaosWorkFlow(ctx context.Context, workflowID string) (string, error) {
	return wfHandler.ReRunWorkflow(workflowID)
}

func (r *mutationResolver) DeleteChaosWorkflow(ctx context.Context, workflowid *string, workflowRunID *string) (bool, error) {
	return wfHandler.DeleteWorkflow(ctx, workflowid, workflowRunID, data_store.Store)
}

func (r *mutationResolver) SyncWorkflow(ctx context.Context, workflowid string, workflowRunID string) (bool, error) {
	return wfHandler.SyncWorkflowRun(ctx, workflowid, workflowRunID, data_store.Store)
}

func (r *mutationResolver) SendInvitation(ctx context.Context, member model.MemberInput) (*model.Member, error) {
	err := authorization.ValidateRole(ctx, member.ProjectID, []model.MemberRole{model.MemberRoleOwner}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}

	err = authorization.ValidateUserStatus(ctx, member.UserID)
	if err != nil {
		return nil, err
	}

	return project.SendInvitation(ctx, member)
}

func (r *mutationResolver) AcceptInvitation(ctx context.Context, member model.MemberInput) (string, error) {
	err := authorization.ValidateRole(ctx, member.ProjectID, []model.MemberRole{model.MemberRoleViewer, model.MemberRoleEditor}, usermanagement.PendingInvitation)
	if err != nil {
		return "Unsuccessful", err
	}

	err = authorization.ValidateUserStatus(ctx, member.UserID)
	if err != nil {
		return "Unsuccessful", err
	}

	return project.AcceptInvitation(ctx, member)
}

func (r *mutationResolver) DeclineInvitation(ctx context.Context, member model.MemberInput) (string, error) {
	err := authorization.ValidateRole(ctx, member.ProjectID, []model.MemberRole{model.MemberRoleViewer, model.MemberRoleEditor}, usermanagement.PendingInvitation)
	if err != nil {
		return "Unsuccessful", err
	}

	err = authorization.ValidateUserStatus(ctx, member.UserID)
	if err != nil {
		return "Unsuccessful", err
	}

	return project.DeclineInvitation(ctx, member)
}

func (r *mutationResolver) RemoveInvitation(ctx context.Context, member model.MemberInput) (string, error) {
	err := authorization.ValidateRole(ctx, member.ProjectID, []model.MemberRole{model.MemberRoleOwner}, usermanagement.AcceptedInvitation)
	if err != nil {
		return "Unsuccessful", err
	}

	return project.RemoveInvitation(ctx, member)
}

func (r *mutationResolver) LeaveProject(ctx context.Context, member model.MemberInput) (string, error) {
	err := authorization.ValidateRole(ctx, member.ProjectID, []model.MemberRole{model.MemberRoleViewer, model.MemberRoleEditor}, usermanagement.AcceptedInvitation)
	if err != nil {
		return "Unsuccessful", err
	}

	err = authorization.ValidateUserStatus(ctx, member.UserID)
	if err != nil {
		return "Unsuccessful", err
	}

	return project.LeaveProject(ctx, member)
}

func (r *mutationResolver) UpdateProjectName(ctx context.Context, projectID string, projectName string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner}, usermanagement.AcceptedInvitation)
	if err != nil {
		return "Unsuccessful", err
	}

	//fetching all the user's details from jwt token
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	userUID := claims["uid"].(string)

	return project.UpdateProjectName(ctx, projectID, projectName, userUID)
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

func (r *mutationResolver) KubeObj(ctx context.Context, kubeData model.KubeObjectData) (string, error) {
	return wfHandler.KubeObjHandler(kubeData, *data_store.Store)
}

func (r *mutationResolver) AddMyHub(ctx context.Context, myhubInput model.CreateMyHub, projectID string) (*model.MyHub, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}

	return myhub.AddMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) SaveMyHub(ctx context.Context, myhubInput model.CreateMyHub, projectID string) (*model.MyHub, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}

	return myhub.SaveMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) SyncHub(ctx context.Context, id string) ([]*model.MyHubStatus, error) {
	return myhub.SyncHub(ctx, id)
}

func (r *mutationResolver) UpdateChaosWorkflow(ctx context.Context, input *model.ChaosWorkFlowInput) (*model.ChaosWorkFlowResponse, error) {
	err := authorization.ValidateRole(ctx, input.ProjectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
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
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return myhub.UpdateMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) DeleteMyHub(ctx context.Context, hubID string) (bool, error) {
	return myhub.DeleteMyHub(ctx, hubID)
}

func (r *mutationResolver) GitopsNotifer(ctx context.Context, clusterInfo model.ClusterIdentity, workflowID string) (string, error) {
	return gitOpsHandler.GitOpsNotificationHandler(ctx, clusterInfo, workflowID)
}

func (r *mutationResolver) EnableGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, config.ProjectID, []model.MemberRole{model.MemberRoleOwner}, usermanagement.AcceptedInvitation)
	if err != nil {
		return false, err
	}
	return gitOpsHandler.EnableGitOpsHandler(ctx, config)
}

func (r *mutationResolver) DisableGitOps(ctx context.Context, projectID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner}, usermanagement.AcceptedInvitation)
	if err != nil {
		return false, err
	}
	return gitOpsHandler.DisableGitOpsHandler(ctx, projectID)
}

func (r *mutationResolver) UpdateGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, config.ProjectID, []model.MemberRole{model.MemberRoleOwner}, usermanagement.AcceptedInvitation)
	if err != nil {
		return false, err
	}
	return gitOpsHandler.UpdateGitOpsDetailsHandler(ctx, config)
}

func (r *mutationResolver) CreateDataSource(ctx context.Context, datasource *model.DSInput) (*model.DSResponse, error) {
	return analyticsHandler.CreateDataSource(datasource)
}

func (r *mutationResolver) CreateDashBoard(ctx context.Context, dashboard *model.CreateDBInput) (*model.ListDashboardResponse, error) {
	return analyticsHandler.CreateDashboard(dashboard)
}

func (r *mutationResolver) UpdateDataSource(ctx context.Context, datasource model.DSInput) (*model.DSResponse, error) {
	return analyticsHandler.UpdateDataSource(datasource)
}

func (r *mutationResolver) UpdateDashboard(ctx context.Context, dashboard model.UpdateDBInput, chaosQueryUpdate bool) (string, error) {
	return analyticsHandler.UpdateDashBoard(dashboard, chaosQueryUpdate)
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

func (r *mutationResolver) CreateManifestTemplate(ctx context.Context, templateInput *model.TemplateInput) (*model.ManifestTemplate, error) {
	return wfHandler.SaveWorkflowTemplate(ctx, templateInput)
}

func (r *mutationResolver) DeleteManifestTemplate(ctx context.Context, templateID string) (bool, error) {
	return wfHandler.DeleteWorkflowTemplate(ctx, templateID)
}

func (r *mutationResolver) CreateImageRegistry(ctx context.Context, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error) {
	ciResponse, err := imageRegistryOps.CreateImageRegistry(ctx, projectID, imageRegistryInfo)
	if err != nil {
		log.Print(err)
	}
	return ciResponse, err
}

func (r *mutationResolver) UpdateImageRegistry(ctx context.Context, imageRegistryID string, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error) {
	uiRegistry, err := imageRegistryOps.UpdateImageRegistry(ctx, imageRegistryID, projectID, imageRegistryInfo)
	if err != nil {
		log.Print(err)
	}

	return uiRegistry, err
}

func (r *mutationResolver) DeleteImageRegistry(ctx context.Context, imageRegistryID string, projectID string) (string, error) {
	diRegistry, err := imageRegistryOps.DeleteImageRegistry(ctx, imageRegistryID, projectID)
	if err != nil {
		log.Print(err)
	}

	return diRegistry, err
}

func (r *queryResolver) GetWorkflowRuns(ctx context.Context, workflowRunsInput model.GetWorkflowRunsInput) (*model.GetWorkflowsOutput, error) {
	err := authorization.ValidateRole(ctx, workflowRunsInput.ProjectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return wfHandler.QueryWorkflowRuns(workflowRunsInput)
}

func (r *queryResolver) GetCluster(ctx context.Context, projectID string, clusterType *string) ([]*model.Cluster, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return clusterHandler.QueryGetClusters(projectID, clusterType)
}

func (r *queryResolver) GetUser(ctx context.Context, username string) (*model.User, error) {
	return usermanagement.GetUser(ctx, username)
}

func (r *queryResolver) GetProject(ctx context.Context, projectID string) (*model.Project, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return project.GetProject(ctx, projectID)
}

func (r *queryResolver) ListProjects(ctx context.Context) ([]*model.Project, error) {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	userUID := claims["uid"].(string)

	err := authorization.ValidateUserStatus(ctx, userUID)
	if err != nil {
		return nil, err
	}

	return project.GetProjectsByUserID(ctx, userUID)
}

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	return usermanagement.GetUsers(ctx)
}

func (r *queryResolver) GetHeatmapData(ctx context.Context, projectID string, workflowID string, year int) ([]*model.HeatmapData, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return analyticsHandler.GetHeatMapData(workflowID, projectID, year)
}

func (r *queryResolver) GetWorkflowStats(ctx context.Context, projectID string, filter model.TimeFrequency, showWorkflowRuns bool) ([]*model.WorkflowStats, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return analyticsHandler.GetWorkflowStats(projectID, filter, showWorkflowRuns)
}

func (r *queryResolver) GetWorkflowRunStats(ctx context.Context, workflowRunStatsRequest model.WorkflowRunStatsRequest) (*model.WorkflowRunStatsResponse, error) {
	err := authorization.ValidateRole(ctx, workflowRunStatsRequest.ProjectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return analyticsHandler.GetWorkflowRunStats(workflowRunStatsRequest)
}

func (r *queryResolver) ListWorkflow(ctx context.Context, workflowInput model.ListWorkflowsInput) (*model.ListWorkflowsOutput, error) {
	err := authorization.ValidateRole(ctx, workflowInput.ProjectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return wfHandler.QueryListWorkflow(workflowInput)
}

func (r *queryResolver) GetCharts(ctx context.Context, hubName string, projectID string) ([]*model.Chart, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return myhub.GetCharts(ctx, hubName, projectID)
}

func (r *queryResolver) GetHubExperiment(ctx context.Context, experimentInput model.ExperimentInput) (*model.Chart, error) {
	err := authorization.ValidateRole(ctx, experimentInput.ProjectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return myhub.GetExperiment(ctx, experimentInput)
}

func (r *queryResolver) GetHubStatus(ctx context.Context, projectID string) ([]*model.MyHubStatus, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return myhub.HubStatus(ctx, projectID)
}

func (r *queryResolver) GetYAMLData(ctx context.Context, experimentInput model.ExperimentInput) (string, error) {
	return myhub.GetYAMLData(ctx, experimentInput)
}

func (r *queryResolver) GetPredefinedWorkflowList(ctx context.Context, hubName string, projectID string) ([]string, error) {
	return myhub.GetPredefinedWorkflowList(hubName, projectID)
}

func (r *queryResolver) GetPredefinedExperimentYaml(ctx context.Context, experimentInput model.ExperimentInput) (string, error) {
	return myhub.GetPredefinedExperimentYAMLData(ctx, experimentInput)
}

func (r *queryResolver) ListDataSource(ctx context.Context, projectID string) ([]*model.DSResponse, error) {
	return analyticsHandler.QueryListDataSource(projectID)
}

func (r *queryResolver) GetPromQuery(ctx context.Context, query *model.PromInput) (*model.PromResponse, error) {
	promResponseData, _, err := analyticsHandler.GetPromQuery(query)
	return promResponseData, err
}

func (r *queryResolver) GetPromLabelNamesAndValues(ctx context.Context, series *model.PromSeriesInput) (*model.PromSeriesResponse, error) {
	return analyticsHandler.GetLabelNamesAndValues(series)
}

func (r *queryResolver) GetPromSeriesList(ctx context.Context, dsDetails *model.DsDetails) (*model.PromSeriesListResponse, error) {
	return analyticsHandler.GetSeriesList(dsDetails)
}

func (r *queryResolver) ListDashboard(ctx context.Context, projectID string, clusterID *string, dbID *string) ([]*model.ListDashboardResponse, error) {
	return analyticsHandler.QueryListDashboard(projectID, clusterID, dbID)
}

func (r *queryResolver) PortalDashboardData(ctx context.Context, projectID string, hubName string) ([]*model.PortalDashboardData, error) {
	err := authorization.ValidateRole(ctx, projectID, []model.MemberRole{model.MemberRoleOwner, model.MemberRoleEditor, model.MemberRoleViewer}, usermanagement.AcceptedInvitation)
	if err != nil {
		return nil, err
	}
	return analyticsHandler.GetPortalDashboardData(projectID, hubName)
}

func (r *queryResolver) GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error) {
	return gitOpsHandler.GetGitOpsDetailsHandler(ctx, projectID)
}

func (r *queryResolver) ListManifestTemplate(ctx context.Context, projectID string) ([]*model.ManifestTemplate, error) {
	return wfHandler.ListWorkflowTemplate(ctx, projectID)
}

func (r *queryResolver) GetTemplateManifestByID(ctx context.Context, templateID string) (*model.ManifestTemplate, error) {
	return wfHandler.QueryTemplateWorkflowByID(ctx, templateID)
}

func (r *queryResolver) ListImageRegistry(ctx context.Context, projectID string) ([]*model.ImageRegistryResponse, error) {
	imageRegistries, err := imageRegistryOps.ListImageRegistries(ctx, projectID)
	if err != nil {
		log.Print(err)
	}

	return imageRegistries, err
}

func (r *queryResolver) GetImageRegistry(ctx context.Context, imageRegistryID string, projectID string) (*model.ImageRegistryResponse, error) {
	imageRegistry, err := imageRegistryOps.GetImageRegistry(ctx, imageRegistryID, projectID)
	if err != nil {
		log.Print(err)
	}

	return imageRegistry, err
}

func (r *queryResolver) UsageQuery(ctx context.Context, query model.UsageQuery) (*model.UsageData, error) {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	if claims["role"].(string) != "admin" {
		return nil, errors.New("only portal admin access")
	}
	return usage.GetUsage(ctx, query)
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
	log.Print("NEW WORKFLOW EVENT LISTENER: ", projectID)
	workflowEvent := make(chan *model.WorkflowRun, 1)
	data_store.Store.Mutex.Lock()
	data_store.Store.WorkflowEventPublish[projectID] = append(data_store.Store.WorkflowEventPublish[projectID], workflowEvent)
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Print("CLOSED WORKFLOW LISTENER: ", projectID)
	}()
	return workflowEvent, nil
}

func (r *subscriptionResolver) GetPodLog(ctx context.Context, podDetails model.PodLogRequest) (<-chan *model.PodLogResponse, error) {
	log.Print("NEW LOG REQUEST: ", podDetails.ClusterID, podDetails.PodName)
	workflowLog := make(chan *model.PodLogResponse, 1)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.WorkflowLog[reqID.String()] = workflowLog
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Print("CLOSED LOG LISTENER: ", podDetails.ClusterID, podDetails.PodName)
		delete(data_store.Store.WorkflowLog, reqID.String())
	}()
	go wfHandler.GetLogs(reqID.String(), podDetails, *data_store.Store)
	return workflowLog, nil
}

func (r *subscriptionResolver) ClusterConnect(ctx context.Context, clusterInfo model.ClusterIdentity) (<-chan *model.ClusterAction, error) {
	log.Print("NEW CLUSTER CONNECT: ", clusterInfo.ClusterID)
	clusterAction := make(chan *model.ClusterAction, 1)
	verifiedCluster, err := cluster.VerifyCluster(clusterInfo)
	if err != nil {
		log.Print("VALIDATION FAILED: ", clusterInfo.ClusterID)
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

func (r *subscriptionResolver) GetKubeObject(ctx context.Context, kubeObjectRequest model.KubeObjectRequest) (<-chan *model.KubeObjectResponse, error) {
	log.Print("NEW KUBEOBJECT REQUEST", kubeObjectRequest.ClusterID)
	kubeObjData := make(chan *model.KubeObjectResponse)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.KubeObjectData[reqID.String()] = kubeObjData
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Println("Closed KubeObj Listener")
		delete(data_store.Store.KubeObjectData, reqID.String())
	}()
	go wfHandler.GetKubeObjData(reqID.String(), kubeObjectRequest, *data_store.Store)
	return kubeObjData, nil
}

func (r *subscriptionResolver) ViewDashboard(ctx context.Context, dashboardID *string, promQueries []*model.PromQueryInput, dashboardQueryMap []*model.QueryMapForPanelGroup, dataVariables model.DataVars) (<-chan *model.DashboardPromResponse, error) {
	dashboardData := make(chan *model.DashboardPromResponse)
	viewID := uuid.New()
	log.Printf("Dashboard view %v created\n", viewID.String())
	data_store.Store.Mutex.Lock()
	data_store.Store.DashboardData[viewID.String()] = dashboardData
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Printf("Closed dashboard view %v\n", viewID.String())
		if _, ok := data_store.Store.DashboardData[viewID.String()]; ok {
			analyticsOps.UpdateViewedAt(dashboardID, viewID.String())

			data_store.Store.Mutex.Lock()
			delete(data_store.Store.DashboardData, viewID.String())
			data_store.Store.Mutex.Unlock()
		}
	}()
	go analyticsHandler.DashboardViewer(viewID.String(), dashboardID, promQueries, dashboardQueryMap, dataVariables, *data_store.Store)
	return dashboardData, nil
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
