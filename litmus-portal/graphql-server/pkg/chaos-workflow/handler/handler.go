package handler

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	chaosWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	types "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/config"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbSchemaWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbOperationsWorkflowTemplate "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflowtemplate"
	dbSchemaWorkflowTemplate "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflowtemplate"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/gitops"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/grpc"
	log "github.com/sirupsen/logrus"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	grpc2 "google.golang.org/grpc"
)

// ChaosWorkflowHandler is the handler for chaos workflow
type ChaosWorkflowHandler struct {
	chaosWorkflowService          chaosWorkflow.Service
	clusterService                cluster.Service
	gitOpsService                 gitops.Service
	chaosWorkflowOperator         *dbOperationsWorkflow.Operator
	chaosWorkflowTemplateOperator *dbOperationsWorkflowTemplate.Operator
	mongodbOperator               mongodb.MongoOperator
}

// NewChaosWorkflowHandler returns a new instance of ChaosWorkflowHandler
func NewChaosWorkflowHandler(
	chaosWorkflowService chaosWorkflow.Service,
	clusterService cluster.Service,
	gitOpsService gitops.Service,
	chaosWorkflowOperator *dbOperationsWorkflow.Operator,
	chaosWorkflowTemplateOperator *dbOperationsWorkflowTemplate.Operator,
	mongodbOperator mongodb.MongoOperator,
) *ChaosWorkflowHandler {
	return &ChaosWorkflowHandler{
		chaosWorkflowService:          chaosWorkflowService,
		clusterService:                clusterService,
		gitOpsService:                 gitOpsService,
		chaosWorkflowOperator:         chaosWorkflowOperator,
		chaosWorkflowTemplateOperator: chaosWorkflowTemplateOperator,
		mongodbOperator:               mongodbOperator,
	}
}

