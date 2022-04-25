package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt"
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
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/handlers"
	imageRegistryOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/image_registry/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub"
	myHubOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/myhub/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/usage"
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

func (r *mutationResolver) CreateChaosWorkFlow(ctx context.Context, request model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.CreateChaosWorkFlow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return wfHandler.CreateChaosWorkflow(ctx, &request, data_store.Store)
}

func (r *mutationResolver) ReRunChaosWorkFlow(ctx context.Context, projectID string, workflowID string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ReRunChaosWorkFlow],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Print("Error getting username: ", err)
		return "", err
	}

	return wfHandler.ReRunWorkflow(projectID, workflowID, username)
}

func (r *mutationResolver) UpdateChaosWorkflow(ctx context.Context, request *model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return wfHandler.UpdateChaosWorkflow(ctx, request, data_store.Store)
}

func (r *mutationResolver) DeleteChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.DeleteChaosWorkflow(ctx, projectID, workflowID, workflowRunID, data_store.Store)
}

func (r *mutationResolver) TerminateChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.TerminateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.TerminateChaosWorkflow(ctx, projectID, workflowID, workflowRunID, data_store.Store)
}

func (r *mutationResolver) SyncWorkflow(ctx context.Context, projectID string, workflowID string, workflowRunID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.SyncWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.SyncWorkflowRun(ctx, projectID, workflowID, workflowRunID, data_store.Store)
}

func (r *mutationResolver) ChaosWorkflowRun(ctx context.Context, request model.WorkflowRunInput) (string, error) {
	return wfHandler.ChaosWorkflowRun(request, *data_store.Store)
}

func (r *mutationResolver) PodLog(ctx context.Context, request model.PodLog) (string, error) {
	return wfHandler.PodLog(request, *data_store.Store)
}

func (r *mutationResolver) KubeObj(ctx context.Context, request model.KubeObjectData) (string, error) {
	return wfHandler.KubeObj(request, *data_store.Store)
}

func (r *mutationResolver) CreateWorkflowTemplate(ctx context.Context, request *model.TemplateInput) (*model.WorkflowTemplate, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.CreateWorkflowTemplate],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.CreateWorkflowTemplate(ctx, request)
}

func (r *mutationResolver) DeleteWorkflowTemplate(ctx context.Context, projectID string, templateID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteWorkflowTemplate],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.DeleteWorkflowTemplate(ctx, projectID, templateID)
}

func (r *mutationResolver) AddMyHub(ctx context.Context, myhubInput model.CreateMyHub, projectID string) (*model.MyHub, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.AddMyHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.AddMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) SaveMyHub(ctx context.Context, myhubInput model.CreateMyHub, projectID string) (*model.MyHub, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.SaveMyHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.SaveMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) SyncHub(ctx context.Context, id string, projectID string) ([]*model.MyHubStatus, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return myhub.SyncHub(ctx, id, projectID)
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
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateMyHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return myhub.UpdateMyHub(ctx, myhubInput, projectID)
}

func (r *mutationResolver) DeleteMyHub(ctx context.Context, projectID string, hubID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteMyHub],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return myhub.DeleteMyHub(ctx, hubID, projectID)
}

func (r *mutationResolver) GitopsNotifer(ctx context.Context, clusterInfo model.ClusterIdentity, workflowID string) (string, error) {
	return gitOpsHandler.GitOpsNotificationHandler(ctx, clusterInfo, workflowID)
}

func (r *mutationResolver) EnableGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, config.ProjectID,
		authorization.MutationRbacRules[authorization.EnableGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return gitOpsHandler.EnableGitOpsHandler(ctx, config)
}

func (r *mutationResolver) DisableGitOps(ctx context.Context, projectID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DisableGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return gitOpsHandler.DisableGitOpsHandler(ctx, projectID)
}

func (r *mutationResolver) UpdateGitOps(ctx context.Context, config model.GitConfig) (bool, error) {
	err := authorization.ValidateRole(ctx, config.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateGitOps],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return gitOpsHandler.UpdateGitOpsDetailsHandler(ctx, config)
}

