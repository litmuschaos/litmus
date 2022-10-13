package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/config"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/grpc"
	grpc2 "google.golang.org/grpc"

	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"

	"github.com/jinzhu/copier"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	types "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow/ops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbSchemaWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbOperationsWorkflowTemplate "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflowtemplate"
	dbSchemaWorkflowTemplate "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflowtemplate"
	gitOpsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
)

func CreateChaosWorkflow(ctx context.Context, request *model.ChaosWorkFlowRequest, r *store.StateData) (*model.ChaosWorkFlowResponse, error) {
	request, wfType, err := ops.ProcessWorkflow(request)
	if err != nil {
		log.Print("Error processing workflow: ", err)
		return nil, err
	}

	// GitOps Update
	err = gitOpsHandler.UpsertWorkflowToGit(ctx, request)
	if err != nil {
		log.Print("Error performing git push: ", err)
		return nil, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Print("Error getting username: ", err)
		return nil, err
	}

	err = ops.ProcessWorkflowCreation(request, username, wfType, r)
	if err != nil {
		log.Print("Error executing workflow: ", err)
		return nil, err
	}

	return &model.ChaosWorkFlowResponse{
		WorkflowID:          *request.WorkflowID,
		CronSyntax:          request.CronSyntax,
		WorkflowName:        request.WorkflowName,
		WorkflowDescription: request.WorkflowDescription,
		IsCustomWorkflow:    request.IsCustomWorkflow,
	}, nil
}

func DeleteChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string, r *store.StateData) (bool, error) {
	query := bson.D{
		{"workflow_id", workflowID},
		{"project_id", projectID},
	}
	workflow, err := dbOperationsWorkflow.GetWorkflow(query)
	if err != nil {
		return false, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Print("Error getting username: ", err)
		return false, err
	}

	if *workflowID != "" && *workflowRunID != "" {
		for _, workflowRun := range workflow.WorkflowRuns {
			if workflowRun.WorkflowRunID == *workflowRunID {
				bool_true := true
				workflowRun.IsRemoved = &bool_true
			}
		}

		err = ops.ProcessWorkflowRunDelete(query, workflowRunID, workflow, username, r)
		if err != nil {
			return false, err
		}

		return true, nil

	} else if *workflowID != "" && *workflowRunID == "" {
		wf := model.ChaosWorkFlowRequest{
			ProjectID:    workflow.ProjectID,
			WorkflowID:   &workflow.WorkflowID,
			WorkflowName: workflow.WorkflowName,
		}

		// gitOps delete
		err = gitOpsHandler.DeleteWorkflowFromGit(ctx, &wf)
		if err != nil {
			log.Print("Error performing git push: ", err)
			return false, err
		}

		err = ops.ProcessWorkflowDelete(query, workflow, username, r)
		if err != nil {
			return false, err
		}

		return true, nil

	}

	return false, err
}

func TerminateChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string, r *store.StateData) (bool, error) {
	query := bson.D{
		{"workflow_id", workflowID},
		{"project_id", projectID},
	}
	workflow, err := dbOperationsWorkflow.GetWorkflow(query)
	if err != nil {
		return false, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Print("Error getting username: ", err)
		return false, err
	}

	if *workflowID != "" && *workflowRunID != "" {
		for _, workflow_run := range workflow.WorkflowRuns {
			if workflow_run.WorkflowRunID == *workflowRunID {
				workflow_run.Completed = true
				workflow_run.Phase = "Terminated"
			}
		}

		err = ops.ProcessWorkflowRunDelete(query, workflowRunID, workflow, username, r)
		if err != nil {
			return false, err
		}

		return true, nil

	}
	return false, errors.New("invalid input, workflow and workflow run id cannot be empty")
}

