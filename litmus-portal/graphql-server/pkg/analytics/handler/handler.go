package handler

import (
	"errors"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/ops/prometheus"
	dbOperationsAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
)

func CreateDataSource(datasource *model.DSInput) (*model.DSResponse, error) {

	datasourceStatus := prometheus.TSDBHealthCheck(datasource.DsURL, datasource.DsType)

	if datasourceStatus == "Active" {

		newDS := dbOperationsAnalytics.DataSource{
			DsID:              uuid.New().String(),
			DsName:            datasource.DsName,
			DsType:            datasource.DsType,
			DsURL:             datasource.DsURL,
			AccessType:        datasource.AccessType,
			AuthType:          datasource.AuthType,
			BasicAuthUsername: datasource.BasicAuthUsername,
			BasicAuthPassword: datasource.BasicAuthPassword,
			ScrapeInterval:    datasource.ScrapeInterval,
			QueryTimeout:      datasource.QueryTimeout,
			HTTPMethod:        datasource.HTTPMethod,
			ProjectID:         *datasource.ProjectID,
			CreatedAt:         strconv.FormatInt(time.Now().Unix(), 10),
			UpdatedAt:         strconv.FormatInt(time.Now().Unix(), 10),
		}

		err := dbOperationsAnalytics.InsertDataSource(newDS)
		if err != nil {
			return nil, err
		}

		var newDSResponse = model.DSResponse{}
		_ = copier.Copy(&newDSResponse, &newDS)

		return &newDSResponse, nil
	} else {
		return nil, errors.New("Datasource: " + datasourceStatus)
	}
}

func CreateDashboard(dashboard *model.CreateDBInput) (string, error) {

	newDashboard := dbOperationsAnalytics.DashBoard{
		DbID:        uuid.New().String(),
		DbName:      dashboard.DbName,
		DbType:      dashboard.DbType,
		DsID:        dashboard.DsID,
		EndTime:     dashboard.EndTime,
		StartTime:   dashboard.StartTime,
		RefreshRate: dashboard.RefreshRate,
		ClusterID:   dashboard.ClusterID,
		ProjectID:   dashboard.ProjectID,
		IsRemoved:   false,
		CreatedAt:   strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:   strconv.FormatInt(time.Now().Unix(), 10),
	}

	var (
		newPanelGroups = make([]dbOperationsAnalytics.PanelGroup, len(dashboard.PanelGroups))
		newPanels      []*dbOperationsAnalytics.Panel
	)

	for i, panel_group := range dashboard.PanelGroups {

		panelGroupID := uuid.New().String()
		newPanelGroups[i].PanelGroupID = panelGroupID
		newPanelGroups[i].PanelGroupName = panel_group.PanelGroupName

		for _, panel := range panel_group.Panels {
			var newPromQueries []*dbOperationsAnalytics.PromQuery
			err := copier.Copy(&newPromQueries, &panel.PromQueries)
			if err != nil {
				fmt.Print(err)
			}
			var newPanelOptions dbOperationsAnalytics.PanelOption
			err = copier.Copy(&newPanelOptions, &panel.PanelOptions)
			if err != nil {
				fmt.Print(err)
			}
			newPanel := dbOperationsAnalytics.Panel{
				PanelID:      uuid.New().String(),
				PanelOptions: &newPanelOptions,
				PanelName:    panel.PanelName,
				PanelGroupID: panelGroupID,
				PromQueries:  newPromQueries,
				IsRemoved:    false,
				XAxisDown:    panel.XAxisDown,
				YAxisLeft:    panel.YAxisLeft,
				YAxisRight:   panel.YAxisRight,
				Unit:         panel.Unit,
				CreatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
				UpdatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
			}

			newPanels = append(newPanels, &newPanel)
		}
	}
	err := dbOperationsAnalytics.InsertPanel(newPanels)
	if err != nil {
		return "", fmt.Errorf("error on inserting panel data %s", err)
	}
	log.Print("sucessfully inserted prom query into promquery-collection")

	newDashboard.PanelGroups = newPanelGroups

	err = dbOperationsAnalytics.InsertDashBoard(newDashboard)
	if err != nil {
		return "", fmt.Errorf("error on inserting panel data %s", err)
	}
	log.Print("sucessfully inserted dashboard into dashboard-collection")

	return "sucessfully created", nil
}

