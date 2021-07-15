package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/ops/prometheus"
	dbOperationsAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
	dbSchemaAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbSchemaWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

const (
	defaultPath = "/tmp/version/"
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

func CreateDashboard(dashboard *model.CreateDBInput) (*model.ListDashboardResponse, error) {

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

	var newDBResponse = model.ListDashboardResponse{}
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
		return nil, errors.New("data source ID is nil or empty")
	}

	datasourceStatus := prometheus.TSDBHealthCheck(datasource.DsURL, datasource.DsType)

	if datasourceStatus == "Active" {

		query := bson.D{{"ds_id", datasource.DsID}}

		update := bson.D{{"$set", bson.D{
			{"ds_name", datasource.DsName}, {"ds_type", datasource.DsType},
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

	} else {
		return nil, errors.New("data source is inactive")
	}
}

// UpdateDashBoard function updates the dashboard based on it's ID
func UpdateDashBoard(dashboard model.UpdateDBInput, chaosQueryUpdate bool) (string, error) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	if dashboard.DbID == "" {
		return "could not find the dashboard", errors.New("dashBoard ID is nil or empty")
	}

	query := bson.D{
		{"db_id", dashboard.DbID},
		{"is_removed", false},
	}

	var update bson.D

	if !chaosQueryUpdate {
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
					return "error updating queries", err
				}

				var newPanelOptions dbSchemaAnalytics.PanelOption
				err = copier.Copy(&newPanelOptions, &panel.PanelOptions)
				if err != nil {
					return "error updating options", err
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

		existingDashboard, err := dbOperationsAnalytics.GetDashboard(query)
		if err != nil {
			return "error fetching dashboard details", fmt.Errorf("error on query from dashboard collection by projectid: %v", err)
		}

		for _, panelGroup := range existingDashboard.PanelGroups {
			query := bson.D{
				{"panel_group_id", panelGroup.PanelGroupID},
				{"is_removed", false},
			}
			panels, err := dbOperationsAnalytics.ListPanel(query)
			if err != nil {
				return "error fetching panels", fmt.Errorf("error on querying from promquery collection: %v", err)
			}

			var tempPanels []*model.PanelResponse
			err = copier.Copy(&tempPanels, &panels)
			if err != nil {
				return "error fetching panel details", err
			}

			for _, panel := range tempPanels {

				if !utils.ContainsString(updatedDashboardPanelIDs, panel.PanelID) || !utils.ContainsString(updatedDashboardPanelGroupIDs, panelGroup.PanelGroupID) {

					var promQueriesInPanelToBeDeleted []*dbSchemaAnalytics.PromQuery
					err := copier.Copy(&promQueriesInPanelToBeDeleted, &panel.PromQueries)
					if err != nil {
						return "error updating queries", err
					}

					var panelOptionsOfPanelToBeDeleted dbSchemaAnalytics.PanelOption
					err = copier.Copy(&panelOptionsOfPanelToBeDeleted, &panel.PanelOptions)
					if err != nil {
						return "error updating options", err
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
				return "error creating new panels", fmt.Errorf("error while inserting panel data", err)
			}
			log.Print("successfully inserted prom query into promquery-collection")
		}

		if len(panelsToUpdate) > 0 {
			for _, panel := range panelsToUpdate {
				timestamp := strconv.FormatInt(time.Now().Unix(), 10)

				if panel.PanelID == "" && panel.PanelGroupID == "" {
					return "error getting panel and group details", errors.New("panel ID or panel group ID is nil or empty")
				}

				var newPanelOption dbSchemaAnalytics.PanelOption
				err := copier.Copy(&newPanelOption, &panel.PanelOptions)
				if err != nil {
					return "error updating panel option", err
				}

				var newPromQueries []dbSchemaAnalytics.PromQuery
				err = copier.Copy(&newPromQueries, panel.PromQueries)
				if err != nil {
					return "error updating panel queries", err
				}

				query := bson.D{{"panel_id", panel.PanelID}}

				update := bson.D{{"$set", bson.D{{"panel_name", panel.PanelName}, {"is_removed", panel.IsRemoved},
					{"panel_group_id", panel.PanelGroupID}, {"panel_options", newPanelOption},
					{"prom_queries", newPromQueries}, {"updated_at", timestamp},
					{"y_axis_left", panel.YAxisLeft}, {"y_axis_right", panel.YAxisRight},
					{"x_axis_down", panel.XAxisDown}, {"unit", panel.Unit}}}}

				err = dbOperationsAnalytics.UpdatePanel(query, update)
				if err != nil {
					return "error updating panel", err
				}
			}
		}

		update = bson.D{{"$set", bson.D{{"ds_id", dashboard.DsID}, {"db_name", dashboard.DbName},
			{"db_type_id", dashboard.DbTypeID}, {"db_type_name", dashboard.DbTypeName},
			{"db_information", dashboard.DbInformation}, {"cluster_id", dashboard.ClusterID},
			{"application_metadata_map", newApplicationMetadataMap}, {"end_time", dashboard.EndTime},
			{"start_time", dashboard.StartTime}, {"refresh_rate", dashboard.RefreshRate},
			{"panel_groups", newPanelGroups}, {"updated_at", timestamp}}}}
	} else {
		update = bson.D{{"$set", bson.D{
			{"chaos_event_query_template", dashboard.ChaosEventQueryTemplate}, {"chaos_verdict_query_template", dashboard.ChaosVerdictQueryTemplate},
			{"updated_at", timestamp}}}}
	}

	err := dbOperationsAnalytics.UpdateDashboard(query, update)
	if err != nil {
		return "error updating dashboard", err
	}

	return "successfully updated", nil
}

func UpdatePanel(panels []*model.Panel) (string, error) {

	for _, panel := range panels {
		timestamp := strconv.FormatInt(time.Now().Unix(), 10)

		if *panel.PanelID == "" && *panel.PanelGroupID == "" {
			return "error getting panel or group", errors.New("panel ID or panel group ID is nil or empty")
		}

		var newPanelOption dbSchemaAnalytics.PanelOption
		err := copier.Copy(&newPanelOption, &panel.PanelOptions)
		if err != nil {
			return "error while parsing panel", err
		}

		var newPromQueries []dbSchemaAnalytics.PromQuery
		err = copier.Copy(&newPromQueries, panel.PromQueries)
		if err != nil {
			return "error while updating queries", err
		}

		query := bson.D{{"panel_id", panel.PanelID}}

		update := bson.D{{"$set", bson.D{{"panel_name", panel.PanelName},
			{"panel_group_id", panel.PanelGroupID}, {"panel_options", newPanelOption},
			{"prom_queries", newPromQueries}, {"updated_at", timestamp},
			{"y_axis_left", panel.YAxisLeft}, {"y_axis_right", panel.YAxisRight},
			{"x_axis_down", panel.XAxisDown}, {"unit", panel.Unit}}}}

		err = dbOperationsAnalytics.UpdatePanel(query, update)
		if err != nil {
			return "error while updating panel", err
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

		var errorString = "failed to delete datasource, dashboard(s) are attached to the datasource: ["
		for index, dashboard := range dashboards {
			if index < len(dashboards)-1 {
				errorString += dashboard.DbName + ","
			} else {
				errorString += dashboard.DbName + "]"
			}
		}

		return false, errors.New(errorString)
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

	var (
		newDataSources []*model.DSResponse
		wg             sync.WaitGroup
	)
	err = copier.Copy(&newDataSources, &datasource)
	if err != nil {
		return nil, err
	}

	tsdbHealthCheckMap := make(map[string]string)

	var mutex = &sync.Mutex{}
	wg.Add(len(newDataSources))

	for _, datasource := range newDataSources {
		datasource := datasource
		go func(val *model.DSResponse) {
			defer wg.Done()

			if _, ok := tsdbHealthCheckMap[*datasource.DsURL]; !ok {
				mutex.Lock()
				tsdbHealthCheckMap[*datasource.DsURL] = prometheus.TSDBHealthCheck(*datasource.DsURL, *datasource.DsType)
				mutex.Unlock()
			}
		}(datasource)
	}

	wg.Wait()

	for _, datasource := range newDataSources {
		datasource.HealthStatus = tsdbHealthCheckMap[*datasource.DsURL]
	}

	return newDataSources, nil
}

// GetPromQuery takes prometheus queries and returns response for annotations and metrics with a query map
func GetPromQuery(promInput *model.PromInput) (*model.PromResponse, map[string]*model.MetricsPromResponse, error) {
	var (
		metrics         []*model.MetricsPromResponse
		annotations     []*model.AnnotationsPromResponse
		wg              sync.WaitGroup
		verdictResponse *model.AnnotationsPromResponse
	)

	patchEventWithVerdict := false
	queryResponseMap := make(map[string]*model.MetricsPromResponse)
	var mutex = &sync.Mutex{}

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
			if strings.Contains(val.Queryid, "chaos-event") || strings.Contains(val.Queryid, "chaos-verdict") {
				queryType = "annotation"
				cacheKey = val.Queryid + "-" + promInput.DsDetails.Start + "-" + promInput.DsDetails.End + "-" + promInput.DsDetails.URL
			}

			if obj, isExist := AnalyticsCache.Get(cacheKey); isExist {
				if queryType == "metrics" {
					metrics = append(metrics, obj.(*model.MetricsPromResponse))
					mutex.Lock()
					queryResponseMap[val.Queryid] = obj.(*model.MetricsPromResponse)
					mutex.Unlock()
				} else {
					if strings.Contains(val.Queryid, "chaos-event") {
						annotations = append(annotations, obj.(*model.AnnotationsPromResponse))
					}
				}
			} else {
				response, err := prometheus.Query(newPromQuery, queryType)
				if err != nil {
					return
				}
				if queryType == "metrics" {
					metrics = append(metrics, response.(*model.MetricsPromResponse))
					mutex.Lock()
					queryResponseMap[val.Queryid] = response.(*model.MetricsPromResponse)
					mutex.Unlock()
					cacheError := utils.AddCache(AnalyticsCache, cacheKey, response)
					if cacheError != nil {
						errorStr := fmt.Sprintf("%v", cacheError)
						if strings.Contains(errorStr, "already exists") {
							cacheError = utils.UpdateCache(AnalyticsCache, cacheKey, response)
							if cacheError != nil {
								log.Printf("Error while caching: %v\n", cacheError)
							}
						}
					}
				} else {
					if strings.Contains(val.Queryid, "chaos-event") {
						annotations = append(annotations, response.(*model.AnnotationsPromResponse))
						cacheError := utils.AddCache(AnalyticsCache, cacheKey, response)
						if cacheError != nil {
							errorStr := fmt.Sprintf("%v", cacheError)
							if strings.Contains(errorStr, "already exists") {
								cacheError = utils.UpdateCache(AnalyticsCache, cacheKey, response)
								if cacheError != nil {
									log.Printf("Error while caching: %v\n", cacheError)
								}
							}
						}
					} else if strings.Contains(val.Queryid, "chaos-verdict") {
						patchEventWithVerdict = true
						verdictResponse = response.(*model.AnnotationsPromResponse)
					}
				}
			}
		}(v)
	}

	wg.Wait()

	if patchEventWithVerdict == true {
		annotations = ops.PatchChaosEventWithVerdict(annotations, verdictResponse, promInput, AnalyticsCache)
	}

	newPromResponse := model.PromResponse{
		MetricsResponse:     metrics,
		AnnotationsResponse: annotations,
	}

	return &newPromResponse, queryResponseMap, nil
}

// DashboardViewer takes a dashboard view id, prometheus queries, dashboard query map and data variables to query prometheus and send data periodically to the subscribed client
func DashboardViewer(viewID string, dashboardID *string, promQueries []*model.PromQueryInput, dashboardQueryMap []*model.QueryMapForPanelGroup, dataVariables model.DataVars, r store.StateData) {
	if viewChan, ok := r.DashboardData[viewID]; ok {

		currentTime := time.Now().Unix()
		startTime := strconv.FormatInt(currentTime-int64(dataVariables.RelativeTime), 10)
		endTime := strconv.FormatInt(currentTime, 10)
		relativeCheck := dataVariables.RelativeTime != 0

		var queryType string

		if dataVariables.Start != "" && dataVariables.End != "" {
			queryType = "fixed"
		} else if relativeCheck && dataVariables.RefreshInterval != 0 {
			queryType = "relative"
		} else if relativeCheck && dataVariables.RefreshInterval == 0 {
			queryType = "relatively-fixed"
		} else {
			queryType = "invalid"
		}

		switch queryType {

		case "fixed":
			dsDetails := &model.DsDetails{
				URL:   dataVariables.URL,
				Start: dataVariables.Start,
				End:   dataVariables.End,
			}

			newPromInput := &model.PromInput{
				Queries:   promQueries,
				DsDetails: dsDetails,
			}

			newPromResponse, queryResponseMap, err := GetPromQuery(newPromInput)
			if err != nil {
				log.Printf("Error during data source query of the dashboard view: %v\n", viewID)
			} else {
				dashboardResponse := ops.MapMetricsToDashboard(dashboardQueryMap, newPromResponse, queryResponseMap)
				viewChan <- dashboardResponse
			}

		case "relative":
			for {
				dsDetails := &model.DsDetails{
					URL:   dataVariables.URL,
					Start: startTime,
					End:   endTime,
				}

				newPromInput := &model.PromInput{
					Queries:   promQueries,
					DsDetails: dsDetails,
				}

				newPromResponse, queryResponseMap, err := GetPromQuery(newPromInput)
				if err != nil {
					log.Printf("Error during data source query of the dashboard view: %v at: %v \n", viewID, currentTime)
					break
				} else {
					dashboardResponse := ops.MapMetricsToDashboard(dashboardQueryMap, newPromResponse, queryResponseMap)
					viewChan <- dashboardResponse
					time.Sleep(time.Duration(int64(dataVariables.RefreshInterval)) * time.Second)
					currentTime = time.Now().Unix()
					startTime = strconv.FormatInt(currentTime-int64(dataVariables.RelativeTime), 10)
					endTime = strconv.FormatInt(currentTime, 10)
				}

				if _, ok := r.DashboardData[viewID]; !ok {
					break
				}
			}

		case "relatively-fixed":
			dsDetails := &model.DsDetails{
				URL:   dataVariables.URL,
				Start: startTime,
				End:   endTime,
			}

			newPromInput := &model.PromInput{
				Queries:   promQueries,
				DsDetails: dsDetails,
			}

			newPromResponse, queryResponseMap, err := GetPromQuery(newPromInput)
			if err != nil {
				log.Printf("Error during data source query of the dashboard view: %v at: %v \n", viewID, currentTime)
			} else {
				dashboardResponse := ops.MapMetricsToDashboard(dashboardQueryMap, newPromResponse, queryResponseMap)
				viewChan <- dashboardResponse
			}

		case "invalid":
			log.Printf("Wrong parameters for the dashboard view: %v\n", viewID)
		}

		ops.UpdateViewedAt(dashboardID, viewID)

		close(viewChan)
		r.Mutex.Lock()
		delete(r.DashboardData, viewID)
		r.Mutex.Unlock()
	}
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
			errorStr := fmt.Sprintf("%v", cacheError)
			if strings.Contains(errorStr, "already exists") {
				cacheError = utils.UpdateCache(AnalyticsCache, cacheKey, response)
				if cacheError != nil {
					log.Printf("Error while caching: %v\n", cacheError)
				}
			}
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
			errorStr := fmt.Sprintf("%v", cacheError)
			if strings.Contains(errorStr, "already exists") {
				cacheError = utils.UpdateCache(AnalyticsCache, cacheKey, response)
				if cacheError != nil {
					log.Printf("Error while caching: %v\n", cacheError)
				}
			}
		}

		newPromSeriesListResponse = response
	}

	return newPromSeriesListResponse, nil
}

// QueryListDashboard lists all the dashboards present in a project using the projectID
func QueryListDashboard(projectID string, clusterID *string, dbID *string) ([]*model.ListDashboardResponse, error) {

	var (
		query bson.D
		wg    sync.WaitGroup
	)

	if clusterID == nil || *clusterID == "" {
		if dbID != nil && *dbID != "" {
			query = bson.D{
				{"project_id", projectID},
				{"db_id", dbID},
				{"is_removed", false},
			}
		} else {
			query = bson.D{
				{"project_id", projectID},
				{"is_removed", false},
			}
		}
	} else {
		query = bson.D{
			{"project_id", projectID},
			{"cluster_id", clusterID},
			{"is_removed", false},
		}
	}

	dashboards, err := dbOperationsAnalytics.ListDashboard(query)
	if err != nil {
		return nil, fmt.Errorf("error on query from dashboard collection by projectid: %v\n", err)
	}

	var newListDashboard []*model.ListDashboardResponse
	err = copier.Copy(&newListDashboard, &dashboards)
	if err != nil {
		return nil, err
	}

	dataSourceMap := make(map[string]*dbSchemaAnalytics.DataSource)
	dataSourceHealthCheckMap := make(map[string]string)

	if clusterID != nil && *clusterID != "" {
		var mutex = &sync.Mutex{}
		wg.Add(len(newListDashboard))

		for _, dashboard := range newListDashboard {
			if _, ok := dataSourceMap[dashboard.DsID]; !ok {
				datasource, err := dbOperationsAnalytics.GetDataSourceByID(dashboard.DsID)
				if err != nil {
					return nil, fmt.Errorf("error on querying from datasource collection: %v\n", err)
				}
				dataSourceMap[dashboard.DsID] = datasource
				go func(val *dbSchemaAnalytics.DataSource) {
					defer wg.Done()

					if _, ok := dataSourceHealthCheckMap[val.DsID]; !ok {
						dataSourceStatus := prometheus.TSDBHealthCheck(datasource.DsURL, datasource.DsType)
						mutex.Lock()
						dataSourceHealthCheckMap[val.DsID] = dataSourceStatus
						mutex.Unlock()
					} else {
						return
					}
				}(datasource)
			} else {
				wg.Done()
			}
		}

		wg.Wait()
	}

	for _, dashboard := range newListDashboard {

		var datasource *dbSchemaAnalytics.DataSource

		if clusterID != nil && *clusterID != "" {
			if dataSourceInfo, ok := dataSourceMap[dashboard.DsID]; ok {
				datasource = dataSourceInfo
			} else {
				return nil, fmt.Errorf("error on querying from datasource collection")
			}
			if dataSourceHealthStatus, ok := dataSourceHealthCheckMap[dashboard.DsID]; ok {
				dashboard.DsHealthStatus = &dataSourceHealthStatus
			} else {
				return nil, fmt.Errorf("error while checking data source health status")
			}
		} else {
			if dataSourceInfo, ok := dataSourceMap[dashboard.DsID]; !ok {
				datasource, err = dbOperationsAnalytics.GetDataSourceByID(dashboard.DsID)
				if err != nil {
					return nil, fmt.Errorf("error on querying from datasource collection: %v\n", err)
				}
				dataSourceMap[dashboard.DsID] = datasource
			} else {
				datasource = dataSourceInfo
			}
		}

		dashboard.DsURL = &datasource.DsURL
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

// GetWorkflowStats returns schedules data for analytics graph
func GetWorkflowStats(projectID string, filter model.TimeFrequency, showWorkflowRuns bool) ([]*model.WorkflowStats, error) {
	var pipeline mongo.Pipeline
	dbKey := "created_at"
	now := time.Now()
	startTime := strconv.FormatInt(now.Unix(), 10)

	// Match with projectID
	matchProjectIdStage := bson.D{
		{"$match", bson.D{
			{"project_id", projectID},
		}},
	}
	pipeline = append(pipeline, matchProjectIdStage)

	// Filtering out the workflows that are deleted/removed
	matchWfIsRemovedStage := bson.D{
		{"$match", bson.D{
			{"isRemoved", bson.D{
				{"$eq", false},
			}},
		}},
	}
	pipeline = append(pipeline, matchWfIsRemovedStage)

	// Unwind the workflow runs if workflow run stats are requested
	if showWorkflowRuns {
		includeAllFromWorkflow := bson.D{
			{"workflow_id", 1},
			{"workflow_name", 1},
			{"workflow_manifest", 1},
			{"cronSyntax", 1},
			{"workflow_description", 1},
			{"weightages", 1},
			{"isCustomWorkflow", 1},
			{"updated_at", 1},
			{"created_at", 1},
			{"project_id", 1},
			{"cluster_id", 1},
			{"cluster_name", 1},
			{"cluster_type", 1},
			{"isRemoved", 1},
		}

		// Filter the available workflows where isRemoved is false
		matchWfRunIsRemovedStage := bson.D{
			{"$project", append(includeAllFromWorkflow,
				bson.E{Key: "workflow_runs", Value: bson.D{
					{"$filter", bson.D{
						{"input", "$workflow_runs"},
						{"as", "wfRun"},
						{"cond", bson.D{
							{"$eq", bson.A{"$$wfRun.isRemoved", false}},
						}},
					}},
				}},
			)},
		}
		pipeline = append(pipeline, matchWfRunIsRemovedStage)

		// Flatten out the workflow runs
		unwindStage := bson.D{
			{"$unwind", bson.D{
				{"path", "$workflow_runs"},
			}},
		}
		pipeline = append(pipeline, unwindStage)
		dbKey = "workflow_runs.last_updated"
	}

	// Query the database according to filter type
	switch filter {
	case model.TimeFrequencyMonthly:
		// Subtracting 6 months from the start time
		sixMonthsAgo := now.AddDate(0, -6, 0)
		// To fetch data only for last 6 months
		filterMonthlyStage := bson.D{
			{"$match", bson.D{
				{dbKey, bson.D{
					{"$gte", strconv.FormatInt(sixMonthsAgo.Unix(), 10)},
					{"$lte", startTime},
				}},
			}},
		}
		pipeline = append(pipeline, filterMonthlyStage)
	case model.TimeFrequencyDaily:
		// Subtracting 28days(4weeks) from the start time
		fourWeeksAgo := now.AddDate(0, 0, -28)
		// To fetch data only for last 4weeks
		filterWeeklyStage := bson.D{
			{"$match", bson.D{
				{dbKey, bson.D{
					{"$gte", strconv.FormatInt(fourWeeksAgo.Unix(), 10)},
					{"$lte", startTime},
				}},
			}},
		}
		pipeline = append(pipeline, filterWeeklyStage)
	case model.TimeFrequencyHourly:
		// Subtracting 48hrs from the start time
		fortyEightHoursAgo := now.Add(time.Hour * -48)
		// To fetch data only for last 48hrs
		filterHourlyStage := bson.D{
			{"$match", bson.D{
				{dbKey, bson.D{
					{"$gte", strconv.FormatInt(fortyEightHoursAgo.Unix(), 10)},
					{"$lte", startTime},
				}},
			}},
		}
		pipeline = append(pipeline, filterHourlyStage)
	default:
		// Returns error if no matching filter found
		return nil, errors.New("no matching filter found")
	}

	// Call aggregation on pipeline
	workflowsCursor, err := dbOperationsWorkflow.GetAggregateWorkflows(pipeline)
	if err != nil {
		return nil, err
	}

	// Result array
	var result []*model.WorkflowStats

	// Map to store schedule count monthly(last 6months), weekly(last 4weeks) and hourly (last 48hrs)
	statsMap := make(map[string]model.WorkflowStats)

	// Initialize the value of the map based on filter
	switch filter {
	case model.TimeFrequencyMonthly:
		for monthsAgo := now.AddDate(0, -5, 0); monthsAgo.Before(now) || monthsAgo.Equal(now); monthsAgo = monthsAgo.AddDate(0, 1, 0) {
			// Storing the timestamp of first day of the month
			date := float64(time.Date(monthsAgo.Year(), monthsAgo.Month(), 1, 0, 0, 0, 0, time.Local).Unix())
			statsMap[string(int(monthsAgo.Month())%12)] = model.WorkflowStats{
				Date:  date * 1000,
				Value: 0,
			}
		}
	case model.TimeFrequencyDaily:
		for daysAgo := now.AddDate(0, 0, -28); daysAgo.Before(now) || daysAgo.Equal(now); daysAgo = daysAgo.AddDate(0, 0, 1) {
			// Storing the timestamp of first hour of the day
			date := float64(time.Date(daysAgo.Year(), daysAgo.Month(), daysAgo.Day(), 0, 0, 0, 0, time.Local).Unix())
			statsMap[fmt.Sprintf("%d-%d", daysAgo.Month(), daysAgo.Day())] = model.WorkflowStats{
				Date:  date * 1000,
				Value: 0,
			}
		}
	case model.TimeFrequencyHourly:
		for hoursAgo := now.Add(time.Hour * -48); hoursAgo.Before(now) || hoursAgo.Equal(now); hoursAgo = hoursAgo.Add(time.Hour * 1) {
			// Storing the timestamp of first minute of the hour
			date := float64(time.Date(hoursAgo.Year(), hoursAgo.Month(), hoursAgo.Day(), hoursAgo.Hour(), 0, 0, 0, time.Local).Unix())
			statsMap[fmt.Sprintf("%d-%d", hoursAgo.Day(), hoursAgo.Hour())] = model.WorkflowStats{
				Date:  date * 1000,
				Value: 0,
			}
		}
	}

	if showWorkflowRuns {
		var workflows []dbSchemaWorkflow.FlattenedWorkflowRun
		if err = workflowsCursor.All(context.Background(), &workflows); err != nil || len(workflows) == 0 {
			return result, nil
		}

		// Iterate through the workflows and find the frequency of workflow runs according to filter
		for _, workflow := range workflows {
			if err = ops.CreateDateMap(workflow.WorkflowRuns.LastUpdated, filter, statsMap); err != nil {
				return result, err
			}
		}
	} else {
		var workflows []dbSchemaWorkflow.ChaosWorkFlowInput
		if err = workflowsCursor.All(context.Background(), &workflows); err != nil || len(workflows) == 0 {
			return result, nil
		}

		// Iterate through the workflows and find the frequency of workflows according to filter
		for _, workflow := range workflows {
			if err = ops.CreateDateMap(workflow.UpdatedAt, filter, statsMap); err != nil {
				return result, err
			}
		}
	}

	// To fill the result array from statsMap for monthly and weekly data
	for _, val := range statsMap {
		result = append(result, &model.WorkflowStats{Date: val.Date, Value: val.Value})
	}

	// Sorts the result array in ascending order of time
	sort.SliceStable(result, func(i, j int) bool { return result[i].Date < result[j].Date })

	return result, nil
}

func GetWorkflowRunStats(workflowRunStatsRequest model.WorkflowRunStatsRequest) (*model.WorkflowRunStatsResponse, error) {
	var pipeline mongo.Pipeline

	// Match with projectID
	matchProjectIdStage := bson.D{
		{"$match", bson.D{
			{"project_id", workflowRunStatsRequest.ProjectID},
		}},
	}
	pipeline = append(pipeline, matchProjectIdStage)

	// Match the workflowIds from the input array
	if len(workflowRunStatsRequest.WorkflowIds) != 0 {
		matchWfIdStage := bson.D{
			{"$match", bson.D{
				{"workflow_id", bson.D{
					{"$in", workflowRunStatsRequest.WorkflowIds},
				}},
			}},
		}

		pipeline = append(pipeline, matchWfIdStage)
	}

	// Filtering out the workflows that are deleted/removed
	matchWfIsRemovedStage := bson.D{
		{"$match", bson.D{
			{"isRemoved", bson.D{
				{"$eq", false},
			}},
		}},
	}
	pipeline = append(pipeline, matchWfIsRemovedStage)

	includeAllFromWorkflow := bson.D{
		{"workflow_id", 1},
		{"workflow_name", 1},
		{"workflow_manifest", 1},
		{"cronSyntax", 1},
		{"workflow_description", 1},
		{"weightages", 1},
		{"isCustomWorkflow", 1},
		{"updated_at", 1},
		{"created_at", 1},
		{"project_id", 1},
		{"cluster_id", 1},
		{"cluster_name", 1},
		{"cluster_type", 1},
		{"isRemoved", 1},
	}

	// Filter the available workflows where isRemoved is false
	matchWfRunIsRemovedStage := bson.D{
		{"$project", append(includeAllFromWorkflow,
			bson.E{Key: "workflow_runs", Value: bson.D{
				{"$filter", bson.D{
					{"input", "$workflow_runs"},
					{"as", "wfRun"},
					{"cond", bson.D{
						{"$eq", bson.A{"$$wfRun.isRemoved", false}},
					}},
				}},
			}},
		)},
	}
	pipeline = append(pipeline, matchWfRunIsRemovedStage)

	// Flatten out the workflow runs
	unwindStage := bson.D{
		{"$unwind", bson.D{
			{"path", "$workflow_runs"},
		}},
	}
	pipeline = append(pipeline, unwindStage)

	// Count all workflowRuns
	totalWorkflowRuns := bson.A{
		bson.D{{"$count", "count"}},
	}

	// Count Succeeded workflowRuns
	succeededWorkflowRuns := bson.A{
		bson.D{{"$match", bson.D{
			{"workflow_runs.phase", model.WorkflowRunStatusSucceeded},
		}},
		},
		bson.D{{"$count", "count"}},
	}

	// Count Failed workflowRuns
	failedWorkflowRuns := bson.A{
		bson.D{{"$match", bson.D{
			{"workflow_runs.phase", model.WorkflowRunStatusFailed},
		}},
		},
		bson.D{{"$count", "count"}},
	}

	// Count Running workflowRuns
	runningWorkflowRuns := bson.A{
		bson.D{{"$match", bson.D{
			{"workflow_runs.phase", model.WorkflowRunStatusRunning},
		}}},
		bson.D{{"$count", "count"}},
	}

	// Calculate average resiliency score
	averageResiliencyScore := bson.A{
		// Filter out running workflows
		bson.D{{"$match", bson.D{
			{"workflow_runs.phase", bson.D{
				{"$ne", model.WorkflowRunStatusRunning},
			}},
		}}},

		// Calculate average
		bson.D{{"$group", bson.D{
			{"_id", nil},
			{"avg", bson.D{
				{"$avg", "$workflow_runs.resiliency_score"},
			}},
		}}},
	}

	// Calculate passed percentage
	experimentStats := bson.A{
		// Filter out running workflows
		bson.D{{"$match", bson.D{
			{"workflow_runs.phase", bson.D{
				{"$ne", model.WorkflowRunStatusRunning},
			}},
		}}},

		// Calculate average
		bson.D{{"$group", bson.D{
			{"_id", nil},
			{"experiments_passed", bson.D{
				{"$sum", "$workflow_runs.experiments_passed"},
			}},
			{"experiments_failed", bson.D{
				{"$sum", "$workflow_runs.experiments_failed"},
			}},
			{"experiments_awaited", bson.D{
				{"$sum", "$workflow_runs.experiments_awaited"},
			}},
			{"experiments_stopped", bson.D{
				{"$sum", "$workflow_runs.experiments_stopped"},
			}},
			{"experiments_na", bson.D{
				{"$sum", "$workflow_runs.experiments_na"},
			}},
			{"total_experiments", bson.D{
				{"$sum", "$workflow_runs.total_experiments"},
			}},
		}}},
	}

	// Calculate all the stats
	facetStage := bson.D{
		{"$facet", bson.D{
			{"total_workflow_runs", totalWorkflowRuns},
			{"succeeded_workflow_runs", succeededWorkflowRuns},
			{"failed_workflow_runs", failedWorkflowRuns},
			{"running_workflow_runs", runningWorkflowRuns},
			{"average_resiliency_score", averageResiliencyScore},
			{"experiment_stats", experimentStats},
		}},
	}
	pipeline = append(pipeline, facetStage)

	// Call aggregation on pipeline
	workflowsRunStatsCursor, err := dbOperationsWorkflow.GetAggregateWorkflows(pipeline)
	if err != nil {
		return nil, err
	}

	var workflowsRunStats []dbSchemaAnalytics.WorkflowRunStats

	if err = workflowsRunStatsCursor.All(context.Background(), &workflowsRunStats); err != nil || len(workflowsRunStats) == 0 {
		return &model.WorkflowRunStatsResponse{}, nil
	}

	var result model.WorkflowRunStatsResponse

	if len(workflowsRunStats) > 0 {
		if len(workflowsRunStats[0].TotalWorkflowRuns) > 0 {
			result.TotalWorkflowRuns = workflowsRunStats[0].TotalWorkflowRuns[0].Count

			if len(workflowsRunStats[0].SucceededWorkflowRuns) > 0 {
				result.SucceededWorkflowRuns = workflowsRunStats[0].SucceededWorkflowRuns[0].Count
			}
			if len(workflowsRunStats[0].FailedWorkflowRuns) > 0 {
				result.FailedWorkflowRuns = workflowsRunStats[0].FailedWorkflowRuns[0].Count
			}
			if len(workflowsRunStats[0].RunningWorkflowRuns) > 0 {
				result.RunningWorkflowRuns = workflowsRunStats[0].RunningWorkflowRuns[0].Count
			}

			result.WorkflowRunSucceededPercentage = utils.Truncate((float64(result.SucceededWorkflowRuns) / float64(result.TotalWorkflowRuns)) * 100)
			result.WorkflowRunFailedPercentage = utils.Truncate((float64(result.FailedWorkflowRuns) / float64(result.TotalWorkflowRuns)) * 100)
		}
		if len(workflowsRunStats[0].AverageResiliencyScore) > 0 {
			result.AverageResiliencyScore = utils.Truncate(workflowsRunStats[0].AverageResiliencyScore[0].Avg)
		}
		if len(workflowsRunStats[0].ExperimentStats) > 0 {
			experimentStats := workflowsRunStats[0].ExperimentStats[0]
			result.TotalExperiments = experimentStats.TotalExperiments
			result.ExperimentsPassed = experimentStats.ExperimentsPassed
			result.ExperimentsFailed = experimentStats.ExperimentsFailed
			result.ExperimentsAwaited = experimentStats.ExperimentsAwaited
			result.ExperimentsStopped = experimentStats.ExperimentsStopped
			result.ExperimentsNa = experimentStats.ExperimentsNA
			result.PassedPercentage = utils.Truncate((float64(experimentStats.ExperimentsPassed) / float64(experimentStats.TotalExperiments)) * 100)
			result.FailedPercentage = utils.Truncate((float64(experimentStats.ExperimentsFailed) / float64(experimentStats.TotalExperiments)) * 100)
		}
	}

	return &result, nil
}

// GetHeatMapData returns the data for calendar heatmap
func GetHeatMapData(workflow_id string, project_id string, year int) ([]*model.HeatmapData, error) {

	// Start and end timestamp of the given year
	start := time.Date(year, time.January, 1, 0, 00, 00, 0, time.Local)
	startTimeStamp := time.Date(year, time.January, 1, 0, 00, 00, 0, time.Local).Unix()
	endTimeStamp := time.Date(year, time.December, 31, 23, 59, 59, 1e9-1, time.Local).Unix()
	startDay := (int)(time.Unix(startTimeStamp, 0).Weekday())
	endDay := (int)(time.Unix(endTimeStamp, 0).Weekday())

	var noOfDays int

	// To determine if the year is leap year or not
	if time.Unix(endTimeStamp, 0).YearDay() == 366 {
		noOfDays = 366
	} else {
		noOfDays = 365
	}

	// Declaring and initializing array for storing workflow runs in a year
	wfRunsInYear := make([]model.WorkflowRunsData, 0, noOfDays)
	for i := 0; i < noOfDays; i += 1 {
		var y model.WorkflowRunsData
		var x model.WorkflowRunDetails
		x.DateStamp = float64(start.AddDate(0, 0, i).Unix())
		x.NoOfRuns = 0
		y.WorkflowRunDetail = &x
		wfRunsInYear = append(wfRunsInYear, y)
	}

	var pipeline mongo.Pipeline

	// Match with projectID
	matchProjectIDStage := bson.D{
		{"$match", bson.D{
			{"project_id", project_id},
		}},
	}
	// Match with workflow id
	matchWfIDStage := bson.D{
		{"$match", bson.D{
			{"workflow_id", workflow_id},
		}},
	}

	pipeline = append(pipeline, matchProjectIDStage, matchWfIDStage)
	includeAllFromWorkflow := bson.D{
		{"workflow_id", 1},
		{"workflow_name", 1},
		{"workflow_manifest", 1},
		{"cronSyntax", 1},
		{"workflow_description", 1},
		{"weightages", 1},
		{"isCustomWorkflow", 1},
		{"updated_at", 1},
		{"created_at", 1},
		{"project_id", 1},
		{"cluster_id", 1},
		{"cluster_name", 1},
		{"cluster_type", 1},
		{"isRemoved", 1},
	}
	// Filter the workflow runs that have run in the given year
	filterWfRunDateStage := bson.D{
		{"$project", append(includeAllFromWorkflow,
			bson.E{Key: "workflow_runs", Value: bson.D{
				{"$filter", bson.D{
					{"input", "$workflow_runs"},
					{"as", "wfRun"},
					{"cond", bson.D{
						{"$and", bson.A{
							bson.D{{"$ne", bson.A{"$$wfRun.phase", "Running"}}},
							bson.D{{"$lte", bson.A{"$$wfRun.last_updated", strconv.FormatInt(endTimeStamp, 10)}}},
							bson.D{{"$gte", bson.A{"$$wfRun.last_updated", strconv.FormatInt(startTimeStamp, 10)}}},
						}},
					}},
				}},
			}},
		)},
	}
	pipeline = append(pipeline, filterWfRunDateStage)

	// Call aggregation on pipeline
	workflowsCursor, err := dbOperationsWorkflow.GetAggregateWorkflows(pipeline)
	var chaosWorkflowRuns []dbSchemaWorkflow.ChaosWorkFlowInput

	// Result array
	result := make([]*model.HeatmapData, 0, noOfDays)
	if err = workflowsCursor.All(context.Background(), &chaosWorkflowRuns); err != nil {
		fmt.Println(err)
		return result, nil
	}

	// WorkflowRuns stores the workflow runs retrieved from database
	var WorkflowRuns []*dbSchemaWorkflow.ChaosWorkflowRun
	for _, workflow := range chaosWorkflowRuns {
		copier.Copy(&WorkflowRuns, &workflow.WorkflowRuns)
	}

	// Iterates through WorkflowRuns to group the data for each day
	for _, workflowRun := range WorkflowRuns {
		i, err := strconv.ParseInt(workflowRun.LastUpdated, 10, 64)
		if err != nil {
			fmt.Println("error", err)
		}
		lastUpdated := time.Unix(i, 0)
		date := float64(lastUpdated.Unix())
		if wfRunsInYear[lastUpdated.YearDay()-1].Value == nil {
			x := 0.0
			wfRunsInYear[lastUpdated.YearDay()-1].Value = &x
		}

		// To calculate avg resiliency score and number of runs for each day
		avgRSTemp := (*wfRunsInYear[lastUpdated.YearDay()-1].Value) * (float64(wfRunsInYear[lastUpdated.YearDay()-1].WorkflowRunDetail.NoOfRuns))
		wfRunsInYear[lastUpdated.YearDay()-1].WorkflowRunDetail.NoOfRuns += 1
		wfRunsInYear[lastUpdated.YearDay()-1].WorkflowRunDetail.DateStamp = date
		*wfRunsInYear[lastUpdated.YearDay()-1].Value = (avgRSTemp + *workflowRun.ResiliencyScore) / (float64(wfRunsInYear[lastUpdated.YearDay()-1].WorkflowRunDetail.NoOfRuns))
	}

	// Appending and prepending -1 for the week days that are not in the given year
	for i := startDay; i > 0; i -= 1 {
		x := -1.0
		wfRunsInYear = append([]model.WorkflowRunsData{{Value: &x, WorkflowRunDetail: nil}}, wfRunsInYear...)
	}
	for i := endDay; i < 6; i += 1 {
		y := -1.0
		wfRunsInYear = append(wfRunsInYear, model.WorkflowRunsData{Value: &y, WorkflowRunDetail: nil})
	}

	day := 0
	week := 1

	// Bucketing the daywise data into weeks and appending it to resulting array
	for i := 0; i < 53; i += 1 {
		var x []*model.WorkflowRunsData
		for j := 0; j < 7; j += 1 {
			x = append(x, &wfRunsInYear[day])
			day += 1
		}
		var temp model.HeatmapData
		temp.Bins = x
		result = append(result, &temp)
		week += 1
	}
	return result, nil
}

// GetPortalDashboardData gets the portal dashboard data from the ChaosHub
func GetPortalDashboardData(projectID string, hubname string) ([]*model.PortalDashboardData, error) {
	DashboardDirectoryPath := defaultPath + projectID + "/" + hubname + "/monitoring/dashboards/litmus-portal"
	var PortalDashboards []*model.PortalDashboardData
	var PortalDashboardData analytics.PortalDashboard
	files, err := ioutil.ReadDir(DashboardDirectoryPath)
	if err != nil {
		return PortalDashboards, err
	}
	for _, file := range files {
		dashboardData, err := ioutil.ReadFile(DashboardDirectoryPath + "/" + file.Name())
		if err != nil {
			dashboardData = []byte("")
		}
		err = json.Unmarshal(dashboardData, &PortalDashboardData)
		if err != nil {
			return nil, err
		}
		dashboard, _ := json.Marshal(PortalDashboardData)
		data := &model.PortalDashboardData{
			Name:          file.Name(),
			DashboardData: string(dashboard),
		}
		PortalDashboards = append(PortalDashboards, data)
	}
	return PortalDashboards, nil
}