func UpdateChaosWorkflow(ctx context.Context, request *model.ChaosWorkFlowRequest, r *store.StateData) (*model.ChaosWorkFlowResponse, error) {
	request, wfType, err := ops.ProcessWorkflow(request)
	if err != nil {
		log.Print("Error processing workflow update: ", err)
		return nil, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Print("Error getting username: ", err)
		return nil, err
	}

	// GitOps Update
	err = gitOpsHandler.UpsertWorkflowToGit(ctx, request)
	if err != nil {
		log.Print("Error performing git push: ", err)
		return nil, err
	}

	err = ops.ProcessWorkflowUpdate(request, username, wfType, r)
	if err != nil {
		log.Print("Error executing workflow update: ", err)
		return nil, err
	}

	return &model.ChaosWorkFlowResponse{
		WorkflowID:          *request.WorkflowID,
		CronSyntax:          request.CronSyntax,
		WorkflowName:        request.WorkflowName,
		WorkflowDescription: request.WorkflowDescription,
		IsCustomWorkflow:    request.IsCustomWorkflow,
	}, nil
}

// ListWorkflowRuns sends all the workflow runs for a project from the DB
func ListWorkflowRuns(request model.ListWorkflowRunsRequest) (*model.ListWorkflowRunsResponse, error) {
	var pipeline mongo.Pipeline

	// Match with projectID
	matchProjectIdStage := bson.D{
		{"$match", bson.D{
			{"project_id", request.ProjectID},
		}},
	}
	pipeline = append(pipeline, matchProjectIdStage)

	// Match the workflowIds from the input array
	if len(request.WorkflowIDs) != 0 {
		matchWfIdStage := bson.D{
			{"$match", bson.D{
				{"workflow_id", bson.D{
					{"$in", request.WorkflowIDs},
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
		{"cronSyntax", 1},
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

	// Match the workflowIds from the input array
	if len(request.WorkflowRunIDs) != 0 {
		matchWfRunIdStage := bson.D{
			{"$project", append(includeAllFromWorkflow,
				bson.E{Key: "workflow_runs", Value: bson.D{
					{"$filter", bson.D{
						{"input", "$workflow_runs"},
						{"as", "wfRun"},
						{"cond", bson.D{
							{"$in", bson.A{"$$wfRun.workflow_run_id", request.WorkflowRunIDs}},
						}},
					}},
				}},
			)},
		}

		pipeline = append(pipeline, matchWfRunIdStage)
	}

	// Filtering based on multiple parameters
	if request.Filter != nil {

		// Filtering based on workflow name
		if request.Filter.WorkflowName != nil && *request.Filter.WorkflowName != "" {
			matchWfNameStage := bson.D{
				{"$match", bson.D{
					{"workflow_name", bson.D{
						{"$regex", request.Filter.WorkflowName},
					}},
				}},
			}
			pipeline = append(pipeline, matchWfNameStage)
		}

		// Filtering based on cluster name
		if request.Filter.ClusterName != nil && *request.Filter.ClusterName != "All" && *request.Filter.ClusterName != "" {
			matchClusterStage := bson.D{
				{"$match", bson.D{
					{"cluster_name", request.Filter.ClusterName},
				}},
			}
			pipeline = append(pipeline, matchClusterStage)
		}

		// Filtering based on phase
		if request.Filter.WorkflowStatus != nil && *request.Filter.WorkflowStatus != "All" && *request.Filter.WorkflowStatus != "" {
			filterWfRunPhaseStage := bson.D{
				{"$project", append(includeAllFromWorkflow,
					bson.E{Key: "workflow_runs", Value: bson.D{
						{"$filter", bson.D{
							{"input", "$workflow_runs"},
							{"as", "wfRun"},
							{"cond", bson.D{
								{"$eq", bson.A{"$$wfRun.phase", string(*request.Filter.WorkflowStatus)}},
							}},
						}},
					}},
				)},
			}

			pipeline = append(pipeline, filterWfRunPhaseStage)
		}

		// Filtering based on date range
		if request.Filter.DateRange != nil {
			endDate := string(time.Now().Unix())
			if request.Filter.DateRange.EndDate != nil {
				endDate = *request.Filter.DateRange.EndDate
			}
			filterWfRunDateStage := bson.D{
				{"$project", append(includeAllFromWorkflow,
					bson.E{Key: "workflow_runs", Value: bson.D{
						{"$filter", bson.D{
							{"input", "$workflow_runs"},
							{"as", "wfRun"},
							{"cond", bson.D{
								{"$and", bson.A{
									bson.D{{"$lte", bson.A{"$$wfRun.last_updated", endDate}}},
									bson.D{{"$gte", bson.A{"$$wfRun.last_updated", request.Filter.DateRange.StartDate}}},
								}},
							}},
						}},
					}},
				)},
			}

			pipeline = append(pipeline, filterWfRunDateStage)
		}
	}

	// Flatten out the workflow runs
	unwindStage := bson.D{
		{"$unwind", bson.D{
			{"path", "$workflow_runs"},
		}},
	}
	pipeline = append(pipeline, unwindStage)

	var sortStage bson.D

	switch {
	case request.Sort != nil && request.Sort.Field == model.WorkflowSortingFieldTime:
		// Sorting based on LastUpdated time
		if request.Sort.Descending != nil && *request.Sort.Descending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"workflow_runs.last_updated", -1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"workflow_runs.last_updated", 1},
				}},
			}
		}
	case request.Sort != nil && request.Sort.Field == model.WorkflowSortingFieldName:
		// Sorting based on WorkflowName time
		if request.Sort.Descending != nil && *request.Sort.Descending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"workflow_name", -1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"workflow_name", 1},
				}},
			}
		}
	default:
		// Default sorting: sorts it by LastUpdated time in descending order
		sortStage = bson.D{
			{"$sort", bson.D{
				{"workflow_runs.last_updated", -1},
			}},
		}
	}

	// Pagination
	paginatedWorkflows := bson.A{
		sortStage,
	}

	if request.Pagination != nil {
		paginationSkipStage := bson.D{
			{"$skip", request.Pagination.Page * request.Pagination.Limit},
		}
		paginationLimitStage := bson.D{
			{"$limit", request.Pagination.Limit},
		}

		paginatedWorkflows = append(paginatedWorkflows, paginationSkipStage, paginationLimitStage)
	}

	// Add two stages where we first count the number of filtered workflow and then paginate the results
	facetStage := bson.D{
		{"$facet", bson.D{
			{"total_filtered_workflow_runs", bson.A{
				bson.D{{"$count", "count"}},
			}},
			{"flattened_workflow_runs", paginatedWorkflows},
		}},
	}
	pipeline = append(pipeline, facetStage)

	// Call aggregation on pipeline
	workflowsCursor, err := dbOperationsWorkflow.GetAggregateWorkflows(pipeline)
	if err != nil {
		return nil, err
	}

	var result []*model.WorkflowRun

	var workflows []dbSchemaWorkflow.AggregatedWorkflowRuns

	if err = workflowsCursor.All(context.Background(), &workflows); err != nil || len(workflows) == 0 {
		return &model.ListWorkflowRunsResponse{
			TotalNoOfWorkflowRuns: 0,
			WorkflowRuns:          result,
		}, nil
	}

	for _, workflow := range workflows[0].FlattenedWorkflowRuns {
		workflowRun := workflow.WorkflowRuns

		var Weightages []*model.Weightages
		copier.Copy(&Weightages, &workflow.Weightages)

		newWorkflowRun := model.WorkflowRun{
			WorkflowName:       workflow.WorkflowName,
			WorkflowID:         workflow.WorkflowID,
			WorkflowRunID:      workflowRun.WorkflowRunID,
			LastUpdated:        workflowRun.LastUpdated,
			Weightages:         Weightages,
			ProjectID:          workflow.ProjectID,
			ClusterID:          workflow.ClusterID,
			Phase:              workflowRun.Phase,
			ResiliencyScore:    workflowRun.ResiliencyScore,
			ExperimentsPassed:  workflowRun.ExperimentsPassed,
			ExperimentsFailed:  workflowRun.ExperimentsFailed,
			ExperimentsAwaited: workflowRun.ExperimentsAwaited,
			ExperimentsStopped: workflowRun.ExperimentsStopped,
			ExperimentsNa:      workflowRun.ExperimentsNA,
			TotalExperiments:   workflowRun.TotalExperiments,
			ExecutionData:      workflowRun.ExecutionData,
			ClusterName:        workflow.ClusterName,
			ClusterType:        &workflow.ClusterType,
			IsRemoved:          workflowRun.IsRemoved,
			ExecutedBy:         workflowRun.ExecutedBy,
		}
		result = append(result, &newWorkflowRun)
	}

	totalFilteredWorkflowRunsCounter := 0
	if len(workflows) > 0 && len(workflows[0].TotalFilteredWorkflowRuns) > 0 {
		totalFilteredWorkflowRunsCounter = workflows[0].TotalFilteredWorkflowRuns[0].Count
	}

	output := model.ListWorkflowRunsResponse{
		TotalNoOfWorkflowRuns: totalFilteredWorkflowRunsCounter,
		WorkflowRuns:          result,
	}
	return &output, nil
}