// CreateChaosWorkflow creates a new chaos workflow
func (c *ChaosWorkflowHandler) CreateChaosWorkflow(ctx context.Context, request *model.ChaosWorkFlowRequest, r *store.StateData) (*model.ChaosWorkFlowResponse, error) {
	request, wfType, err := c.chaosWorkflowService.ProcessWorkflow(request)
	if err != nil {
		log.Error("error processing workflow: ", err)
		return nil, err
	}

	// GitOps Update
	err = c.gitOpsService.UpsertWorkflowToGit(ctx, request)
	if err != nil {
		log.Error("error performing git push: ", err)
		return nil, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Error("error getting username: ", err)
		return nil, err
	}

	err = c.chaosWorkflowService.ProcessWorkflowCreation(request, username, wfType, r)
	if err != nil {
		log.Error("error executing workflow: ", err)
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

// DeleteChaosWorkflow deletes the chaos workflow
func (c *ChaosWorkflowHandler) DeleteChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string, r *store.StateData) (bool, error) {
	query := bson.D{
		{"workflow_id", workflowID},
		{"project_id", projectID},
	}
	workflow, err := c.chaosWorkflowOperator.GetWorkflow(query)
	if err != nil {
		return false, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Error("error getting username: ", err)
		return false, err
	}

	if *workflowID != "" && *workflowRunID != "" {
		for _, workflowRun := range workflow.WorkflowRuns {
			if workflowRun.WorkflowRunID == *workflowRunID {
				boolTrue := true
				workflowRun.IsRemoved = &boolTrue
			}
		}

		err = c.chaosWorkflowService.ProcessWorkflowRunDelete(query, workflowRunID, workflow, username, r)
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
		err = c.gitOpsService.DeleteWorkflowFromGit(ctx, &wf)
		if err != nil {
			log.Error("error performing git push: ", err)
			return false, err
		}

		err = c.chaosWorkflowService.ProcessWorkflowDelete(query, workflow, username, r)
		if err != nil {
			return false, err
		}

		return true, nil

	}

	return false, err
}

func (c *ChaosWorkflowHandler) TerminateChaosWorkflow(ctx context.Context, projectID string, workflowID *string, workflowRunID *string, r *store.StateData) (bool, error) {
	query := bson.D{
		{"workflow_id", workflowID},
		{"project_id", projectID},
	}
	workflow, err := c.chaosWorkflowOperator.GetWorkflow(query)
	if err != nil {
		return false, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Error("error getting username: ", err)
		return false, err
	}

	if *workflowID != "" && *workflowRunID != "" {
		for _, workflowRun := range workflow.WorkflowRuns {
			if workflowRun.WorkflowRunID == *workflowRunID {
				workflowRun.Completed = true
				workflowRun.Phase = "Terminated"
			}
		}

		err = c.chaosWorkflowService.ProcessWorkflowRunDelete(query, workflowRunID, workflow, username, r)
		if err != nil {
			return false, err
		}

		return true, nil

	}
	return false, errors.New("invalid input, workflow and workflow run id cannot be empty")
}

func (c *ChaosWorkflowHandler) UpdateChaosWorkflow(ctx context.Context, request *model.ChaosWorkFlowRequest, r *store.StateData) (*model.ChaosWorkFlowResponse, error) {
	request, wfType, err := c.chaosWorkflowService.ProcessWorkflow(request)
	if err != nil {
		log.Error("error processing workflow update: ", err)
		return nil, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if err != nil {
		log.Error("error getting username: ", err)
		return nil, err
	}

	// GitOps Update
	err = c.gitOpsService.UpsertWorkflowToGit(ctx, request)
	if err != nil {
		log.Error("error performing git push: ", err)
		return nil, err
	}

	err = c.chaosWorkflowService.ProcessWorkflowUpdate(request, username, wfType, r)
	if err != nil {
		log.Error("error executing workflow update: ", err)
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
func (c *ChaosWorkflowHandler) ListWorkflowRuns(request model.ListWorkflowRunsRequest) (*model.ListWorkflowRunsResponse, error) {
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
			endDate := strconv.FormatInt(time.Now().Unix(), 10)
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
	workflowsCursor, err := c.chaosWorkflowOperator.GetAggregateWorkflows(pipeline)
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
func (c *ChaosWorkflowHandler) ListWorkflows(request model.ListWorkflowsRequest) (*model.ListWorkflowsResponse, error) {
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
	workflowsCursor, err := c.chaosWorkflowOperator.GetAggregateWorkflows(pipeline)
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
		cluster, err := c.clusterService.GetCluster(workflow.ClusterID)
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
func (c *ChaosWorkflowHandler) ChaosWorkflowRun(request model.WorkflowRunRequest, r store.StateData) (string, error) {
	var (
		executionData types.ExecutionData
		exeData       []byte
	)

	cluster, err := c.clusterService.VerifyCluster(*request.ClusterID)
	if err != nil {
		log.Error(err)
		return "", err
	}

	// Parse and store execution data
	if request.ExecutionData != "" {
		exeData, err = base64.StdEncoding.DecodeString(request.ExecutionData)
		if err != nil {
			log.Warn("Failed to decode execution data: ", err)

			//Required for backward compatibility of subscribers
			//which are not sending execution data in base64 encoded format
			exeData = []byte(request.ExecutionData)
		}
		err = json.Unmarshal(exeData, &executionData)
		if err != nil {
			log.Error("failed to unmarshal execution data: ", err)
			return "", err
		}
	}

	var workflowRunMetrics types.WorkflowRunMetrics
	// Resiliency Score will be calculated only if workflow execution is completed
	if request.Completed {
		workflowRunMetrics, err = c.chaosWorkflowService.ProcessCompletedWorkflowRun(executionData, request.WorkflowID)
		if err != nil {
			return "", err
		}
	}

	count := 0
	isRemoved := false
	count, err = c.chaosWorkflowOperator.UpdateWorkflowRun(request.WorkflowID, dbSchemaWorkflow.ChaosWorkflowRun{
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
		ExecutionData:      string(exeData),
		Completed:          request.Completed,
		IsRemoved:          &isRemoved,
		ExecutedBy:         request.ExecutedBy,
	})

	if err != nil {
		log.Error(err)
		return "", err
	}

	if count == 0 {
		return "Workflow Run Discarded[Duplicate Event]", nil
	}

	c.chaosWorkflowService.SendWorkflowEvent(model.WorkflowRun{
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
func (c *ChaosWorkflowHandler) PodLog(request model.PodLog, r store.StateData) (string, error) {
	_, err := c.clusterService.VerifyCluster(*request.ClusterID)
	if err != nil {
		log.Error(err)
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
func (c *ChaosWorkflowHandler) GetLogs(reqID string, pod model.PodLogRequest, r store.StateData) {
	data, err := json.Marshal(pod)
	if err != nil {
		log.Error("error while marshalling pod details")
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
func (c *ChaosWorkflowHandler) ReRunChaosWorkFlow(projectID string, workflowID string, username string) (string, error) {
	query := bson.D{
		{"project_id", projectID},
		{"workflow_id", workflowID},
		{"isRemoved", false},
	}

	workflows, err := c.chaosWorkflowOperator.GetWorkflows(query)
	if err != nil {
		log.Error("could not get workflow :", err)
		return "could not get workflow", err
	}
	if len(workflows) == 0 {
		return "", errors.New("no such workflow found")
	}
	resKind := gjson.Get(workflows[0].WorkflowManifest, "kind").String()
	if strings.ToLower(resKind) == "cronworkflow" { // no op
		return "", errors.New("cronworkflows cannot be re-run")
	}

	cluster, err := c.clusterService.GetCluster(workflows[0].ClusterID)
	if err != nil {
		return "", errors.New(err.Error())
	}
	if cluster.IsActive != true {
		log.Error("agent not active to re-run the workflow")
		return "", errors.New("agent not active to re-run the selected workflow")
	}

	workflows[0].WorkflowManifest, err = sjson.Set(workflows[0].WorkflowManifest, "metadata.name", workflows[0].WorkflowName+"-"+strconv.FormatInt(time.Now().Unix(), 10))
	if err != nil {
		log.Error("failed to updated workflow name [re-run] :", err)
		return "", errors.New("failed to updated workflow name " + err.Error())
	}

	chaosWorkflow.SendWorkflowToSubscriber(&model.ChaosWorkFlowRequest{
		WorkflowManifest: workflows[0].WorkflowManifest,
		ProjectID:        workflows[0].ProjectID,
		ClusterID:        workflows[0].ClusterID,
	}, &username, nil, "create", store.Store)

	return "Request for re-run acknowledged, workflowID: " + workflowID, nil
}

// KubeObj receives Kubernetes Object data from subscriber
func (c *ChaosWorkflowHandler) KubeObj(request model.KubeObjectData, r store.StateData) (string, error) {
	_, err := c.clusterService.VerifyCluster(*request.ClusterID)
	if err != nil {
		log.Error(err)
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

func (c *ChaosWorkflowHandler) GetKubeObjData(reqID string, kubeObject model.KubeObjectRequest, r store.StateData) {
	reqType := kubeObject.ObjectType
	data, err := json.Marshal(kubeObject)
	if err != nil {
		log.Error("error while marshalling pod details")
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
func (c *ChaosWorkflowHandler) CreateWorkflowTemplate(ctx context.Context, request *model.TemplateInput) (*model.WorkflowTemplate, error) {
	IsExist, err := c.isTemplateAvailable(ctx, request.TemplateName, request.ProjectID)
	if err != nil {
		return nil, err
	}
	if IsExist == true {
		return nil, errors.New("template already exists")
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

	err = c.chaosWorkflowTemplateOperator.CreateWorkflowTemplate(ctx, template)
	if err != nil {
		log.Error(err)
	}
	return template.GetWorkflowTemplateOutput(), nil
}

// ListWorkflowManifests is used to list all the workflow templates available in the project
func (c *ChaosWorkflowHandler) ListWorkflowManifests(ctx context.Context, projectID string) ([]*model.WorkflowTemplate, error) {
	templates, err := c.chaosWorkflowTemplateOperator.GetTemplatesByProjectID(ctx, projectID)
	if err != nil {
		return nil, err
	}
	var templateList []*model.WorkflowTemplate

	for _, template := range templates {
		templateList = append(templateList, template.GetWorkflowTemplateOutput())
	}
	return templateList, err
}

// GetWorkflowManifestByID is used to fetch the workflow template with template id
func (c *ChaosWorkflowHandler) GetWorkflowManifestByID(ctx context.Context, templateID string) (*model.WorkflowTemplate, error) {
	template, err := c.chaosWorkflowTemplateOperator.GetTemplateByTemplateID(ctx, templateID)
	if err != nil {
		return nil, err
	}
	return template.GetWorkflowTemplateOutput(), err
}

// DeleteWorkflowTemplate is used to delete the workflow template (update the is_removed field as true)
func (c *ChaosWorkflowHandler) DeleteWorkflowTemplate(ctx context.Context, projectID string, templateID string) (bool, error) {
	query := bson.D{
		{"project_id", projectID},
		{"template_id", templateID},
	}
	update := bson.D{{"$set", bson.D{{"is_removed", true}}}}
	err := c.chaosWorkflowTemplateOperator.UpdateTemplateManifest(ctx, query, update)
	if err != nil {
		log.Error(err)
		return false, err
	}
	return true, err
}

// isTemplateAvailable is used to check if a template name already exists in the database
func (c *ChaosWorkflowHandler) isTemplateAvailable(ctx context.Context, templateName string, projectID string) (bool, error) {
	templates, err := c.chaosWorkflowTemplateOperator.GetTemplatesByProjectID(ctx, projectID)
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

func (c *ChaosWorkflowHandler) SyncWorkflowRun(ctx context.Context, projectID string, workflowID string, workflowRunID string, r *store.StateData) (bool, error) {
	query := bson.D{
		{"workflow_id", workflowID},
		{"project_id", projectID},
	}
	workflow, err := c.chaosWorkflowOperator.GetWorkflow(query)
	if err != nil {
		return false, err
	}

	for _, workflowRun := range workflow.WorkflowRuns {
		if workflow.IsRemoved == true {
			return false, errors.New("workflow has been removed")
		}

		if workflowRun.WorkflowRunID == workflowRunID && !workflowRun.Completed && workflow.IsRemoved == false {
			err = c.chaosWorkflowService.ProcessWorkflowRunSync(workflowID, &workflowRunID, workflow, r)
			if err != nil {
				return false, err
			}
		}

	}

	return true, nil
}

// QueryServerVersion is used to fetch the version of the server
func (c *ChaosWorkflowHandler) QueryServerVersion(ctx context.Context) (*model.ServerVersionResponse, error) {
	dbVersion, err := config.GetConfig(ctx, "version", c.mongodbOperator)
	if err != nil {
		return nil, err
	}
	return &model.ServerVersionResponse{
		Key:   dbVersion.Key,
		Value: dbVersion.Value.(string),
	}, nil
}
