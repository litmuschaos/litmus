package handler

import (
	"errors"
	"fmt"
	"log"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/analytics/ops/prometheus"
	dbOperationsAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
	dbSchemaAnalytics "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/analytics"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
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

func CreateDashboard(dashboard *model.CreateDBInput) (string, error) {

	newDashboard := dbSchemaAnalytics.DashBoard{
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
		newPanelGroups = make([]dbSchemaAnalytics.PanelGroup, len(dashboard.PanelGroups))
		newPanels      []*dbSchemaAnalytics.Panel
	)

	for i, panel_group := range dashboard.PanelGroups {

		panelGroupID := uuid.New().String()
		newPanelGroups[i].PanelGroupID = panelGroupID
		newPanelGroups[i].PanelGroupName = panel_group.PanelGroupName

		for _, panel := range panel_group.Panels {
			var newPromQueries []*dbSchemaAnalytics.PromQuery
			copier.Copy(&newPromQueries, &panel.PromQueries)

			var newPanelOptions dbSchemaAnalytics.PanelOption
			copier.Copy(&newPanelOptions, &panel.PanelOptions)

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
		return "", fmt.Errorf("error on inserting panel data", err)
	}
	log.Print("sucessfully inserted prom query into promquery-collection")

	newDashboard.PanelGroups = newPanelGroups

	err = dbOperationsAnalytics.InsertDashBoard(newDashboard)
	if err != nil {
		return "", fmt.Errorf("error on inserting panel data", err)
	}
	log.Print("sucessfully inserted dashboard into dashboard-collection")

	return "sucessfully created", nil
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

func UpdateDashBoard(dashboard *model.UpdataDBInput) (string, error) {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	if dashboard.DbID == "" && dashboard.DsID == "" {
		return "", errors.New("DashBoard ID or Datasource is nil or empty")
	}

	query := bson.D{{"db_id", dashboard.DbID}}

	update := bson.D{{"$set", bson.D{{"ds_id", dashboard.DsID}, {"db_name", dashboard.DbName},
		{"db_type", dashboard.DbType}, {"end_time", dashboard.EndTime},
		{"start_time", dashboard.StartTime}, {"refresh_rate", dashboard.RefreshRate},
		{"panel_groups", dashboard.PanelGroups}, {"updated_at", timestamp}}}}

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
	cacheKey := promSeriesInput.Series + "-" + promSeriesInput.DsDetails.Start + "-" + promSeriesInput.DsDetails.End + "-" + promSeriesInput.DsDetails.URL

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
	cacheKey := promSeriesListInput.Start + "-" + promSeriesListInput.End + "-" + promSeriesListInput.URL

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

// firstDayOfISOWeek returns first day of the given ISO week
func firstDayOfISOWeek(year int, week int, timezone *time.Location) time.Time {
    date := time.Date(year, 0, 0, 0, 0, 0, 0, timezone)
    isoYear, isoWeek := date.ISOWeek()
    for date.Weekday() != time.Monday { // iterate back to Monday
        date = date.AddDate(0, 0, -1)
        isoYear, isoWeek = date.ISOWeek()
    }
    for isoYear < year { // iterate forward to the first day of the first week
        date = date.AddDate(0, 0, 1)
        isoYear, isoWeek = date.ISOWeek()
    }
    for isoWeek < week { // iterate forward to the first day of the given week
        date = date.AddDate(0, 0, 1)
        isoYear, isoWeek = date.ISOWeek()
    }
    return date
}

// GetScheduledWorkflowStats returns schedules data for analytics graph
func GetScheduledWorkflowStats(projectID string, filter model.Filter, showWorkflowRuns bool) ([]*model.WorkflowStats, error) {
	var query bson.D
	startTime:= strconv.FormatInt(time.Now().Unix(), 10)

	// Map to store schedule count monthly(last 6months) and weekly(last 4weeks)
	m := make(map[int]model.WorkflowStats)

	// Map to store schedule count hourly (last 48hrs)
	dateMap := make(map[int]map[int]model.WorkflowStats)
	
	// Switch case to initialize the query according to filter type
	switch filter{
	case "Monthly":
		// Subtracting 6 months from the start time
		sixMonthsAgo:= time.Now().AddDate(0,-6, 0)
		// To fetch data only for last 6 months
		query = bson.D{
			{"project_id", projectID},
			{"created_at", bson.D{
				{"$gte",  strconv.FormatInt(sixMonthsAgo.Unix(), 10)},
				{"$lte", startTime},
			}},
		}
	case "Weekly":
		// Subtracting 28days(4weeks) from the start time
		fourWeeksAgo:= time.Now().AddDate(0, 0, -28)
		// To fetch data only for last 4weeks
		query = bson.D{
			{"project_id", projectID},
			{"created_at", bson.D{
				{"$gte", strconv.FormatInt(fourWeeksAgo.Unix(), 10)},
				{"$lte", startTime},
			}},
		}
	case "Hourly":
		// Subtracting 48hrs from the start time
		fortyEightHoursAgo:= time.Now().Add(time.Hour * -48)
		// To fetch data only for last 48hrs
		query = bson.D{
			{"project_id", projectID},
			{"created_at", bson.D{
				{"$gte", strconv.FormatInt(fortyEightHoursAgo.Unix(), 10)},
				{"$lte", startTime},
			}},
		}
	default:
		// Returns error if no matching filter found
		return nil, errors.New("no matching filter found")
	}

	// Query to fetch required data
	chaosWorkflows, err := dbOperationsWorkflow.GetWorkflows(query)
	if err != nil {
		return nil, err
	}

	// Iterate through the chaosWorkflows and find the frequency of schedules according to filter
	for _, workflow := range chaosWorkflows {
		//converts the time stamp(string) to unix
		i, err := strconv.ParseInt(workflow.CreatedAt, 10, 64)
		if err != nil {
			panic(err)
		}
		
		// Converts unix time to time.Time
		createdAtInTime := time.Unix(i, 0)
		var t model.WorkflowStats
		var key int
		
		// Switch case to fill the map according to filter
		switch filter{
		case "Monthly":
			t = m[int(createdAtInTime.Month())]
			key=int(createdAtInTime.Month()) 
			// Incrementing the value for each month
			t.Value+=1 
			// Storing the timestamp of first day of the month
			t.Date=float64(time.Date(createdAtInTime.Year(), createdAtInTime.Month(), 1, 0, 0, 0, 0, time.Local).Unix())*1000
			m[key]=t //updating the map
		case "Weekly":
			_, week := createdAtInTime.ISOWeek()
			t= m[week]
			key=week
			// Incrementing the value for each ISO week
			t.Value+=1
			// Storing the timestamp of first day of the ISO week
			t.Date=float64(firstDayOfISOWeek(createdAtInTime.Year(),week,time.Local).Unix())*1000
			m[key]=t //updating the map
		case "Hourly":
			// Initializing the inner(nested) map
			if dateMap[createdAtInTime.Day()] == nil {
			dateMap[createdAtInTime.Day()] = make(map[int]model.WorkflowStats)
			}
			day:=dateMap[createdAtInTime.Day()]
			hr:=day[createdAtInTime.Hour()]
			// Incrementing the value for each each hour
			hr.Value+=1
			// Storing the timestamp of the starting of an hr
			hr.Date=float64(time.Date(createdAtInTime.Year(), createdAtInTime.Month(), createdAtInTime.Day(), createdAtInTime.Hour(), 0, 0, 0, time.Local).Unix())*1000
			day[createdAtInTime.Hour()]=hr
			dateMap[createdAtInTime.Day()]=day //updating the dateMap
		default:
		return nil, errors.New("no matching filter found")
		}
	}

	// Result array
	result := make([]*model.WorkflowStats,0)
	// To fill the result array from dateMap for hourly data
	if filter == "Hourly" {
		for k := range dateMap { 
			for _,value := range dateMap[k]{
				val:= model.WorkflowStats{Date: value.Date, Value: value.Value}
				result=append(result,&val)
			}
		}
		// Sorts the result array in ascending order of time
		sort.SliceStable(result, func(i, j int) bool { return result[i].Date < result[j].Date })

		// Prepends array with empty values in-case the array doesn't contain 48 data points
		for i:=0; i<48-len(result);i+=1{
		// Subtracts 1 hr on every iteration
		x:= time.Unix(int64(result[0].Date)/1000, 0).Add(time.Hour * -1)
		val:= []*model.WorkflowStats{{float64(x.Unix())*1000,0}}
		result=append(val,result...)
		}
	return result,nil
	}

	// To fill the result array from dateMap for monthly and weekly data
	for _, v := range m { 
		val:= model.WorkflowStats{Date: v.Date, Value: v.Value}
		result=append(result,&val )
	}
	// Sorts the result array in ascending order of time
	sort.SliceStable(result, func(i, j int) bool { return result[i].Date < result[j].Date })
	len:=len(result)

	switch filter{
	case "Monthly":
		// Prepends array with empty values in-case the array doesn't contain 6 data points
		for i:=0; i<6-len;i+=1{
		// Enter zero values for non existing points
		x:= time.Unix(int64(result[0].Date)/1000, 0).AddDate(0,-1, 0)
		val:= []*model.WorkflowStats{{float64(x.Unix())*1000,0}}
		result=append(val,result...)
		}
	case "Weekly":
		// Prepends array with empty values in-case the array doesn't contain 4 data points
		for i:=0; i<4-len;i+=1{
		// Enter zero values for non existing points
		x:= time.Unix(int64(result[0].Date)/1000, 0).AddDate(0,0, -7)
		val:= []*model.WorkflowStats{{float64(x.Unix())*1000,0}}
		result=append(val,result...)
		}
	}

return result,nil
}