func (r *mutationResolver) CreateDataSource(ctx context.Context, datasource *model.DSInput) (*model.DSResponse, error) {
	err := authorization.ValidateRole(ctx, *datasource.ProjectID,
		authorization.MutationRbacRules[authorization.CreateDataSource],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.CreateDataSource(datasource)
}

func (r *mutationResolver) CreateDashBoard(ctx context.Context, dashboard *model.CreateDBInput) (*model.ListDashboardResponse, error) {
	err := authorization.ValidateRole(ctx, dashboard.ProjectID,
		authorization.MutationRbacRules[authorization.CreateDashBoard],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.CreateDashboard(dashboard)
}

func (r *mutationResolver) UpdateDataSource(ctx context.Context, datasource model.DSInput) (*model.DSResponse, error) {
	err := authorization.ValidateRole(ctx, *datasource.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateDataSource],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.UpdateDataSource(datasource)
}

func (r *mutationResolver) UpdateDashboard(ctx context.Context, projectID string, dashboard model.UpdateDBInput, chaosQueryUpdate bool) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateDashboard],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	return analyticsHandler.UpdateDashBoard(projectID, dashboard, chaosQueryUpdate)
}

func (r *mutationResolver) UpdatePanel(ctx context.Context, panelInput []*model.Panel) (string, error) {
	return analyticsHandler.UpdatePanel(panelInput)
}

func (r *mutationResolver) DeleteDashboard(ctx context.Context, projectID string, dbID *string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteDashboard],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return analyticsHandler.DeleteDashboard(projectID, dbID)
}

func (r *mutationResolver) DeleteDataSource(ctx context.Context, projectID string, input model.DeleteDSInput) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteDataSource],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return analyticsHandler.DeleteDataSource(projectID, input)
}

func (r *mutationResolver) CreateImageRegistry(ctx context.Context, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.CreateImageRegistry],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	ciResponse, err := imageRegistryOps.CreateImageRegistry(ctx, projectID, imageRegistryInfo)
	if err != nil {
		log.Print(err)
	}
	return ciResponse, err
}

func (r *mutationResolver) UpdateImageRegistry(ctx context.Context, imageRegistryID string, projectID string, imageRegistryInfo model.ImageRegistryInput) (*model.ImageRegistryResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateImageRegistry],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	uiRegistry, err := imageRegistryOps.UpdateImageRegistry(ctx, imageRegistryID, projectID, imageRegistryInfo)
	if err != nil {
		log.Print(err)
	}

	return uiRegistry, err
}

func (r *mutationResolver) DeleteImageRegistry(ctx context.Context, imageRegistryID string, projectID string) (string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteImageRegistry],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	diRegistry, err := imageRegistryOps.DeleteImageRegistry(ctx, imageRegistryID, projectID)
	if err != nil {
		log.Print(err)
	}

	return diRegistry, err
}

func (r *queryResolver) GetClusters(ctx context.Context, projectID string, clusterType *string) ([]*model.Cluster, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetCluster],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return clusterHandler.QueryGetClusters(projectID, clusterType)
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

