package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

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
	dbOperationsProject "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/project"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbSchemaWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbOperationsWorkflowTemplate "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflowtemplate"
	dbSchemaWorkflowTemplate "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflowtemplate"
	gitOpsHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops/handler"
)

func CreateChaosWorkflow(ctx context.Context, input *model.ChaosWorkFlowInput, r *store.StateData) (*model.ChaosWorkFlowResponse, error) {
	input, wfType, err := ops.ProcessWorkflow(input)
	if err != nil {
		log.Print("Error processing workflow: ", err)
		return nil, err
	}

	// GitOps Update
	err = gitOpsHandler.UpsertWorkflowToGit(ctx, input)
	if err != nil {
		log.Print("Error performing git push: ", err)
		return nil, err
	}

	err = ops.ProcessWorkflowCreation(input, wfType, r)
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

func DeleteWorkflow(ctx context.Context, workflow_id *string, workflowRunID *string, r *store.StateData) (bool, error) {
	query := bson.D{{"workflow_id", workflow_id}}
	workflow, err := dbOperationsWorkflow.GetWorkflow(query)
	if err != nil {
		return false, err
	}

	if *workflow_id != "" && *workflowRunID != "" {
		for _, workflow_run := range workflow.WorkflowRuns {
			if workflow_run.WorkflowRunID == *workflowRunID {
				bool_true := true
				workflow_run.IsRemoved = &bool_true
			}
		}

		err = ops.ProcessWorkflowRunDelete(query, workflowRunID, workflow, r)
		if err != nil {
			return false, err
		}

		return true, nil

	} else if *workflow_id != "" && *workflowRunID == "" {
		wf := model.ChaosWorkFlowInput{
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

		err = ops.ProcessWorkflowDelete(query, workflow, r)
		if err != nil {
			return false, err
		}

		return true, nil

	}

	return false, err
}

func UpdateWorkflow(ctx context.Context, input *model.ChaosWorkFlowInput, r *store.StateData) (*model.ChaosWorkFlowResponse, error) {
	input, wfType, err := ops.ProcessWorkflow(input)
	if err != nil {
		log.Print("Error processing workflow update: ", err)
		return nil, err
	}

	// GitOps Update
	err = gitOpsHandler.UpsertWorkflowToGit(ctx, input)
	if err != nil {
		log.Print("Error performing git push: ", err)
		return nil, err
	}

	err = ops.ProcessWorkflowUpdate(input, wfType, r)
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

// QueryWorkflowRuns sends all the workflow runs for a project from the DB
func QueryWorkflowRuns(input model.GetWorkflowRunsInput) (*model.GetWorkflowsOutput, error) {
	var pipeline mongo.Pipeline

	// Match with projectID
	matchProjectIdStage := bson.D{
		{"$match", bson.D{
			{"project_id", input.ProjectID},
		}},
	}
	pipeline = append(pipeline, matchProjectIdStage)

	// Match the workflowIds from the input array
	if len(input.WorkflowIds) != 0 {
		matchWfIdStage := bson.D{
			{"$match", bson.D{
				{"workflow_id", bson.D{
					{"$in", input.WorkflowIds},
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
	if len(input.WorkflowRunIds) != 0 {
		matchWfRunIdStage := bson.D{
			{"$project", append(includeAllFromWorkflow,
				bson.E{Key: "workflow_runs", Value: bson.D{
					{"$filter", bson.D{
						{"input", "$workflow_runs"},
						{"as", "wfRun"},
						{"cond", bson.D{
							{"$in", bson.A{"$$wfRun.workflow_run_id", input.WorkflowRunIds}},
						}},
					}},
				}},
			)},
		}

		pipeline = append(pipeline, matchWfRunIdStage)
	}

	// Filtering based on multiple parameters
	if input.Filter != nil {

		// Filtering based on workflow name
		if input.Filter.WorkflowName != nil && *input.Filter.WorkflowName != "" {
			matchWfNameStage := bson.D{
				{"$match", bson.D{
					{"workflow_name", bson.D{
						{"$regex", input.Filter.WorkflowName},
					}},
				}},
			}
			pipeline = append(pipeline, matchWfNameStage)
		}

		// Filtering based on cluster name
		if input.Filter.ClusterName != nil && *input.Filter.ClusterName != "All" && *input.Filter.ClusterName != "" {
			matchClusterStage := bson.D{
				{"$match", bson.D{
					{"cluster_name", input.Filter.ClusterName},
				}},
			}
			pipeline = append(pipeline, matchClusterStage)
		}

		// Filtering based on phase
		if input.Filter.WorkflowStatus != nil && *input.Filter.WorkflowStatus != "All" && *input.Filter.WorkflowStatus != "" {
			filterWfRunPhaseStage := bson.D{
				{"$project", append(includeAllFromWorkflow,
					bson.E{Key: "workflow_runs", Value: bson.D{
						{"$filter", bson.D{
							{"input", "$workflow_runs"},
							{"as", "wfRun"},
							{"cond", bson.D{
								{"$eq", bson.A{"$$wfRun.phase", string(*input.Filter.WorkflowStatus)}},
							}},
						}},
					}},
				)},
			}

			pipeline = append(pipeline, filterWfRunPhaseStage)
		}

		// Filtering based on date range
		if input.Filter.DateRange != nil {
			endDate := string(time.Now().Unix())
			if input.Filter.DateRange.EndDate != nil {
				endDate = *input.Filter.DateRange.EndDate
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
									bson.D{{"$gte", bson.A{"$$wfRun.last_updated", input.Filter.DateRange.StartDate}}},
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
	case input.Sort != nil && input.Sort.Field == model.WorkflowSortingFieldTime:
		// Sorting based on LastUpdated time
		if input.Sort.Descending != nil && *input.Sort.Descending {
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
	case input.Sort != nil && input.Sort.Field == model.WorkflowSortingFieldName:
		// Sorting based on WorkflowName time
		if input.Sort.Descending != nil && *input.Sort.Descending {
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

	if input.Pagination != nil {
		paginationSkipStage := bson.D{
			{"$skip", input.Pagination.Page * input.Pagination.Limit},
		}
		paginationLimitStage := bson.D{
			{"$limit", input.Pagination.Limit},
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
		return &model.GetWorkflowsOutput{
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
		}
		result = append(result, &newWorkflowRun)
	}

	totalFilteredWorkflowRunsCounter := 0
	if len(workflows) > 0 && len(workflows[0].TotalFilteredWorkflowRuns) > 0 {
		totalFilteredWorkflowRunsCounter = workflows[0].TotalFilteredWorkflowRuns[0].Count
	}

	output := model.GetWorkflowsOutput{
		TotalNoOfWorkflowRuns: totalFilteredWorkflowRunsCounter,
		WorkflowRuns:          result,
	}
	return &output, nil
}

// QueryListWorkflow returns all the workflows present in the given project
func QueryListWorkflow(workflowInput model.ListWorkflowsInput) (*model.ListWorkflowsOutput, error) {
	var pipeline mongo.Pipeline

	// Match with projectID
	matchProjectIdStage := bson.D{
		{"$match", bson.D{
			{"project_id", workflowInput.ProjectID},
		}},
	}
	pipeline = append(pipeline, matchProjectIdStage)

	// Match the workflowIds from the input array
	if len(workflowInput.WorkflowIds) != 0 {
		matchWfIdStage := bson.D{
			{"$match", bson.D{
				{"workflow_id", bson.D{
					{"$in", workflowInput.WorkflowIds},
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
	if workflowInput.Filter != nil {

		// Filtering based on workflow name
		if workflowInput.Filter.WorkflowName != nil && *workflowInput.Filter.WorkflowName != "" {
			matchWfNameStage := bson.D{
				{"$match", bson.D{
					{"workflow_name", bson.D{
						{"$regex", workflowInput.Filter.WorkflowName},
					}},
				}},
			}
			pipeline = append(pipeline, matchWfNameStage)
		}

		// Filtering based on cluster name
		if workflowInput.Filter.ClusterName != nil && *workflowInput.Filter.ClusterName != "All" && *workflowInput.Filter.ClusterName != "" {
			matchClusterStage := bson.D{
				{"$match", bson.D{
					{"cluster_name", workflowInput.Filter.ClusterName},
				}},
			}
			pipeline = append(pipeline, matchClusterStage)
		}
	}

	var sortStage bson.D

	switch {

	case workflowInput.Sort != nil && workflowInput.Sort.Field == model.WorkflowSortingFieldTime:
		// Sorting based on LastUpdated time
		if workflowInput.Sort.Descending != nil && *workflowInput.Sort.Descending {
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

	case workflowInput.Sort != nil && workflowInput.Sort.Field == model.WorkflowSortingFieldName:
		// Sorting based on WorkflowName
		if workflowInput.Sort.Descending != nil && *workflowInput.Sort.Descending {
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

	if workflowInput.Pagination != nil {
		paginationSkipStage := bson.D{
			{"$skip", workflowInput.Pagination.Page * workflowInput.Pagination.Limit},
		}
		paginationLimitStage := bson.D{
			{"$limit", workflowInput.Pagination.Limit},
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
		return &model.ListWorkflowsOutput{
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
		}
		result = append(result, &newChaosWorkflows)
	}

	totalFilteredWorkflowsCounter := 0
	if len(workflows) > 0 && len(workflows[0].TotalFilteredWorkflows) > 0 {
		totalFilteredWorkflowsCounter = workflows[0].TotalFilteredWorkflows[0].Count
	}

	output := model.ListWorkflowsOutput{
		TotalNoOfWorkflows: totalFilteredWorkflowsCounter,
		Workflows:          result,
	}
	return &output, nil
}

// WorkFlowRunHandler Updates or Inserts a new Workflow Run into the DB
func WorkFlowRunHandler(input model.WorkflowRunInput, r store.StateData) (string, error) {
	cluster, err := cluster.VerifyCluster(*input.ClusterID)
	if err != nil {
		log.Println("ERROR", err)
		return "", err
	}

	// Parse and store execution data
	var executionData types.ExecutionData
	err = json.Unmarshal([]byte(input.ExecutionData), &executionData)
	if err != nil {
		log.Println("Can not parse Execution Data of workflow run with id: ", input.WorkflowRunID)
		return "", err
	}

	var workflowRunMetrics types.WorkflowRunMetrics
	// Resiliency Score will be calculated only if workflow execution is completed
	if input.Completed {
		workflowRunMetrics = ops.ProcessCompletedWorkflowRun(executionData, input.WorkflowID)
	}

	count := 0
	isRemoved := false
	count, err = dbOperationsWorkflow.UpdateWorkflowRun(input.WorkflowID, dbSchemaWorkflow.ChaosWorkflowRun{
		WorkflowRunID:      input.WorkflowRunID,
		LastUpdated:        strconv.FormatInt(time.Now().Unix(), 10),
		Phase:              executionData.Phase,
		ResiliencyScore:    &workflowRunMetrics.ResiliencyScore,
		ExperimentsPassed:  &workflowRunMetrics.ExperimentsPassed,
		ExperimentsFailed:  &workflowRunMetrics.ExperimentsFailed,
		ExperimentsAwaited: &workflowRunMetrics.ExperimentsAwaited,
		ExperimentsStopped: &workflowRunMetrics.ExperimentsStopped,
		ExperimentsNA:      &workflowRunMetrics.ExperimentsNA,
		TotalExperiments:   &workflowRunMetrics.TotalExperiments,
		ExecutionData:      input.ExecutionData,
		Completed:          input.Completed,
		IsRemoved:          &isRemoved,
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
		WorkflowRunID:      input.WorkflowRunID,
		WorkflowName:       input.WorkflowName,
		Phase:              executionData.Phase,
		ResiliencyScore:    &workflowRunMetrics.ResiliencyScore,
		ExperimentsPassed:  &workflowRunMetrics.ExperimentsPassed,
		ExperimentsFailed:  &workflowRunMetrics.ExperimentsFailed,
		ExperimentsAwaited: &workflowRunMetrics.ExperimentsAwaited,
		ExperimentsStopped: &workflowRunMetrics.ExperimentsStopped,
		ExperimentsNa:      &workflowRunMetrics.ExperimentsNA,
		TotalExperiments:   &workflowRunMetrics.TotalExperiments,
		ExecutionData:      input.ExecutionData,
		WorkflowID:         input.WorkflowID,
		IsRemoved:          &isRemoved,
	}, &r)

	return "Workflow Run Accepted", nil
}

// LogsHandler receives logs from the workflow-agent and publishes to frontend clients
func LogsHandler(podLog model.PodLog, r store.StateData) (string, error) {
	_, err := cluster.VerifyCluster(*podLog.ClusterID)
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}
	if reqChan, ok := r.WorkflowLog[podLog.RequestID]; ok {
		resp := model.PodLogResponse{
			PodName:       podLog.PodName,
			WorkflowRunID: podLog.WorkflowRunID,
			PodType:       podLog.PodType,
			Log:           podLog.Log,
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

// ReRunWorkflow sends workflow run request(single run workflow only) to agent on workflow re-run request
func ReRunWorkflow(workflowID string) (string, error) {
	query := bson.D{{"workflow_id", workflowID}, {"isRemoved", false}}
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

	workflows[0].WorkflowManifest, err = sjson.Set(workflows[0].WorkflowManifest, "metadata.name", workflows[0].WorkflowName+"-"+strconv.FormatInt(time.Now().Unix(), 10))
	if err != nil {
		log.Print("Failed to updated workflow name [re-run] :", err)
		return "", errors.New("Failed to updated workflow name " + err.Error())
	}

	ops.SendWorkflowToSubscriber(&model.ChaosWorkFlowInput{
		WorkflowManifest: workflows[0].WorkflowManifest,
		ProjectID:        workflows[0].ProjectID,
		ClusterID:        workflows[0].ClusterID,
	}, nil, "create", store.Store)

	return "Request for re-run acknowledged, workflowID: " + workflowID, nil
}

// KubeObjHandler receives Kubernetes Object data from subscriber
func KubeObjHandler(kubeData model.KubeObjectData, r store.StateData) (string, error) {
	_, err := cluster.VerifyCluster(*kubeData.ClusterID)
	if err != nil {
		log.Print("Error", err)
		return "", err
	}
	if reqChan, ok := r.KubeObjectData[kubeData.RequestID]; ok {
		resp := model.KubeObjectResponse{
			ClusterID: kubeData.ClusterID.ClusterID,
			KubeObj:   kubeData.KubeObj,
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
	payload := model.ClusterAction{
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

// SaveWorkflowTemplate is used to save the workflow manifest as a template
func SaveWorkflowTemplate(ctx context.Context, templateInput *model.TemplateInput) (*model.ManifestTemplate, error) {
	IsExist, err := IsTemplateAvailable(ctx, templateInput.TemplateName, templateInput.ProjectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("Template already exists")
	}
	projectData, err := dbOperationsProject.GetProject(ctx, bson.D{{"_id", templateInput.ProjectID}})
	if err != nil {
		return nil, err
	}

	uuid := uuid.New()
	template := &dbSchemaWorkflowTemplate.ManifestTemplate{
		TemplateID:          uuid.String(),
		TemplateName:        templateInput.TemplateName,
		TemplateDescription: templateInput.TemplateDescription,
		ProjectID:           templateInput.ProjectID,
		Manifest:            templateInput.Manifest,
		ProjectName:         projectData.Name,
		CreatedAt:           strconv.FormatInt(time.Now().Unix(), 10),
		IsRemoved:           false,
		IsCustomWorkflow:    templateInput.IsCustomWorkflow,
	}

	err = dbOperationsWorkflowTemplate.CreateWorkflowTemplate(ctx, template)
	if err != nil {
		log.Print("Error", err)
	}
	return template.GetManifestTemplateOutput(), nil
}

// ListWorkflowTemplate is used to list all the workflow templates available in the project
func ListWorkflowTemplate(ctx context.Context, projectID string) ([]*model.ManifestTemplate, error) {
	templates, err := dbSchemaWorkflowTemplate.GetTemplatesByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	var templateList []*model.ManifestTemplate

	for _, template := range templates {
		templateList = append(templateList, template.GetManifestTemplateOutput())
	}
	return templateList, err
}

// QueryTemplateWorkflowID is used to fetch the workflow template with template id
func QueryTemplateWorkflowByID(ctx context.Context, templateID string) (*model.ManifestTemplate, error) {
	template, err := dbSchemaWorkflowTemplate.GetTemplateByTemplateID(ctx, templateID)
	if err != nil {
		return nil, err
	}
	return template.GetManifestTemplateOutput(), err
}

// DeleteWorkflowTemplate is used to delete the workflow template (update the is_removed field as true)
func DeleteWorkflowTemplate(ctx context.Context, templateID string) (bool, error) {
	query := bson.D{{"template_id", templateID}}
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

func SyncWorkflowRun(ctx context.Context, workflow_id string, workflowRunID string, r *store.StateData) (bool, error) {

	query := bson.D{{"workflow_id", workflow_id}}
	workflow, err := dbOperationsWorkflow.GetWorkflow(query)
	if err != nil {
		return false, err
	}

	for _, workflow_run := range workflow.WorkflowRuns {
		if workflow.IsRemoved == true {
			return false, errors.New("workflow has been removed")
		}

		if workflow_run.WorkflowRunID == workflowRunID && !workflow_run.Completed && workflow.IsRemoved == false {
			err = ops.ProcessWorkflowRunSync(workflow_id, &workflowRunID, workflow, r)
			if err != nil {
				return false, err
			}
		}

	}

	return true, nil
}