// ListWorkflows returns all the workflows present in the given project
func ListWorkflows(request model.ListWorkflowsRequest) (*model.ListWorkflowsResponse, error) {
	var pipeline mongo.Pipeline

	// Match with projectID
	matchProjectIdStage := bson.D{
		{"$match", bson.D{
			{"project_id", request.ProjectID},
		}},
	}
	pipeline = append(pipeline, matchProjectIdStage)

	// Match the workflowIds from the input array
	if len(request.WorkflowIDs) != 0 {
		matchWfIdStage := bson.D{
			{"$match", bson.D{
				{"workflow_id", bson.D{
					{"$in", request.WorkflowIDs},
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

	// Filtering out workflow runs
	excludeWfRun := bson.D{
		{"$project", bson.D{
			{"workflow_runs", 0},
		}},
	}
	pipeline = append(pipeline, excludeWfRun)

	// Filtering based on multiple parameters
	if request.Filter != nil {

		// Filtering based on workflow name
		if request.Filter.WorkflowName != nil && *request.Filter.WorkflowName != "" {
			matchWfNameStage := bson.D{
				{"$match", bson.D{
					{"workflow_name", bson.D{
						{"$regex", request.Filter.WorkflowName},
					}},
				}},
			}
			pipeline = append(pipeline, matchWfNameStage)
		}

		// Filtering based on cluster name
		if request.Filter.ClusterName != nil && *request.Filter.ClusterName != "All" && *request.Filter.ClusterName != "" {
			matchClusterStage := bson.D{
				{"$match", bson.D{
					{"cluster_name", request.Filter.ClusterName},
				}},
			}
			pipeline = append(pipeline, matchClusterStage)
		}
	}

	var sortStage bson.D

	switch {

	case request.Sort != nil && request.Sort.Field == model.WorkflowSortingFieldTime:
		// Sorting based on LastUpdated time
		if request.Sort.Descending != nil && *request.Sort.Descending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"updated_at", -1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"updated_at", 1},
				}},
			}
		}

	case request.Sort != nil && request.Sort.Field == model.WorkflowSortingFieldName:
		// Sorting based on WorkflowName
		if request.Sort.Descending != nil && *request.Sort.Descending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"workflow_name", -1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"workflow_name", 1},
				}},
			}
		}
	default:
		// Default sorting: sorts it by LastUpdated time in descending order
		sortStage = bson.D{
			{"$sort", bson.D{
				{"updated_at", -1},
			}},
		}
	}

	// Pagination
	paginatedWorkflows := bson.A{
		sortStage,
	}

	if request.Pagination != nil {
		paginationSkipStage := bson.D{
			{"$skip", request.Pagination.Page * request.Pagination.Limit},
		}
		paginationLimitStage := bson.D{
			{"$limit", request.Pagination.Limit},
		}

		paginatedWorkflows = append(paginatedWorkflows, paginationSkipStage, paginationLimitStage)
	}

	// Add two stages where we first count the number of filtered workflow and then paginate the results
	facetStage := bson.D{
		{"$facet", bson.D{
			{"total_filtered_workflows", bson.A{
				bson.D{{"$count", "count"}},
			}},
			{"scheduled_workflows", paginatedWorkflows},
		}},
	}
	pipeline = append(pipeline, facetStage)

	// Call aggregation on pipeline
	workflowsCursor, err := dbOperationsWorkflow.GetAggregateWorkflows(pipeline)
	if err != nil {
		return nil, err
	}

	var result []*model.Workflow

	var workflows []dbSchemaWorkflow.AggregatedWorkflows

	if err = workflowsCursor.All(context.Background(), &workflows); err != nil || len(workflows) == 0 {
		return &model.ListWorkflowsResponse{
			TotalNoOfWorkflows: 0,
			Workflows:          result,
		}, nil
	}

	for _, workflow := range workflows[0].ScheduledWorkflows {
		cluster, err := dbOperationsCluster.GetCluster(workflow.ClusterID)
		if err != nil {
			return nil, err
		}

		var Weightages []*model.Weightages
		copier.Copy(&Weightages, &workflow.Weightages)

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
			LastUpdatedBy:       &workflow.LastUpdatedBy,
		}
		result = append(result, &newChaosWorkflows)
	}

	totalFilteredWorkflowsCounter := 0
	if len(workflows) > 0 && len(workflows[0].TotalFilteredWorkflows) > 0 {
		totalFilteredWorkflowsCounter = workflows[0].TotalFilteredWorkflows[0].Count
	}

	output := model.ListWorkflowsResponse{
		TotalNoOfWorkflows: totalFilteredWorkflowsCounter,
		Workflows:          result,
	}
	return &output, nil
}

