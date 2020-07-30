package workflow

import (
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
)

//GetWorkflowRuns sends all the workflow runs for a project from the DB
func QueryWorkflowRuns(pid string) ([]*model.WorkflowRun, error){
	wfRuns,err:= database.GetWorkflowRuns(pid)
	if err!=nil{
		return nil,err
	}
	result := []*model.WorkflowRun{}
	for i:=0;i<len(wfRuns);i++{
		result = append(result, &wfRuns[i])
	}
	return result,nil
}