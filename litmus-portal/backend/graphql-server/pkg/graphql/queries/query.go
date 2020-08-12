package queries

import (
	"encoding/json"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
	database "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	"log"
)

//GetWorkflowRuns sends all the workflow runs for a project from the DB
func QueryWorkflowRuns(pid string) ([]*model.WorkflowRun, error) {
	wfRuns, err := database.GetWorkflowRuns(pid)
	if err != nil {
		return nil, err
	}
	result := []*model.WorkflowRun{}
	for i := 0; i < len(wfRuns); i++ {
		wfRun := model.WorkflowRun(wfRuns[i])
		result = append(result, &wfRun)
	}
	return result, nil
}

//GetLogs query is used to fetch the logs from the cluster
func GetLogs(reqID string, pod model.PodLogRequest, r store.StateData) {
	data, err := json.Marshal(pod)
	if err != nil {
		log.Print("ERROR WHILE MARSHALLING POD DETAILS")
	}
	payload := model.ClusterAction{
		ProjectID: reqID,
		Action:    string(data),
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
