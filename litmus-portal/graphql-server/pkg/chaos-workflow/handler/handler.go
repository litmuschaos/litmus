package handler

import (
	"context"
	"errors"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/ops"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	gitops_handler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
	"go.mongodb.org/mongo-driver/bson"
)

func CreateChaosWorkflow(ctx context.Context, input *model.ChaosWorkFlowInput, r *store.StateData) (*model.ChaosWorkFlowResponse, error) {
	input, err := ops.ProcessWorkflow(input)
	if err != nil {
		log.Print("Error processing workflow: ", err)
		return nil, err
	}

	// Gitops Update
	err = gitops_handler.UpsertWorkflowToGit(ctx, input)
	if err != nil {
		log.Print("Error performing git push: ", err)
		return nil, err
	}

	err = ops.ProcessWorkflowCreation(input, r)
	if err != nil {
		log.Print("Error executing workflow: ", err)
		return nil, err
	}

	return &model.ChaosWorkFlowResponse{
		WorkflowID:          *input.WorkflowID,
		CronSyntax:          input.CronSyntax,
		WorkflowName:        input.WorkflowName,
		WorkflowDescription: input.WorkflowDescription,
		IsCustomWorkflow:    input.IsCustomWorkflow,
	}, nil
}

func DeleteWorkflow(ctx context.Context, workflow_id string, r *store.StateData) (bool, error) {
	query := bson.D{{Key: "workflow_id", Value: workflow_id}}
	workflows, err := database.GetWorkflows(query)
	if len(workflows) == 0 {
		return false, errors.New("no such workflow found")
	}

	wf := model.ChaosWorkFlowInput{
		ProjectID:    workflows[0].ProjectID,
		WorkflowID:   &workflows[0].WorkflowID,
		WorkflowName: workflows[0].WorkflowName,
	}

	//gitops delete
	err = gitops_handler.DeleteWorkflowFromGit(ctx, &wf)
	if err != nil {
		log.Print("Error performing git push: ", err)
		return false, err
	}

	err = ops.ProcessWorkflowDelete(query, r)
	if err != nil {
		return false, err
	}

	return true, nil
}

func UpdateWorkflow(ctx context.Context, input *model.ChaosWorkFlowInput, r *store.StateData) (*model.ChaosWorkFlowResponse, error) {
	input, err := ops.ProcessWorkflow(input)
	if err != nil {
		log.Print("Error processing workflow update: ", err)
		return nil, err
	}

	// Gitops Update
	err = gitops_handler.UpsertWorkflowToGit(ctx, input)
	if err != nil {
		log.Print("Error performing git push: ", err)
		return nil, err
	}

	err = ops.ProcessWorkflowUpdate(input, r)
	if err != nil {
		log.Print("Error executing workflow update: ", err)
		return nil, err
	}

	return &model.ChaosWorkFlowResponse{
		WorkflowID:          *input.WorkflowID,
		CronSyntax:          input.CronSyntax,
		WorkflowName:        input.WorkflowName,
		WorkflowDescription: input.WorkflowDescription,
		IsCustomWorkflow:    input.IsCustomWorkflow,
	}, nil
}

//GetWorkflowRuns sends all the workflow runs for a project from the DB
func QueryWorkflowRuns(project_id string) ([]*model.WorkflowRun, error) {
	workflows, err := database.GetWorkflows(bson.D{{"project_id", project_id}})
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
				ClusterType:   &cluster.ClusterType,
			}
			result = append(result, &newWorkflowRun)
		}
	}
	return result, nil
}

func QueryWorkflows(project_id string) ([]*model.ScheduledWorkflows, error) {
	chaosWorkflows, err := database.GetWorkflows(bson.D{{"project_id", project_id}})
	if err != nil {
		return nil, err
	}

	result := []*model.ScheduledWorkflows{}
	for _, workflow := range chaosWorkflows {
		cluster, err := database.GetCluster(workflow.ClusterID)
		if err != nil {
			return nil, err
		}
		if workflow.IsRemoved == false {
			var Weightages []*model.Weightages
			copier.Copy(&Weightages, &workflow.Weightages)

			newChaosWorkflows := model.ScheduledWorkflows{
				WorkflowID:          workflow.WorkflowID,
				WorkflowManifest:    workflow.WorkflowManifest,
				WorkflowName:        workflow.WorkflowName,
				CronSyntax:          workflow.CronSyntax,
				WorkflowDescription: workflow.WorkflowDescription,
				Weightages:          Weightages,
				IsCustomWorkflow:    workflow.IsCustomWorkflow,
				UpdatedAt:           workflow.UpdatedAt,
				CreatedAt:           workflow.CreatedAt,
				ProjectID:           workflow.ProjectID,
				IsRemoved:           workflow.IsRemoved,
				ClusterName:         cluster.ClusterName,
				ClusterID:           cluster.ClusterID,
				ClusterType:         cluster.ClusterType,
			}
			result = append(result, &newChaosWorkflows)
		}
	}

	return result, nil
}

