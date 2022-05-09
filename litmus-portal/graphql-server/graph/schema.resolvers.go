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

	return wfHandler.ReRunChaosWorkFlow(projectID, workflowID, username)
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

func (r *mutationResolver) ChaosWorkflowRun(ctx context.Context, request model.WorkflowRunRequest) (string, error) {
	return wfHandler.ChaosWorkflowRun(request, *data_store.Store)
}

func (r *mutationResolver) SyncWorkflowRun(ctx context.Context, projectID string, workflowID string, workflowRunID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.SyncWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}

	return wfHandler.SyncWorkflowRun(ctx, projectID, workflowID, workflowRunID, data_store.Store)
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

func (r *mutationResolver) AddChaosHub(ctx context.Context, request model.CreateChaosHubRequest) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.AddMyHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.AddChaosHub(ctx, request)
}

func (r *mutationResolver) SaveChaosHub(ctx context.Context, request model.CreateChaosHubRequest) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.SaveMyHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.SaveChaosHub(ctx, request)
}

func (r *mutationResolver) SyncChaosHub(ctx context.Context, id string, projectID string) ([]*model.ChaosHubStatus, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.UpdateChaosWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return myhub.SyncHub(ctx, id, projectID)
}

func (r *mutationResolver) GenerateSSHKey(ctx context.Context) (*model.SSHKey, error) {
	publicKey, privateKey, err := myHubOps.GenerateKeys()
	if err != nil {
		return nil, err
	}

	return &model.SSHKey{
		PrivateKey: privateKey,
		PublicKey:  publicKey,
	}, nil
}

func (r *mutationResolver) UpdateChaosHub(ctx context.Context, request model.UpdateChaosHubRequest) (*model.ChaosHub, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.UpdateMyHub],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return myhub.UpdateChaosHub(ctx, request)
}

func (r *mutationResolver) DeleteChaosHub(ctx context.Context, projectID string, hubID string) (bool, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.DeleteMyHub],
		model.InvitationAccepted.String())
	if err != nil {
		return false, err
	}
	return myhub.DeleteChaosHub(ctx, hubID, projectID)
}

func (r *mutationResolver) GitopsNotifier(ctx context.Context, clusterInfo model.ClusterIdentity, workflowID string) (string, error) {
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

func (r *queryResolver) ListClusters(ctx context.Context, projectID string, clusterType *string) ([]*model.Cluster, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListClusters],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return clusterHandler.ListClusters(projectID, clusterType)
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

func (r *queryResolver) ListWorkflows(ctx context.Context, request model.ListWorkflowsRequest) (*model.ListWorkflowsResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.ListWorkflow],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.ListWorkflows(request)
}

func (r *queryResolver) ListWorkflowRuns(ctx context.Context, request model.ListWorkflowRunsRequest) (*model.ListWorkflowRunsResponse, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.ListWorkflowRuns],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.ListWorkflowRuns(request)
}

func (r *queryResolver) ListPredefinedWorkflows(ctx context.Context, hubName string, projectID string) ([]string, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListPredefinedWorkflows],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.ListPredefinedWorkflows(hubName, projectID)
}

func (r *queryResolver) GetPredefinedExperimentYaml(ctx context.Context, request model.ExperimentRequest) (string, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.GetPredefinedExperimentYaml],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}
	return myhub.GetPredefinedExperimentYAMLData(request)
}

func (r *queryResolver) ListWorkflowManifests(ctx context.Context, projectID string) ([]*model.WorkflowTemplate, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListWorkflowManifests],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.ListWorkflowManifests(ctx, projectID)
}

func (r *queryResolver) GetWorkflowManifestByID(ctx context.Context, projectID string, templateID string) (*model.WorkflowTemplate, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetWorkflowManifestByID],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return wfHandler.GetWorkflowManifestByID(ctx, templateID)
}

func (r *queryResolver) ListCharts(ctx context.Context, hubName string, projectID string) ([]*model.Chart, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListCharts],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.ListCharts(ctx, hubName, projectID)
}

func (r *queryResolver) GetHubExperiment(ctx context.Context, request model.ExperimentRequest) (*model.Chart, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.GetHubExperiment],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.GetHubExperiment(ctx, request)
}

func (r *queryResolver) ListHubStatus(ctx context.Context, projectID string) ([]*model.ChaosHubStatus, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListHubStatus],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return myhub.ListHubStatus(ctx, projectID)
}