// ChaosWorkflowRun Updates or Inserts a new Workflow Run into the DB
func ChaosWorkflowRun(request model.WorkflowRunRequest, r store.StateData) (string, error) {
	cluster, err := cluster.VerifyCluster(*request.ClusterID)
	if err != nil {
		log.Println("ERROR", err)
		return "", err
	}

	// Parse and store execution data
	var executionData types.ExecutionData
	err = json.Unmarshal([]byte(request.ExecutionData), &executionData)
	if err != nil {
		log.Println("Can not parse Execution Data of workflow run with id: ", request.WorkflowRunID)
		return "", err
	}

	var workflowRunMetrics types.WorkflowRunMetrics
	// Resiliency Score will be calculated only if workflow execution is completed
	if request.Completed {
		workflowRunMetrics, err = ops.ProcessCompletedWorkflowRun(executionData, request.WorkflowID)
		if err != nil {
			return "", err
		}
	}

	count := 0
	isRemoved := false
	count, err = dbOperationsWorkflow.UpdateWorkflowRun(request.WorkflowID, dbSchemaWorkflow.ChaosWorkflowRun{
		WorkflowRunID:      request.WorkflowRunID,
		LastUpdated:        strconv.FormatInt(time.Now().Unix(), 10),
		Phase:              executionData.Phase,
		ResiliencyScore:    &workflowRunMetrics.ResiliencyScore,
		ExperimentsPassed:  &workflowRunMetrics.ExperimentsPassed,
		ExperimentsFailed:  &workflowRunMetrics.ExperimentsFailed,
		ExperimentsAwaited: &workflowRunMetrics.ExperimentsAwaited,
		ExperimentsStopped: &workflowRunMetrics.ExperimentsStopped,
		ExperimentsNA:      &workflowRunMetrics.ExperimentsNA,
		TotalExperiments:   &workflowRunMetrics.TotalExperiments,
		ExecutionData:      request.ExecutionData,
		Completed:          request.Completed,
		IsRemoved:          &isRemoved,
		ExecutedBy:         request.ExecutedBy,
	})

	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}

	if count == 0 {
		return "Workflow Run Discarded[Duplicate Event]", nil
	}

	ops.SendWorkflowEvent(model.WorkflowRun{
		ClusterID:          cluster.ClusterID,
		ClusterName:        cluster.ClusterName,
		ProjectID:          cluster.ProjectID,
		LastUpdated:        strconv.FormatInt(time.Now().Unix(), 10),
		WorkflowRunID:      request.WorkflowRunID,
		WorkflowName:       request.WorkflowName,
		Phase:              executionData.Phase,
		ResiliencyScore:    &workflowRunMetrics.ResiliencyScore,
		ExperimentsPassed:  &workflowRunMetrics.ExperimentsPassed,
		ExperimentsFailed:  &workflowRunMetrics.ExperimentsFailed,
		ExperimentsAwaited: &workflowRunMetrics.ExperimentsAwaited,
		ExperimentsStopped: &workflowRunMetrics.ExperimentsStopped,
		ExperimentsNa:      &workflowRunMetrics.ExperimentsNA,
		TotalExperiments:   &workflowRunMetrics.TotalExperiments,
		ExecutionData:      request.ExecutionData,
		WorkflowID:         request.WorkflowID,
		IsRemoved:          &isRemoved,
		ExecutedBy:         request.ExecutedBy,
	}, &r)

	return "Workflow Run Accepted", nil
}

