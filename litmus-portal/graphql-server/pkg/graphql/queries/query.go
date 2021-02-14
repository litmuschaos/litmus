package queries

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/jinzhu/copier"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/tsdb/prometheus"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
)

//GetLogs query is used to fetch the logs from the cluster
func GetLogs(reqID string, pod model.PodLogRequest, r store.StateData) {
	data, err := json.Marshal(pod)
	if err != nil {
		log.Print("ERROR WHILE MARSHALLING POD DETAILS")
	}
	reqType := "logs"
	externalData := string(data)
	payload := model.ClusterAction{
		ProjectID: reqID,
		Action: &model.ActionPayload{
			RequestType:  reqType,
			ExternalData: &externalData,
		},
	}
	if clusterChan, ok := r.ConnectedCluster[pod.ClusterID]; ok {
		clusterChan <- &payload
	} else if reqChan, ok := r.WorkflowLog[reqID]; ok {
		resp := model.PodLogResponse{
			PodName:       pod.PodName,
			WorkflowRunID: pod.WorkflowRunID,
			PodType:       pod.PodType,
			Log:           "CLUSTER ERROR : CLUSTER NOT CONNECTED",
		}
		reqChan <- &resp
		close(reqChan)
	}
}

func QueryGetClusters(projectID string, clusterType *string) ([]*model.Cluster, error) {
	clusters, err := database.GetClusterWithProjectID(projectID, clusterType)
	if err != nil {
		return nil, err
	}
	newClusters := []*model.Cluster{}

	for _, cluster := range clusters {
		var totalNoOfSchedules int

		workflows, err := database.GetWorkflowsByClusterID(cluster.ClusterID)
		if err != nil {
			return nil, err
		}
		newCluster := model.Cluster{}
		copier.Copy(&newCluster, &cluster)
		newCluster.NoOfWorkflows = func(i int) *int { return &i }(len(workflows))
		for _, workflow := range workflows {
			totalNoOfSchedules = totalNoOfSchedules + len(workflow.WorkflowRuns)
		}

		newCluster.NoOfSchedules = func(i int) *int { return &i }(totalNoOfSchedules)

		newClusters = append(newClusters, &newCluster)
	}

	return newClusters, nil
}

func QueryListDataSource(projectID string) ([]*model.DSResponse, error) {
	query := bson.M{"project_id": projectID, "is_removed": false}

	datasource, err := database.ListDataSource(query)
	if err != nil {
		return nil, err
	}

	var newDatasources []*model.DSResponse
	copier.Copy(&newDatasources, &datasource)

	for _, datasource := range newDatasources {
		datasource.HealthStatus = utils.TSDBHealthCheck(*datasource.DsURL, *datasource.DsType)
	}

	return newDatasources, nil
}

func GetPromQuery(promInput *model.PromInput) ([]*model.PromResponse, error) {
	var newPromResponse []*model.PromResponse
	for _, v := range promInput.Queries {
		newPromQuery := graphql.PromQuery{
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

	dashboards, err := database.ListDashboard(query)
	if err != nil {
		return nil, fmt.Errorf("error on query from dashboard collection by projectid", err)
	}

	var newListDashboard []*model.ListDashboardReponse
	copier.Copy(&newListDashboard, &dashboards)

	for _, dashboard := range newListDashboard {
		datasource, err := database.GetDataSourceByID(dashboard.DsID)
		if err != nil {
			return nil, fmt.Errorf("error on querying from datasource collection", err)
		}

		dashboard.DsType = &datasource.DsType
		dashboard.DsName = &datasource.DsName

		cluster, err := database.GetCluster(dashboard.ClusterID)
		if err != nil {
			return nil, fmt.Errorf("error on querying from cluster collection", err)
		}

		dashboard.ClusterName = &cluster.ClusterName

		for _, panelgroup := range dashboard.PanelGroups {
			query := bson.M{"panel_group_id": panelgroup.PanelGroupID, "is_removed": false}
			panels, err := database.ListPanel(query)
			if err != nil {
				return nil, fmt.Errorf("error on querying from promquery collection", err)
			}

			var tempPanels []*model.PanelResponse
			copier.Copy(&tempPanels, &panels)

			panelgroup.Panels = tempPanels
		}
	}

	return newListDashboard, nil
}