func UpdateDataSource(datasource model.DSInput) (*model.DSResponse, error) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	if datasource.DsID == nil || *datasource.DsID == "" {
		return nil, errors.New("datasource ID is nil or empty")
	}

	query := bson.D{{Key: "ds_id", Value: datasource.DsID}}

	update := bson.D{{Key: "$set", Value: bson.D{{Key: "ds_name", Value: datasource.DsName},
		{Key: "ds_url", Value: datasource.DsURL}, {Key: "access_type", Value: datasource.AccessType},
		{Key: "auth_type", Value: datasource.AuthType}, {Key: "basic_auth_username", Value: datasource.BasicAuthUsername},
		{Key: "basic_auth_password", Value: datasource.BasicAuthPassword}, {Key: "scrape_interval", Value: datasource.ScrapeInterval},
		{Key: "query_timeout", Value: datasource.QueryTimeout}, {Key: "http_method", Value: datasource.HTTPMethod},
		{Key: "updated_at", Value: timestamp}}}}

	err := dbOperationsAnalytics.UpdateDataSource(query, update)
	if err != nil {
		return nil, err
	}

	return &model.DSResponse{
		DsID:              datasource.DsID,
		DsName:            &datasource.DsName,
		DsType:            &datasource.DsType,
		DsURL:             &datasource.DsURL,
		AccessType:        &datasource.AccessType,
		AuthType:          &datasource.AuthType,
		BasicAuthPassword: datasource.BasicAuthPassword,
		BasicAuthUsername: datasource.BasicAuthUsername,
		ScrapeInterval:    &datasource.ScrapeInterval,
		QueryTimeout:      &datasource.QueryTimeout,
		HTTPMethod:        &datasource.HTTPMethod,
		UpdatedAt:         &timestamp,
	}, nil
}

func UpdateDashBoard(dashboard *model.UpdataDBInput) (string, error) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	if dashboard.DbID == "" && dashboard.DsID == "" {
		return "", errors.New("DashBoard ID or Datasource is nil or empty")
	}

	query := bson.D{{Key: "db_id", Value: dashboard.DbID}}

	update := bson.D{{Key: "$set", Value: bson.D{{Key: "ds_id", Value: dashboard.DsID}, {Key: "db_name", Value: dashboard.DbName},
		{Key: "db_type", Value: dashboard.DbType}, {Key: "end_time", Value: dashboard.EndTime},
		{Key: "start_time", Value: dashboard.StartTime}, {Key: "refresh_rate", Value: dashboard.RefreshRate},
		{Key: "panel_groups", Value: dashboard.PanelGroups}, {Key: "updated_at", Value: timestamp}}}}

	err := dbOperationsAnalytics.UpdateDashboard(query, update)
	if err != nil {
		return "", err
	}

	return "successfully updated", nil
}

func UpdatePanel(panels []*model.Panel) (string, error) {

	for _, panel := range panels {
		timestamp := strconv.FormatInt(time.Now().Unix(), 10)

		if *panel.PanelID == "" && *panel.PanelGroupID == "" {
			return "", errors.New("DashBoard ID or Datasource is nil or empty")
		}

		var newPanelOption dbOperationsAnalytics.PanelOption
		err := copier.Copy(&newPanelOption, &panel.PanelOptions)
		if err != nil {
			return "", err
		}
		var newPromQueries []dbOperationsAnalytics.PromQuery
		err = copier.Copy(&newPromQueries, panel.PromQueries)
		if err != nil {
			return "", err
		}
		query := bson.D{{Key: "panel_id", Value: panel.PanelID}}

		update := bson.D{{Key: "$set", Value: bson.D{{Key: "panel_name", Value: panel.PanelName},
			{Key: "panel_group_id", Value: panel.PanelGroupID}, {Key: "panel_options", Value: newPanelOption},
			{Key: "prom_queries", Value: newPromQueries}, {Key: "updated_at", Value: timestamp},
			{Key: "y_axis_left", Value: panel.YAxisLeft}, {Key: "y_axis_right", Value: panel.YAxisRight},
			{Key: "x_axis_down", Value: panel.XAxisDown}, {Key: "unit", Value: panel.Unit}}}}

		err = dbOperationsAnalytics.UpdatePanel(query, update)
		if err != nil {
			return "", err
		}
	}

	return "successfully updated", nil
}

