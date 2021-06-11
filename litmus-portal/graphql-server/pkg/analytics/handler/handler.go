package handler

import (
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/ops/prometheus"
	dbOperationsAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
	dbSchemaAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

var AnalyticsCache = utils.NewCache()

func CreateDataSource(datasource *model.DSInput) (*model.DSResponse, error) {

	datasourceStatus := prometheus.TSDBHealthCheck(datasource.DsURL, datasource.DsType)

	if datasourceStatus == "Active" {

		newDS := dbSchemaAnalytics.DataSource{
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

func CreateDashboard(dashboard *model.CreateDBInput) (*model.ListDashboardReponse, error) {

	newDashboard := dbSchemaAnalytics.DashBoard{
		DbID:                      uuid.New().String(),
		DbName:                    dashboard.DbName,
		DbTypeID:                  dashboard.DbTypeID,
		DbTypeName:                dashboard.DbTypeName,
		DbInformation:             *dashboard.DbInformation,
		ChaosEventQueryTemplate:   dashboard.ChaosEventQueryTemplate,
		ChaosVerdictQueryTemplate: dashboard.ChaosVerdictQueryTemplate,
		DsID:                      dashboard.DsID,
		EndTime:                   dashboard.EndTime,
		StartTime:                 dashboard.StartTime,
		RefreshRate:               dashboard.RefreshRate,
		ClusterID:                 dashboard.ClusterID,
		ProjectID:                 dashboard.ProjectID,
		IsRemoved:                 false,
		CreatedAt:                 strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:                 strconv.FormatInt(time.Now().Unix(), 10),
	}

	var (
		newPanelGroups            = make([]dbSchemaAnalytics.PanelGroup, len(dashboard.PanelGroups))
		newPanels                 []*dbSchemaAnalytics.Panel
		newApplicationMetadataMap []dbSchemaAnalytics.ApplicationMetadata
	)

	for _, applicationMetadata := range dashboard.ApplicationMetadataMap {
		var newApplications []*dbSchemaAnalytics.Resource
		for _, application := range applicationMetadata.Applications {
			newApplication := dbSchemaAnalytics.Resource{
				Kind:  application.Kind,
				Names: application.Names,
			}
			newApplications = append(newApplications, &newApplication)
		}
		newApplicationMetadata := dbSchemaAnalytics.ApplicationMetadata{
			Namespace:    applicationMetadata.Namespace,
			Applications: newApplications,
		}

		newApplicationMetadataMap = append(newApplicationMetadataMap, newApplicationMetadata)
	}

	newDashboard.ApplicationMetadataMap = newApplicationMetadataMap

	for i, panelGroup := range dashboard.PanelGroups {

		panelGroupID := uuid.New().String()
		newPanelGroups[i].PanelGroupID = panelGroupID
		newPanelGroups[i].PanelGroupName = panelGroup.PanelGroupName

		for _, panel := range panelGroup.Panels {
			var newPromQueries []*dbSchemaAnalytics.PromQuery
			err := copier.Copy(&newPromQueries, &panel.PromQueries)
			if err != nil {
				return nil, err
			}

			var newPanelOptions dbSchemaAnalytics.PanelOption
			err = copier.Copy(&newPanelOptions, &panel.PanelOptions)
			if err != nil {
				return nil, err
			}

			newPanel := dbSchemaAnalytics.Panel{
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
		return nil, fmt.Errorf("error on inserting panel data", err)
	}
	log.Print("sucessfully inserted prom query into promquery-collection")

	newDashboard.PanelGroups = newPanelGroups

	err = dbOperationsAnalytics.InsertDashBoard(newDashboard)
	if err != nil {
		return nil, fmt.Errorf("error on inserting panel data", err)
	}
	log.Print("sucessfully inserted dashboard into dashboard-collection")

	var newDBResponse = model.ListDashboardReponse{}
	_ = copier.Copy(&newDBResponse, &newDashboard)

	cluster, err := dbOperationsCluster.GetCluster(dashboard.ClusterID)
	if err != nil {
		return nil, fmt.Errorf("error on querying from cluster collection: %v\n", err)
	}

	newDBResponse.ClusterName = &cluster.ClusterName

	return &newDBResponse, nil

}

func UpdateDataSource(datasource model.DSInput) (*model.DSResponse, error) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	if datasource.DsID == nil || *datasource.DsID == "" {
		return nil, errors.New("Datasource ID is nil or empty")
	}

	query := bson.D{{"ds_id", datasource.DsID}}

	update := bson.D{{"$set", bson.D{
		{"ds_name", datasource.DsName},
		{"ds_url", datasource.DsURL}, {"access_type", datasource.AccessType},
		{"auth_type", datasource.AuthType}, {"basic_auth_username", datasource.BasicAuthUsername},
		{"basic_auth_password", datasource.BasicAuthPassword}, {"scrape_interval", datasource.ScrapeInterval},
		{"query_timeout", datasource.QueryTimeout}, {"http_method", datasource.HTTPMethod},
		{"updated_at", timestamp},
	}}}

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

func UpdateDashBoard(dashboard *model.UpdateDBInput) (string, error) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	if dashboard.DbID == "" && dashboard.DsID == "" {
		return "Could not find the dashboard or the connected data source.", errors.New("DashBoard ID or Datasource is nil or empty")
	}

	var (
		newPanelGroups                = make([]dbSchemaAnalytics.PanelGroup, len(dashboard.PanelGroups))
		panelsToCreate                []*dbSchemaAnalytics.Panel
		panelsToUpdate                []*dbSchemaAnalytics.Panel
		newApplicationMetadataMap     []dbSchemaAnalytics.ApplicationMetadata
		updatedDashboardPanelIDs      []string
		updatedDashboardPanelGroupIDs []string
	)

	for _, applicationMetadata := range dashboard.ApplicationMetadataMap {
		var newApplications []*dbSchemaAnalytics.Resource
		for _, application := range applicationMetadata.Applications {
			newApplication := dbSchemaAnalytics.Resource{
				Kind:  application.Kind,
				Names: application.Names,
			}
			newApplications = append(newApplications, &newApplication)
		}
		newApplicationMetadata := dbSchemaAnalytics.ApplicationMetadata{
			Namespace:    applicationMetadata.Namespace,
			Applications: newApplications,
		}

		newApplicationMetadataMap = append(newApplicationMetadataMap, newApplicationMetadata)
	}

	for i, panelGroup := range dashboard.PanelGroups {

		var panelGroupID string

		if panelGroup.PanelGroupID == "" {
			panelGroupID = uuid.New().String()
		} else {
			panelGroupID = panelGroup.PanelGroupID
			updatedDashboardPanelGroupIDs = append(updatedDashboardPanelGroupIDs, panelGroup.PanelGroupID)
		}

		newPanelGroups[i].PanelGroupID = panelGroupID
		newPanelGroups[i].PanelGroupName = panelGroup.PanelGroupName

		for _, panel := range panelGroup.Panels {

			var (
				panelID   string
				createdAt string
				updatedAt string
			)

			if *panel.PanelID == "" {
				panelID = uuid.New().String()
				createdAt = strconv.FormatInt(time.Now().Unix(), 10)
				updatedAt = strconv.FormatInt(time.Now().Unix(), 10)
			} else {
				panelID = *panel.PanelID
				createdAt = *panel.CreatedAt
				updatedAt = strconv.FormatInt(time.Now().Unix(), 10)
				updatedDashboardPanelIDs = append(updatedDashboardPanelIDs, *panel.PanelID)
			}

			var newPromQueries []*dbSchemaAnalytics.PromQuery
			err := copier.Copy(&newPromQueries, &panel.PromQueries)
			if err != nil {
				return "Error updating queries", err
			}

			var newPanelOptions dbSchemaAnalytics.PanelOption
			err = copier.Copy(&newPanelOptions, &panel.PanelOptions)
			if err != nil {
				return "Error updating options", err
			}

			newPanel := dbSchemaAnalytics.Panel{
				PanelID:      panelID,
				PanelOptions: &newPanelOptions,
				PanelName:    panel.PanelName,
				PanelGroupID: panelGroupID,
				PromQueries:  newPromQueries,
				IsRemoved:    false,
				XAxisDown:    panel.XAxisDown,
				YAxisLeft:    panel.YAxisLeft,
				YAxisRight:   panel.YAxisRight,
				Unit:         panel.Unit,
				CreatedAt:    createdAt,
				UpdatedAt:    updatedAt,
			}

			if *panel.PanelID == "" {
				panelsToCreate = append(panelsToCreate, &newPanel)
			} else {
				panelsToUpdate = append(panelsToUpdate, &newPanel)
			}
		}
	}

	query := bson.D{
		{"db_id", dashboard.DbID},
		{"is_removed", false},
	}

	existingDashboard, err := dbOperationsAnalytics.GetDashboard(query)
	if err != nil {
		return "Error fetching dashboard details.", fmt.Errorf("error on query from dashboard collection by projectid: %v\n", err)
	}

	for _, panelGroup := range existingDashboard.PanelGroups {
		query := bson.D{
			{"panel_group_id", panelGroup.PanelGroupID},
			{"is_removed", false},
		}
		panels, err := dbOperationsAnalytics.ListPanel(query)
		if err != nil {
			return "Error fetching panels.", fmt.Errorf("error on querying from promquery collection: %v\n", err)
		}

		var tempPanels []*model.PanelResponse
		err = copier.Copy(&tempPanels, &panels)
		if err != nil {
			return "Error fetching panel details.", err
		}

		for _, panel := range tempPanels {

			if !utils.ContainsString(updatedDashboardPanelIDs, panel.PanelID) || !utils.ContainsString(updatedDashboardPanelGroupIDs, panelGroup.PanelGroupID) {

				var promQueriesInPanelToBeDeleted []*dbSchemaAnalytics.PromQuery
				err := copier.Copy(&promQueriesInPanelToBeDeleted, &panel.PromQueries)
				if err != nil {
					return "Error updating queries", err
				}

				var panelOptionsOfPanelToBeDeleted dbSchemaAnalytics.PanelOption
				err = copier.Copy(&panelOptionsOfPanelToBeDeleted, &panel.PanelOptions)
				if err != nil {
					return "Error updating options", err
				}

				panelToBeDeleted := dbSchemaAnalytics.Panel{
					PanelID:      panel.PanelID,
					PanelOptions: &panelOptionsOfPanelToBeDeleted,
					PanelName:    *panel.PanelName,
					PanelGroupID: panelGroup.PanelGroupID,
					PromQueries:  promQueriesInPanelToBeDeleted,
					IsRemoved:    true,
					XAxisDown:    panel.XAxisDown,
					YAxisLeft:    panel.YAxisLeft,
					YAxisRight:   panel.YAxisRight,
					Unit:         panel.Unit,
					CreatedAt:    *panel.CreatedAt,
					UpdatedAt:    strconv.FormatInt(time.Now().Unix(), 10),
				}

				panelsToUpdate = append(panelsToUpdate, &panelToBeDeleted)

			}
		}
	}

	if len(panelsToCreate) > 0 {
		err = dbOperationsAnalytics.InsertPanel(panelsToCreate)
		if err != nil {
			return "Error creating new panels.", fmt.Errorf("error on inserting panel data", err)
		}
		log.Print("sucessfully inserted prom query into promquery-collection")
	}

	if len(panelsToUpdate) > 0 {
		for _, panel := range panelsToUpdate {
			timestamp := strconv.FormatInt(time.Now().Unix(), 10)

			if panel.PanelID == "" && panel.PanelGroupID == "" {
				return "Error getting panel and group details.", errors.New("panel ID or panel group ID is nil or empty")
			}

			var newPanelOption dbSchemaAnalytics.PanelOption
			err := copier.Copy(&newPanelOption, &panel.PanelOptions)
			if err != nil {
				return "Error updating panel option", err
			}

			var newPromQueries []dbSchemaAnalytics.PromQuery
			err = copier.Copy(&newPromQueries, panel.PromQueries)
			if err != nil {
				return "Error updating panel queries", err
			}

			query := bson.D{{"panel_id", panel.PanelID}}

			update := bson.D{{"$set", bson.D{{"panel_name", panel.PanelName}, {"is_removed", panel.IsRemoved},
				{"panel_group_id", panel.PanelGroupID}, {"panel_options", newPanelOption},
				{"prom_queries", newPromQueries}, {"updated_at", timestamp},
				{"y_axis_left", panel.YAxisLeft}, {"y_axis_right", panel.YAxisRight},
				{"x_axis_down", panel.XAxisDown}, {"unit", panel.Unit}}}}

			err = dbOperationsAnalytics.UpdatePanel(query, update)
			if err != nil {
				return "Error updating panel.", err
			}
		}
	}

	update := bson.D{{"$set", bson.D{{"ds_id", dashboard.DsID},
		{"db_name", dashboard.DbName}, {"db_type_id", dashboard.DbTypeID},
		{"db_type_name", dashboard.DbTypeName}, {"db_information", dashboard.DbInformation},
		{"chaos_event_query_template", dashboard.ChaosEventQueryTemplate}, {"chaos_verdict_query_template", dashboard.ChaosEventQueryTemplate},
		{"cluster_id", dashboard.ClusterID}, {"application_metadata_map", newApplicationMetadataMap},
		{"end_time", dashboard.EndTime}, {"start_time", dashboard.StartTime},
		{"refresh_rate", dashboard.RefreshRate}, {"panel_groups", newPanelGroups}, {"updated_at", timestamp}}}}

	err = dbOperationsAnalytics.UpdateDashboard(query, update)
	if err != nil {
		return "Error updating dashboard.", err
	}

	return "successfully updated", nil
}

func UpdatePanel(panels []*model.Panel) (string, error) {

	for _, panel := range panels {
		timestamp := strconv.FormatInt(time.Now().Unix(), 10)

		if *panel.PanelID == "" && *panel.PanelGroupID == "" {
			return "", errors.New("DashBoard ID or Datasource is nil or empty")
		}

		var newPanelOption dbSchemaAnalytics.PanelOption
		copier.Copy(&newPanelOption, &panel.PanelOptions)

		var newPromQueries []dbSchemaAnalytics.PromQuery
		copier.Copy(&newPromQueries, panel.PromQueries)

		query := bson.D{{"panel_id", panel.PanelID}}

		update := bson.D{{"$set", bson.D{{"panel_name", panel.PanelName},
			{"panel_group_id", panel.PanelGroupID}, {"panel_options", newPanelOption},
			{"prom_queries", newPromQueries}, {"updated_at", timestamp},
			{"y_axis_left", panel.YAxisLeft}, {"y_axis_right", panel.YAxisRight},
			{"x_axis_down", panel.XAxisDown}, {"unit", panel.Unit}}}}

		err := dbOperationsAnalytics.UpdatePanel(query, update)
		if err != nil {
			return "", err
		}
	}

	return "successfully updated", nil
}

func DeleteDashboard(db_id *string) (bool, error) {

	dashboardQuery := bson.D{
		{"db_id", db_id},
		{"is_removed", false},
	}
	dashboard, err := dbOperationsAnalytics.GetDashboard(dashboardQuery)
	if err != nil {
		return false, fmt.Errorf("failed to list dashboard, error: %v", err)
	}

	for _, panelGroup := range dashboard.PanelGroups {
		listPanelQuery := bson.D{
			{"panel_group_id", panelGroup.PanelGroupID},
			{"is_removed", false},
		}
		panels, err := dbOperationsAnalytics.ListPanel(listPanelQuery)
		if err != nil {
			return false, fmt.Errorf("failed to list Panel, error: %v", err)
		}

		for _, panel := range panels {
			time := strconv.FormatInt(time.Now().Unix(), 10)

			query := bson.D{
				{"panel_id", panel.PanelID},
				{"is_removed", false},
			}
			update := bson.D{{"$set", bson.D{
				{"is_removed", true},
				{"updated_at", time},
			}}}

			err := dbOperationsAnalytics.UpdatePanel(query, update)
			if err != nil {
				return false, fmt.Errorf("failed to delete panel, error: %v", err)
			}
		}
	}

	time := strconv.FormatInt(time.Now().Unix(), 10)

	query := bson.D{{"db_id", db_id}}
	update := bson.D{{"$set", bson.D{
		{"is_removed", true},
		{"updated_at", time},
	}}}

	err = dbOperationsAnalytics.UpdateDashboard(query, update)
	if err != nil {
		return false, fmt.Errorf("failed to delete dashboard, error: %v", err)
	}

	return true, nil
}

func DeleteDataSource(input model.DeleteDSInput) (bool, error) {

	time := strconv.FormatInt(time.Now().Unix(), 10)

	listDBQuery := bson.D{
		{"ds_id", input.DsID},
		{"is_removed", false},
	}
	dashboards, err := dbOperationsAnalytics.ListDashboard(listDBQuery)
	if err != nil {
		return false, fmt.Errorf("failed to list dashboard, error: %v", err)
	}

	if input.ForceDelete == true {
		for _, dashboard := range dashboards {

			for _, panelGroup := range dashboard.PanelGroups {
				listPanelQuery := bson.D{
					{"panel_group_id", panelGroup.PanelGroupID},
					{"is_removed", false},
				}
				panels, err := dbOperationsAnalytics.ListPanel(listPanelQuery)
				if err != nil {
					return false, fmt.Errorf("failed to list Panel, error: %v", err)
				}

				for _, panel := range panels {
					query := bson.D{
						{"panel_id", panel.PanelID},
						{"is_removed", false},
					}
					update := bson.D{{"$set", bson.D{
						{"is_removed", true},
						{"updated_at", time},
					}}}

					err := dbOperationsAnalytics.UpdatePanel(query, update)
					if err != nil {
						return false, fmt.Errorf("failed to delete panel, error: %v", err)
					}
				}
			}
			updateDBQuery := bson.D{{"db_id", dashboard.DbID}}
			update := bson.D{{"$set", bson.D{
				{"is_removed", true},
				{"updated_at", time},
			}}}

			err = dbOperationsAnalytics.UpdateDashboard(updateDBQuery, update)
			if err != nil {
				return false, fmt.Errorf("failed to delete dashboard, error: %v", err)
			}
		}

	} else if len(dashboards) > 0 {
		var dbNames []string
		for _, dashboard := range dashboards {
			dbNames = append(dbNames, dashboard.DbName)
		}

		return false, fmt.Errorf("failed to delete datasource, dashboard(s) are attached to the datasource: %v", dbNames)
	}

	updateDSQuery := bson.D{{"ds_id", input.DsID}}
	update := bson.D{{"$set", bson.D{
		{"is_removed", true},
		{"updated_at", time},
	}}}

	err = dbOperationsAnalytics.UpdateDataSource(updateDSQuery, update)
	if err != nil {
		return false, fmt.Errorf("failed to delete datasource, error: %v", err)
	}

	return true, nil
}

func QueryListDataSource(projectID string) ([]*model.DSResponse, error) {
	query := bson.D{
		{"project_id", projectID},
		{"is_removed", false},
	}

	datasource, err := dbOperationsAnalytics.ListDataSource(query)
	if err != nil {
		return nil, err
	}

	var newDatasources []*model.DSResponse
	copier.Copy(&newDatasources, &datasource)

	for _, datasource := range newDatasources {
		datasource.HealthStatus = prometheus.TSDBHealthCheck(*datasource.DsURL, *datasource.DsType)
	}

	return newDatasources, nil
}

func GetPromQuery(promInput *model.PromInput) (*model.PromResponse, error) {
	var (
		metrics     []*model.MetricsPromResponse
		annotations []*model.AnnotationsPromResponse
	)

	var wg sync.WaitGroup
	wg.Add(len(promInput.Queries))
	for _, v := range promInput.Queries {
		go func(val *model.PromQueryInput) {
			defer wg.Done()

			newPromQuery := analytics.PromQuery{
				Queryid:    val.Queryid,
				Query:      val.Query,
				Legend:     val.Legend,
				Resolution: val.Resolution,
				Minstep:    val.Minstep,
				DSdetails:  (*analytics.PromDSDetails)(promInput.DsDetails),
			}

			cacheKey := val.Query + "-" + promInput.DsDetails.Start + "-" + promInput.DsDetails.End + "-" + promInput.DsDetails.URL

			queryType := "metrics"
			if strings.Contains(val.Queryid, "chaos-interval") || strings.Contains(val.Queryid, "chaos-verdict") {
				queryType = "annotation"
			}

			if obj, isExist := AnalyticsCache.Get(cacheKey); isExist {
				if queryType == "metrics" {
					metrics = append(metrics, obj.(*model.MetricsPromResponse))
				} else {
					annotations = append(annotations, obj.(*model.AnnotationsPromResponse))
				}
			} else {
				response, err := prometheus.Query(newPromQuery, queryType)

				if err != nil {
					return
				}

				cacheError := utils.AddCache(AnalyticsCache, cacheKey, response)
				if cacheError != nil {
					log.Printf("Adding cache: %v\n", cacheError)
				}

				if queryType == "metrics" {
					metrics = append(metrics, response.(*model.MetricsPromResponse))
				} else {
					annotations = append(annotations, response.(*model.AnnotationsPromResponse))
				}
			}
		}(v)
	}

	wg.Wait()

	newPromResponse := model.PromResponse{
		MetricsResponse:     metrics,
		AnnotationsResponse: annotations,
	}

	return &newPromResponse, nil
}

func GetLabelNamesAndValues(promSeriesInput *model.PromSeriesInput) (*model.PromSeriesResponse, error) {
	var newPromSeriesResponse *model.PromSeriesResponse
	newPromSeriesInput := analytics.PromSeries{
		Series:    promSeriesInput.Series,
		DSdetails: (*analytics.PromDSDetails)(promSeriesInput.DsDetails),
	}
	cacheKey := promSeriesInput.Series + " - " + promSeriesInput.DsDetails.URL

	if obj, isExist := AnalyticsCache.Get(cacheKey); isExist {
		newPromSeriesResponse = obj.(*model.PromSeriesResponse)
	} else {
		response, err := prometheus.LabelNamesAndValues(newPromSeriesInput)
		if err != nil {
			return nil, err
		}

		cacheError := utils.AddCache(AnalyticsCache, cacheKey, response)
		if cacheError != nil {
			log.Printf("Adding cache: %v\n", cacheError)
		}

		newPromSeriesResponse = response
	}

	return newPromSeriesResponse, nil
}

func GetSeriesList(promSeriesListInput *model.DsDetails) (*model.PromSeriesListResponse, error) {
	var newPromSeriesListResponse *model.PromSeriesListResponse
	newPromSeriesListInput := analytics.PromDSDetails{
		URL:   promSeriesListInput.URL,
		Start: promSeriesListInput.Start,
		End:   promSeriesListInput.End,
	}
	cacheKey := "series list - " + promSeriesListInput.URL

	if obj, isExist := AnalyticsCache.Get(cacheKey); isExist {
		newPromSeriesListResponse = obj.(*model.PromSeriesListResponse)
	} else {
		response, err := prometheus.SeriesList(newPromSeriesListInput)
		if err != nil {
			return nil, err
		}

		cacheError := utils.AddCache(AnalyticsCache, cacheKey, response)
		if cacheError != nil {
			log.Printf("Adding cache: %v\n", cacheError)
		}

		newPromSeriesListResponse = response
	}

	return newPromSeriesListResponse, nil
}

func QueryListDashboard(projectID string) ([]*model.ListDashboardReponse, error) {
	query := bson.D{
		{"project_id", projectID},
		{"is_removed", false},
	}

	dashboards, err := dbOperationsAnalytics.ListDashboard(query)
	if err != nil {
		return nil, fmt.Errorf("error on query from dashboard collection by projectid: %v\n", err)
	}

	var newListDashboard []*model.ListDashboardReponse
	err = copier.Copy(&newListDashboard, &dashboards)
	if err != nil {
		return nil, err
	}

	for _, dashboard := range newListDashboard {
		datasource, err := dbOperationsAnalytics.GetDataSourceByID(dashboard.DsID)
		if err != nil {
			return nil, fmt.Errorf("error on querying from datasource collection: %v\n", err)
		}

		dashboard.DsType = &datasource.DsType
		dashboard.DsName = &datasource.DsName

		cluster, err := dbOperationsCluster.GetCluster(dashboard.ClusterID)
		if err != nil {
			return nil, fmt.Errorf("error on querying from cluster collection: %v\n", err)
		}

		dashboard.ClusterName = &cluster.ClusterName

		for _, panelGroup := range dashboard.PanelGroups {
			query := bson.D{
				{"panel_group_id", panelGroup.PanelGroupID},
				{"is_removed", false},
			}
			panels, err := dbOperationsAnalytics.ListPanel(query)
			if err != nil {
				return nil, fmt.Errorf("error on querying from promquery collection: %v\n", err)
			}

			var tempPanels []*model.PanelResponse
			err = copier.Copy(&tempPanels, &panels)
			if err != nil {
				return nil, err
			}

			panelGroup.Panels = tempPanels
		}
	}

	return newListDashboard, nil
}
