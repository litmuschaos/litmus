package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	analyticsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/handler"
	analyticsOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	data_store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/sirupsen/logrus"
)

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

func (r *subscriptionResolver) ViewDashboard(ctx context.Context, dashboardID *string, promQueries []*model.PromQueryInput, dashboardQueryMap []*model.QueryMapForPanelGroup, dataVariables model.DataVars) (<-chan *model.DashboardPromResponse, error) {
	dashboardData := make(chan *model.DashboardPromResponse)
	viewID := uuid.New()
	logrus.Printf("Dashboard view %v created\n", viewID.String())
	data_store.Store.Mutex.Lock()
	data_store.Store.DashboardData[viewID.String()] = dashboardData
	data_store.Store.Mutex.Unlock()
	go func() {
		<-ctx.Done()
		logrus.Printf("Closed dashboard view %v\n", viewID.String())
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