func DeleteDashboard(db_id *string) (bool, error) {

	dashboardQuery := bson.M{"db_id": db_id, "is_removed": false}
	dashboard, err := dbOperationsAnalytics.GetDashboard(dashboardQuery)
	if err != nil {
		return false, fmt.Errorf("failed to list dashboard, error: %v", err)
	}

	for _, panelGroup := range dashboard.PanelGroups {
		listPanelQuery := bson.M{"panel_group_id": panelGroup.PanelGroupID, "is_removed": false}
		panels, err := dbOperationsAnalytics.ListPanel(listPanelQuery)
		if err != nil {
			return false, fmt.Errorf("failed to list Panel, error: %v", err)
		}

		for _, panel := range panels {
			time := strconv.FormatInt(time.Now().Unix(), 10)

			query := bson.D{{Key: "panel_id", Value: panel.PanelID}, {Key: "is_removed", Value: false}}
			update := bson.D{{Key: "$set", Value: bson.D{{Key: "is_removed", Value: true}, {Key: "updated_at", Value: time}}}}

			err := dbOperationsAnalytics.UpdatePanel(query, update)
			if err != nil {
				return false, fmt.Errorf("failed to delete panel, error: %v", err)
			}
		}
	}

	time := strconv.FormatInt(time.Now().Unix(), 10)

	query := bson.D{{Key: "db_id", Value: db_id}}
	update := bson.D{{Key: "$set", Value: bson.D{{Key: "is_removed", Value: true}, {Key: "updated_at", Value: time}}}}

	err = dbOperationsAnalytics.UpdateDashboard(query, update)
	if err != nil {
		return false, fmt.Errorf("failed to delete dashboard, error: %v", err)
	}

	return true, nil
}

func DeleteDataSource(input model.DeleteDSInput) (bool, error) {

	time := strconv.FormatInt(time.Now().Unix(), 10)

	listDBQuery := bson.M{"ds_id": input.DsID, "is_removed": false}
	dashboards, err := dbOperationsAnalytics.ListDashboard(listDBQuery)
	if err != nil {
		return false, fmt.Errorf("failed to list dashboard, error: %v", err)
	}

	if input.ForceDelete {
		for _, dashboard := range dashboards {

			for _, panelGroup := range dashboard.PanelGroups {
				listPanelQuery := bson.M{"panel_group_id": panelGroup.PanelGroupID, "is_removed": false}
				panels, err := dbOperationsAnalytics.ListPanel(listPanelQuery)
				if err != nil {
					return false, fmt.Errorf("failed to list Panel, error: %v", err)
				}

				for _, panel := range panels {
					query := bson.D{{Key: "panel_id", Value: panel.PanelID}, {Key: "is_removed", Value: false}}
					update := bson.D{{Key: "$set", Value: bson.D{{Key: "is_removed", Value: true}, {Key: "updated_at", Value: time}}}}

					err := dbOperationsAnalytics.UpdatePanel(query, update)
					if err != nil {
						return false, fmt.Errorf("failed to delete panel, error: %v", err)
					}
				}
			}
			updateDBQuery := bson.D{{Key: "db_id", Value: dashboard.DbID}}
			update := bson.D{{Key: "$set", Value: bson.D{{Key: "is_removed", Value: true}, {Key: "updated_at", Value: time}}}}

			err = dbOperationsAnalytics.UpdateDashboard(updateDBQuery, update)
			if err != nil {
				return false, fmt.Errorf("failed to delete dashboard, error: %v", err)
			}
		}

	} else if len(dashboards) > 0 {
		var db_names []string
		for _, dashboard := range dashboards {
			db_names = append(db_names, dashboard.DbName)
		}

		return false, fmt.Errorf("failed to delete datasource, dashboard(s) are attached to the datasource: %v", db_names)
	}

	updateDSQuery := bson.D{{Key: "ds_id", Value: input.DsID}}
	update := bson.D{{Key: "$set", Value: bson.D{{Key: "is_removed", Value: true}, {Key: "updated_at", Value: time}}}}

	err = dbOperationsAnalytics.UpdateDataSource(updateDSQuery, update)
	if err != nil {
		return false, fmt.Errorf("failed to delete datasource, error: %v", err)
	}

	return true, nil
}

