package workflow

import (
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/cluster"
	store "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database"
	"log"
	"strconv"
	"time"
)

func UpsterWorkFlowRun(input model.WorkflowRunInput, r store.StateData) (string, error) {
	cluster, err:=cluster.VerifyCluster(*input.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	newWorkflowRun := model.WorkflowRun{
		ClusterName:  cluster.ClusterName,
		ProjectID:    cluster.ProjectID,
		LastUpdated: strconv.FormatInt(time.Now().Unix(),10),
		WorkflowRunID: input.WorkflowRunID,
		WorkflowName: input.WorkflowName,
		ExecutionData: input.ExecutionData,
		WorkflowID: "000000000000",
	}
	SendWorkflowEvent(newWorkflowRun, r)
	err = database.UpsertWorkflowRun(newWorkflowRun)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	return "Workflow Run Accepted", nil
}