func QueryListWorkflow(project_id string) ([]*model.Workflow, error) {
	chaosWorkflows, err := database.GetWorkflows(bson.D{{"project_id", project_id}})
	if err != nil {
		return nil, err
	}

	result := []*model.Workflow{}
	for _, workflow := range chaosWorkflows {

		cluster, err := database.GetCluster(workflow.ClusterID)
		if err != nil {
			return nil, err
		}
		var Weightages []*model.Weightages
		copier.Copy(&Weightages, &workflow.Weightages)

		var WorkflowRuns []*model.WorkflowRuns
		copier.Copy(&WorkflowRuns, &workflow.WorkflowRuns)

		newChaosWorkflows := model.Workflow{
			WorkflowID:          workflow.WorkflowID,
			WorkflowManifest:    workflow.WorkflowManifest,
			WorkflowName:        workflow.WorkflowName,
			CronSyntax:          workflow.CronSyntax,
			WorkflowDescription: workflow.WorkflowDescription,
			Weightages:          Weightages,
			IsCustomWorkflow:    workflow.IsCustomWorkflow,
			UpdatedAt:           workflow.UpdatedAt,
			CreatedAt:           workflow.CreatedAt,
			ProjectID:           workflow.ProjectID,
			IsRemoved:           workflow.IsRemoved,
			ClusterName:         cluster.ClusterName,
			ClusterID:           cluster.ClusterID,
			ClusterType:         cluster.ClusterType,
			WorkflowRuns:        WorkflowRuns,
		}
		result = append(result, &newChaosWorkflows)
	}
	return result, nil
}

func QueryListWorkflowByIDs(workflow_ids []*string) ([]*model.Workflow, error) {

	chaosWorkflows, err := database.GetWorkflows(bson.D{{"workflow_id", bson.M{"$in": workflow_ids}}})
	if err != nil {
		return nil, err
	}
	result := []*model.Workflow{}

	for _, workflow := range chaosWorkflows {
		cluster, err := database.GetCluster(workflow.ClusterID)
		if err != nil {
			return nil, err
		}

		var Weightages []*model.Weightages
		copier.Copy(&Weightages, &workflow.Weightages)

		var WorkflowRuns []*model.WorkflowRuns
		copier.Copy(&WorkflowRuns, &workflow.WorkflowRuns)

		newChaosWorkflows := model.Workflow{
			WorkflowID:          workflow.WorkflowID,
			WorkflowManifest:    workflow.WorkflowManifest,
			WorkflowName:        workflow.WorkflowName,
			CronSyntax:          workflow.CronSyntax,
			WorkflowDescription: workflow.WorkflowDescription,
			Weightages:          Weightages,
			IsCustomWorkflow:    workflow.IsCustomWorkflow,
			UpdatedAt:           workflow.UpdatedAt,
			CreatedAt:           workflow.CreatedAt,
			ProjectID:           workflow.ProjectID,
			ClusterName:         cluster.ClusterName,
			ClusterID:           cluster.ClusterID,
			ClusterType:         cluster.ClusterType,
			WorkflowRuns:        WorkflowRuns,
		}
		result = append(result, &newChaosWorkflows)
	}

	return result, nil
}

//ReRunWorkflow sends workflow run request(single run workflow only) to agent on workflow re-run request
func ReRunWorkflow(workflowID string) (string, error) {
	query := bson.D{{"workflow_id", workflowID}, {"isRemoved", false}}
	workflows, err := database.GetWorkflows(query)
	if err != nil {
		log.Print("Could not get workflow :", err)
		return "could not get workflow", err
	}
	if len(workflows) == 0 {
		return "", errors.New("no such workflow found")
	}
	resKind := gjson.Get(workflows[0].WorkflowManifest, "kind").String()
	if strings.ToLower(resKind) == "cronworkflow" { // no op
		return "", errors.New("cronworkflows cannot be re-run")
	}

	workflows[0].WorkflowManifest, err = sjson.Set(workflows[0].WorkflowManifest, "metadata.name", workflows[0].WorkflowName+"-"+strconv.FormatInt(time.Now().Unix(), 10))
	if err != nil {
		log.Print("Failed to updated workflow name [re-run] :", err)
		return "", errors.New("Failed to updated workflow name " + err.Error())
	}

	ops.SendWorkflowToSubscriber(&model.ChaosWorkFlowInput{
		WorkflowManifest: workflows[0].WorkflowManifest,
		ProjectID:        workflows[0].ProjectID,
		ClusterID:        workflows[0].ClusterID,
	}, "create", store.Store)

	return "Request for re-run acknowledged, workflowID: " + workflowID, nil
}

//SendWorkflowEvent sends workflow events from the clusters to the appropriate users listening for the events
func SendWorkflowEvent(wfRun model.WorkflowRun, r *store.StateData) {
	r.Mutex.Lock()
	if r.WorkflowEventPublish != nil {
		for _, observer := range r.WorkflowEventPublish[wfRun.ProjectID] {
			observer <- &wfRun
		}
	}
	r.Mutex.Unlock()
}