func QueryListDataSource(projectID string) ([]*model.DSResponse, error) {
	query := bson.M{"project_id": projectID, "is_removed": false}

	datasource, err := dbOperationsAnalytics.ListDataSource(query)
	if err != nil {
		return nil, err
	}

	var newDatasources []*model.DSResponse
	err = copier.Copy(&newDatasources, &datasource)
	if err != nil {
		return nil, err
	}
	for _, datasource := range newDatasources {
		datasource.HealthStatus = prometheus.TSDBHealthCheck(*datasource.DsURL, *datasource.DsType)
	}

	return newDatasources, nil
}

func GetPromQuery(promInput *model.PromInput) ([]*model.PromResponse, error) {
	var newPromResponse []*model.PromResponse
	for _, v := range promInput.Queries {
		newPromQuery := analytics.PromQuery{
			Queryid:    v.Queryid,
			Query:      v.Query,
			Legend:     v.Legend,
			Resolution: v.Resolution,
			Minstep:    v.Minstep,
			URL:        promInput.URL,
			Start:      promInput.Start,
			End:        promInput.End,
		}

		response, err := prometheus.Query(newPromQuery)
		if err != nil {
			return nil, err
		}
		newPromResponse = append(newPromResponse, &response)
	}
	return newPromResponse, nil
}

func QueryListDashboard(projectID string) ([]*model.ListDashboardReponse, error) {
	query := bson.M{"project_id": projectID, "is_removed": false}

	dashboards, err := dbOperationsAnalytics.ListDashboard(query)
	if err != nil {
		return nil, fmt.Errorf("error on query from dashboard collection by projectid %s", err)
	}

	var newListDashboard []*model.ListDashboardReponse
	err = copier.Copy(&newListDashboard, &dashboards)
	if err != nil {
		return nil, fmt.Errorf("error  %s", err)
	}
	for _, dashboard := range newListDashboard {
		datasource, err := dbOperationsAnalytics.GetDataSourceByID(dashboard.DsID)
		if err != nil {
			return nil, fmt.Errorf("error on querying from datasource collection %s", err)
		}

		dashboard.DsType = &datasource.DsType
		dashboard.DsName = &datasource.DsName

		cluster, err := dbOperationsCluster.GetCluster(dashboard.ClusterID)
		if err != nil {
			return nil, fmt.Errorf("error on querying from cluster collection %s", err)
		}

		dashboard.ClusterName = &cluster.ClusterName

		for _, panelgroup := range dashboard.PanelGroups {
			query := bson.M{"panel_group_id": panelgroup.PanelGroupID, "is_removed": false}
			panels, err := dbOperationsAnalytics.ListPanel(query)
			if err != nil {
				return nil, fmt.Errorf("error on querying from promquery collection %s", err)
			}

			var tempPanels []*model.PanelResponse
			err = copier.Copy(&tempPanels, &panels)
			if err != nil {
				return nil, fmt.Errorf("error  %s", err)
			}
			panelgroup.Panels = tempPanels
		}
	}

	return newListDashboard, nil
}
