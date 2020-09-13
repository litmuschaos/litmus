package queries

import (
	"encoding/json"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
)

//GetWorkflowRuns sends all the workflow runs for a project from the DB
func QueryWorkflowRuns(project_id string) ([]*model.WorkflowRun, error) {
	workflows, err := database.GetWorkflowsByProjectID(project_id)
	if err != nil {
		return nil, err
	}
	result := []*model.WorkflowRun{}

	for _, workflow := range workflows {
		cluster, err := database.GetCluster(workflow.ClusterID)
		if err != nil {
			return nil, err
		}
		for _, wfrun := range workflow.WorkflowRuns {
			newWorkflowRun := model.WorkflowRun{
				WorkflowName:  workflow.WorkflowName,
				WorkflowID:    workflow.WorkflowID,
				WorkflowRunID: wfrun.WorkflowRunID,
				LastUpdated:   wfrun.LastUpdated,
				ProjectID:     workflow.ProjectID,
				ClusterID:     workflow.ClusterID,
				ExecutionData: wfrun.ExecutionData,
				ClusterName:   cluster.ClusterName,
				ClusterType:   cluster.ClusterType,
			}
			result = append(result, &newWorkflowRun)
		}
	}
	return result, nil
}

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
			RequestType:  &reqType,
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