func (r *queryResolver) GetYAMLData(ctx context.Context, request model.ExperimentRequest) (string, error) {
	err := authorization.ValidateRole(ctx, request.ProjectID,
		authorization.MutationRbacRules[authorization.GetYAMLData],
		model.InvitationAccepted.String())
	if err != nil {
		return "", err
	}

	return myhub.GetYAMLData(request)
}

func (r *queryResolver) GetGitOpsDetails(ctx context.Context, projectID string) (*model.GitConfigResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.GetGitOpsDetails],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return gitOpsHandler.GetGitOpsDetails(ctx, projectID)
}

func (r *queryResolver) ListHeatmapData(ctx context.Context, projectID string, workflowID string, year int) ([]*model.HeatmapDataResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListHeatmapData],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.ListHeatmapData(workflowID, projectID, year)
}

func (r *queryResolver) ListWorkflowStats(ctx context.Context, projectID string, filter model.TimeFrequency, showWorkflowRuns bool) ([]*model.WorkflowStatsResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListWorkflowStats],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}

	return analyticsHandler.ListWorkflowStats(projectID, filter, showWorkflowRuns)
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

func (r *queryResolver) GetPrometheusData(ctx context.Context, request *model.PrometheusDataRequest) (*model.PrometheusDataResponse, error) {
	promResponseData, _, err := analyticsHandler.GetPrometheusData(request)
	return promResponseData, err
}

func (r *queryResolver) GetPromLabelNamesAndValues(ctx context.Context, request *model.PromSeriesInput) (*model.PromSeriesResponse, error) {
	return analyticsHandler.GetLabelNamesAndValues(request)
}

func (r *queryResolver) GetPromSeriesList(ctx context.Context, request *model.DsDetails) (*model.PromSeriesListResponse, error) {
	return analyticsHandler.GetPromSeriesList(request)
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

func (r *queryResolver) ListPortalDashboardData(ctx context.Context, projectID string, hubName string) ([]*model.PortalDashboardDataResponse, error) {
	err := authorization.ValidateRole(ctx, projectID,
		authorization.MutationRbacRules[authorization.ListPortalDashboardData],
		model.InvitationAccepted.String())
	if err != nil {
		return nil, err
	}
	return analyticsHandler.ListPortalDashboardData(projectID, hubName)
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

func (r *queryResolver) GetUsageData(ctx context.Context, request model.UsageDataRequest) (*model.UsageDataResponse, error) {
	claims := ctx.Value(authorization.UserClaim).(jwt.MapClaims)
	if claims["role"].(string) != "admin" {
		return nil, errors.New("only portal admin access")
	}
	return usage.GetUsageData(ctx, request)
}

func (r *subscriptionResolver) GetClusterEvents(ctx context.Context, projectID string) (<-chan *model.ClusterEventResponse, error) {
	log.Print("NEW EVENT ", projectID)
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
	log.Print("NEW CLUSTER CONNECT: ", clusterInfo.ClusterID)
	clusterAction := make(chan *model.ClusterActionResponse, 1)
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

func (r *subscriptionResolver) GetWorkflowEvents(ctx context.Context, projectID string) (<-chan *model.WorkflowRun, error) {
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

func (r *subscriptionResolver) GetPodLog(ctx context.Context, request model.PodLogRequest) (<-chan *model.PodLogResponse, error) {
	log.Print("NEW LOG REQUEST: ", request.ClusterID, request.PodName)
	workflowLog := make(chan *model.PodLogResponse, 1)
	reqID := uuid.New()
	data_store.Store.Mutex.Lock()
	data_store.Store.WorkflowLog[reqID.String()] = workflowLog
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		log.Print("CLOSED LOG LISTENER: ", request.ClusterID, request.PodName)
		delete(data_store.Store.WorkflowLog, reqID.String())
	}()
	go wfHandler.GetLogs(reqID.String(), request, *data_store.Store)
	return workflowLog, nil
}

func (r *subscriptionResolver) GetKubeObject(ctx context.Context, request model.KubeObjectRequest) (<-chan *model.KubeObjectResponse, error) {
	log.Print("NEW KUBEOBJECT REQUEST", request.ClusterID)
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
	go wfHandler.GetKubeObjData(reqID.String(), request, *data_store.Store)
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