// PodLog receives logs from the workflow-agent and publishes to frontend clients
func PodLog(request model.PodLog, r store.StateData) (string, error) {
	_, err := cluster.VerifyCluster(*request.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	if reqChan, ok := r.WorkflowLog[request.RequestID]; ok {
		resp := model.PodLogResponse{
			PodName:       request.PodName,
			WorkflowRunID: request.WorkflowRunID,
			PodType:       request.PodType,
			Log:           request.Log,
		}
		reqChan <- &resp
		close(reqChan)
		return "LOGS SENT SUCCESSFULLY", nil
	}
	return "LOG REQUEST CANCELLED", nil
}

// GetLogs query is used to fetch the logs from the cluster
func GetLogs(reqID string, pod model.PodLogRequest, r store.StateData) {
	data, err := json.Marshal(pod)
	if err != nil {
		log.Print("ERROR WHILE MARSHALLING POD DETAILS")
	}
	reqType := "logs"
	externalData := string(data)
	payload := model.ClusterActionResponse{
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

// ReRunChaosWorkFlow sends workflow run request(single run workflow only) to agent on workflow re-run request
func ReRunChaosWorkFlow(projectID string, workflowID string, username string) (string, error) {
	query := bson.D{
		{"project_id", projectID},
		{"workflow_id", workflowID},
		{"isRemoved", false},
	}

	workflows, err := dbOperationsWorkflow.GetWorkflows(query)
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

	cluster, err := dbOperationsCluster.GetCluster(workflows[0].ClusterID)
	if err != nil {
		return "", errors.New(err.Error())
	}
	if cluster.IsActive != true {
		log.Print("Agent not active to re-run the workflow")
		return "", errors.New("Agent not active to re-run the selected workflow.")
	}

	workflows[0].WorkflowManifest, err = sjson.Set(workflows[0].WorkflowManifest, "metadata.name", workflows[0].WorkflowName+"-"+strconv.FormatInt(time.Now().Unix(), 10))
	if err != nil {
		log.Print("Failed to updated workflow name [re-run] :", err)
		return "", errors.New("Failed to updated workflow name " + err.Error())
	}

	ops.SendWorkflowToSubscriber(&model.ChaosWorkFlowRequest{
		WorkflowManifest: workflows[0].WorkflowManifest,
		ProjectID:        workflows[0].ProjectID,
		ClusterID:        workflows[0].ClusterID,
	}, &username, nil, "create", store.Store)

	return "Request for re-run acknowledged, workflowID: " + workflowID, nil
}

// KubeObj receives Kubernetes Object data from subscriber
func KubeObj(request model.KubeObjectData, r store.StateData) (string, error) {
	_, err := cluster.VerifyCluster(*request.ClusterID)
	if err != nil {
		log.Print("Error", err)
		return "", err
	}
	if reqChan, ok := r.KubeObjectData[request.RequestID]; ok {
		resp := model.KubeObjectResponse{
			ClusterID: request.ClusterID.ClusterID,
			KubeObj:   request.KubeObj,
		}
		reqChan <- &resp
		close(reqChan)
		return "KubeData sent successfully", nil
	}
	return "KubeData sent successfully", nil
}

func GetKubeObjData(reqID string, kubeObject model.KubeObjectRequest, r store.StateData) {
	reqType := kubeObject.ObjectType
	data, err := json.Marshal(kubeObject)
	if err != nil {
		log.Print("ERROR WHILE MARSHALLING POD DETAILS")
	}
	externalData := string(data)
	payload := model.ClusterActionResponse{
		ProjectID: reqID,
		Action: &model.ActionPayload{
			RequestType:  reqType,
			ExternalData: &externalData,
		},
	}
	if clusterChan, ok := r.ConnectedCluster[kubeObject.ClusterID]; ok {
		clusterChan <- &payload
	} else if reqChan, ok := r.KubeObjectData[reqID]; ok {
		resp := model.KubeObjectResponse{
			ClusterID: kubeObject.ClusterID,
			KubeObj:   "Data not available",
		}
		reqChan <- &resp
		close(reqChan)
	}
}

// CreateWorkflowTemplate is used to save the workflow manifest as a template
func CreateWorkflowTemplate(ctx context.Context, request *model.TemplateInput) (*model.WorkflowTemplate, error) {
	IsExist, err := IsTemplateAvailable(ctx, request.TemplateName, request.ProjectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("Template already exists")
	}

	var conn *grpc2.ClientConn
	client, conn := grpc.GetAuthGRPCSvcClient(conn)
	defer conn.Close()

	projectData, err := grpc.GetProjectById(client, request.ProjectID)
	if err != nil {
		return nil, err
	}

	uuid := uuid.New()
	template := &dbSchemaWorkflowTemplate.WorkflowTemplate{
		TemplateID:          uuid.String(),
		TemplateName:        request.TemplateName,
		TemplateDescription: request.TemplateDescription,
		ProjectID:           request.ProjectID,
		Manifest:            request.Manifest,
		ProjectName:         projectData.Name,
		CreatedAt:           strconv.FormatInt(time.Now().Unix(), 10),
		IsRemoved:           false,
		IsCustomWorkflow:    request.IsCustomWorkflow,
	}

	err = dbOperationsWorkflowTemplate.CreateWorkflowTemplate(ctx, template)
	if err != nil {
		log.Print("Error", err)
	}
	return template.GetWorkflowTemplateOutput(), nil
}

// ListWorkflowTemplate is used to list all the workflow templates available in the project
func ListWorkflowManifests(ctx context.Context, projectID string) ([]*model.WorkflowTemplate, error) {
	templates, err := dbSchemaWorkflowTemplate.GetTemplatesByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	var templateList []*model.WorkflowTemplate

	for _, template := range templates {
		templateList = append(templateList, template.GetWorkflowTemplateOutput())
	}
	return templateList, err
}

// QueryTemplateWorkflowByID is used to fetch the workflow template with template id
func GetWorkflowManifestByID(ctx context.Context, templateID string) (*model.WorkflowTemplate, error) {
	template, err := dbSchemaWorkflowTemplate.GetTemplateByTemplateID(ctx, templateID)
	if err != nil {
		return nil, err
	}
	return template.GetWorkflowTemplateOutput(), err
}

// DeleteWorkflowTemplate is used to delete the workflow template (update the is_removed field as true)
func DeleteWorkflowTemplate(ctx context.Context, projectID string, templateID string) (bool, error) {
	query := bson.D{
		{"project_id", projectID},
		{"template_id", templateID},
	}
	update := bson.D{{"$set", bson.D{{"is_removed", true}}}}
	err := dbOperationsWorkflowTemplate.UpdateTemplateManifest(ctx, query, update)
	if err != nil {
		log.Print("Err", err)
		return false, err
	}
	return true, err
}

// IsTemplateAvailable is used to check if a template name already exists in the database
func IsTemplateAvailable(ctx context.Context, templateName string, projectID string) (bool, error) {
	templates, err := dbOperationsWorkflowTemplate.GetTemplatesByProjectID(ctx, projectID)
	if err != nil {
		return true, err
	}
	for _, n := range templates {
		if n.TemplateName == templateName {
			return true, nil
		}
	}
	return false, nil
}

func SyncWorkflowRun(ctx context.Context, projectID string, workflowID string, workflowRunID string, r *store.StateData) (bool, error) {

	query := bson.D{
		{"workflow_id", workflowID},
		{"project_id", projectID},
	}
	workflow, err := dbOperationsWorkflow.GetWorkflow(query)
	if err != nil {
		return false, err
	}

	for _, workflowRun := range workflow.WorkflowRuns {
		if workflow.IsRemoved == true {
			return false, errors.New("workflow has been removed")
		}

		if workflowRun.WorkflowRunID == workflowRunID && !workflowRun.Completed && workflow.IsRemoved == false {
			err = ops.ProcessWorkflowRunSync(workflowID, &workflowRunID, workflow, r)
			if err != nil {
				return false, err
			}
		}

	}

	return true, nil
}

// QueryServerVersion is used to fetch the version of the server
func QueryServerVersion(ctx context.Context) (*model.ServerVersionResponse, error) {
	dbVersion, err := config.GetConfig(ctx, "version")
	if err != nil {
		return nil, err
	}
	return &model.ServerVersionResponse{
		Key:   dbVersion.Key,
		Value: dbVersion.Value.(string),
	}, nil
}