func (r *queryResolver) GetWorkflows(ctx context.Context, workflowInput model.ListWorkflowsInput) (*model.ListWorkflowsOutput, error) {
	err := authorization.ValidateRole(ctx, workflowInput.ProjectID,
		authorization.MutationRbacRules[authorization.ListWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.QueryListWorkflow(workflowInput)
}

func (r *queryResolver) GetWorkflowRuns(ctx context.Context, workflowRunsInput model.GetWorkflowRunsInput) (*model.GetWorkflowsOutput, error) {
	err := authorization.ValidateRole(ctx, workflowRunsInput.ProjectID,
		authorization.MutationRbacRules[authorization.GetWorkflowRuns],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.QueryWorkflowRuns(workflowRunsInput)
}

func (r *queryResolver) GetPredefinedWorkflowList(ctx context.Context, hubName string, projectID string) ([]string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetPredefinedWorkflowList],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.GetPredefinedWorkflowList(hubName, projectID)
}

func (r *queryResolver) GetPredefinedExperimentYaml(ctx context.Context, experimentInput model.ExperimentInput) (string, error) {
	err := authorization.ValidateRole(ctx, experimentInput.ProjectID,
		authorization.MutationRbacRules[authorization.GetPredefinedExperimentYaml],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}
	return myhub.GetPredefinedExperimentYAMLData(experimentInput)
}

func (r *queryResolver) ListManifestTemplate(ctx context.Context, projectID string) ([]*model.WorkflowTemplate, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListWorkflowTemplate],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.ListWorkflowTemplate(ctx, projectID)
}

func (r *queryResolver) GetTemplateManifestByID(ctx context.Context, projectID string, templateID string) (*model.WorkflowTemplate, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetTemplateManifestByID],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.QueryTemplateWorkflowByID(ctx, templateID)
}

func (r *queryResolver) GetCharts(ctx context.Context, hubName string, projectID string) ([]*model.Chart, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetCharts],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.GetCharts(ctx, hubName, projectID)
}

func (r *queryResolver) GetHubExperiment(ctx context.Context, experimentInput model.ExperimentInput) (*model.Chart, error) {
	err := authorization.ValidateRole(ctx, experimentInput.ProjectID,
		authorization.MutationRbacRules[authorization.GetHubExperiment],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.GetExperiment(ctx, experimentInput)
}

func (r *queryResolver) GetHubStatus(ctx context.Context, projectID string) ([]*model.MyHubStatus, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetHubStatus],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.HubStatus(ctx, projectID)
}

func (r *queryResolver) GetYAMLData(ctx context.Context, experimentInput model.ExperimentInput) (string, error) {
	err := authorization.ValidateRole(ctx, experimentInput.ProjectID,
		authorization.MutationRbacRules[authorization.GetYAMLData],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	return myhub.GetYAMLData(experimentInput)
}

func (r *queryResolver) GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetGitOpsDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return gitOpsHandler.GetGitOpsDetailsHandler(ctx, projectID)
}

func (r *queryResolver) GetHeatmapData(ctx context.Context, projectID string, workflowID string, year int) ([]*model.HeatmapData, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetHeatmapData],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.GetHeatMapData(workflowID, projectID, year)
}

func (r *queryResolver) GetWorkflowStats(ctx context.Context, projectID string, filter model.TimeFrequency, showWorkflowRuns bool) ([]*model.WorkflowStats, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetWorkflowStats],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.GetWorkflowStats(projectID, filter, showWorkflowRuns)
}

func (r *queryResolver) GetWorkflowRunStats(ctx context.Context, workflowRunStatsRequest model.WorkflowRunStatsRequest) (*model.WorkflowRunStatsResponse, error) {
	err := authorization.ValidateRole(ctx, workflowRunStatsRequest.ProjectID,
		authorization.MutationRbacRules[authorization.GetWorkflowRunStats],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.GetWorkflowRunStats(workflowRunStatsRequest)
}

func (r *queryResolver) ListDataSource(ctx context.Context, projectID string) ([]*model.DSResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListDataSource],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

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
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListDashboard],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.QueryListDashboard(projectID, clusterID, dbID)
}

func (r *queryResolver) PortalDashboardData(ctx context.Context, projectID string, hubName string) ([]*model.PortalDashboardData, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.PortalDashboardData],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return analyticsHandler.GetPortalDashboardData(projectID, hubName)
}

func (r *queryResolver) ListImageRegistry(ctx context.Context, projectID string) ([]*model.ImageRegistryResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListImageRegistry],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	imageRegistries, err := imageRegistryOps.ListImageRegistries(ctx, projectID)
	if err != nil {
		log.Print(err)
	}

	return imageRegistries, err
}

func (r *queryResolver) GetImageRegistry(ctx context.Context, imageRegistryID string, projectID string) (*model.ImageRegistryResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetImageRegistry],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

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
