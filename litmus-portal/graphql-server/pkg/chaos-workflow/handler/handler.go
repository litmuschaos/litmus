package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"

	"github.com/jinzhu/copier"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
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
	input, err := ops.ProcessWorkflow(input)
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
	workflows, err := dbOperationsWorkflow.GetWorkflows(query)
	if len(workflows) == 0 {
		return false, errors.New("no such workflow found")
	}

	wf := model.ChaosWorkFlowInput{
		ProjectID:    workflows[0].ProjectID,
		WorkflowID:   &workflows[0].WorkflowID,
		WorkflowName: workflows[0].WorkflowName,
	}

	// gitOps delete
	err = gitOpsHandler.DeleteWorkflowFromGit(ctx, &wf)
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

	// GitOps Update
	err = gitOpsHandler.UpsertWorkflowToGit(ctx, input)
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

// QueryWorkflowRuns sends all the workflow runs for a project from the DB
func QueryWorkflowRuns(input model.GetWorkflowRunsInput) (*model.GetWorkflowsOutput, error) {
	var pipeline mongo.Pipeline

	// Match with projectID
	matchStage := bson.D{
		{"$match", bson.D{
			{"project_id", input.ProjectID},
		}},
	}
	pipeline = append(pipeline, matchStage)

	includeAllFromWorkflow := bson.D{
		{"workflow_id", 1},
		{"workflow_name", 1},
		{"workflow_manifest", 1},
		{"cronSyntax", 1},
		{"workflow_description", 1},
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

	// Match the pipelineIds from the input array
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
			filterWfRunDateStage := bson.D{
				{"$project", append(includeAllFromWorkflow,
					bson.E{Key: "workflow_runs", Value: bson.D{
						{"$filter", bson.D{
							{"input", "$workflow_runs"},
							{"as", "wfRun"},
							{"cond", bson.D{
								{"$and", bson.A{
									bson.D{{"$lte", bson.A{"$$wfRun.last_updated", input.Filter.DateRange.EndDate}}},
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
	case input.Sort != nil && input.Sort.Field == model.WorkflowRunSortingFieldTime:
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
	case input.Sort != nil && input.Sort.Field == model.WorkflowRunSortingFieldName:
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

	var result []*model.WorkflowRun

	var workflows []dbSchemaWorkflow.AggregatedWorkflowRuns

	if err = workflowsCursor.All(context.Background(), &workflows); err != nil {
		fmt.Println(err)
		return &model.GetWorkflowsOutput{
			TotalNoOfWorkflowRuns: 0,
			WorkflowRuns:          result,
		}, nil
	}

	for _, workflow := range workflows[0].FlattenedWorkflowRuns {
		workflowRun := workflow.WorkflowRuns

		newWorkflowRun := model.WorkflowRun{
			WorkflowName:      workflow.WorkflowName,
			WorkflowID:        workflow.WorkflowID,
			WorkflowRunID:     workflowRun.WorkflowRunID,
			LastUpdated:       workflowRun.LastUpdated,
			ProjectID:         workflow.ProjectID,
			ClusterID:         workflow.ClusterID,
			Phase:             workflowRun.Phase,
			ResiliencyScore:   workflowRun.ResiliencyScore,
			ExperimentsPassed: workflowRun.ExperimentsPassed,
			TotalExperiments:  workflowRun.TotalExperiments,
			ExecutionData:     workflowRun.ExecutionData,
			ClusterName:       workflow.ClusterName,
			ClusterType:       &workflow.ClusterType,
		}
		result = append(result, &newWorkflowRun)
	}

	totalFilteredWorkflowRuns := 0
	if len(workflows) > 0 && len(workflows[0].TotalFilteredWorkflowRuns) > 0 {
		totalFilteredWorkflowRuns = workflows[0].TotalFilteredWorkflowRuns[0].Count
	}

	output := model.GetWorkflowsOutput{
		TotalNoOfWorkflowRuns: totalFilteredWorkflowRuns,
		WorkflowRuns:          result,
	}
	return &output, nil
}

// Deprecated
func QueryWorkflows(project_id string) ([]*model.ScheduledWorkflows, error) {
	chaosWorkflows, err := dbOperationsWorkflow.GetWorkflows(bson.D{{"project_id", project_id}})
	if err != nil {
		return nil, err
	}

	result := []*model.ScheduledWorkflows{}
	for _, workflow := range chaosWorkflows {
		cluster, err := dbOperationsCluster.GetCluster(workflow.ClusterID)
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

// QueryListWorkflow returns all the workflows present in the given project
func QueryListWorkflow(project_id string, workflowIds []*string) ([]*model.Workflow, error) {
	var query bson.D
	if len(workflowIds) != 0 {
		query = bson.D{
			{"project_id", project_id},
			{"workflow_id", bson.M{"$in": workflowIds}},
		}
	} else {
		query = bson.D{
			{"project_id", project_id},
		}
	}
	chaosWorkflows, err := dbOperationsWorkflow.GetWorkflows(query)

	if err != nil {
		return nil, err
	}
	var result []*model.Workflow
	for _, workflow := range chaosWorkflows {
		cluster, err := dbOperationsCluster.GetCluster(workflow.ClusterID)
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

// WorkFlowRunHandler Updates or Inserts a new Workflow Run into the DB
func WorkFlowRunHandler(input model.WorkflowRunInput, r store.StateData) (string, error) {
	cluster, err := cluster.VerifyCluster(*input.ClusterID)
	if err != nil {
		log.Println("ERROR", err)
		return "", err
	}

	// Parse and store execution data
	var executionData dbSchemaWorkflow.ExecutionData
	err = json.Unmarshal([]byte(input.ExecutionData), &executionData)
	if err != nil {
		log.Println("Can not parse Execution Data of workflow run with id: ", input.WorkflowRunID)
		return "", err
	}

	// Resiliency Score will be calculated only if workflow execution is completed
	if input.Completed {
		executionData = ops.ResiliencyScoreCalculator(executionData, input.WorkflowID)
	}

	count := 0
	count, err = dbOperationsWorkflow.UpdateWorkflowRun(input.WorkflowID, dbSchemaWorkflow.ChaosWorkflowRun{
		WorkflowRunID:     input.WorkflowRunID,
		LastUpdated:       strconv.FormatInt(time.Now().Unix(), 10),
		Phase:             executionData.Phase,
		ResiliencyScore:   &executionData.ResiliencyScore,
		ExperimentsPassed: &executionData.ExperimentsPassed,
		TotalExperiments:  &executionData.TotalExperiments,
		ExecutionData:     input.ExecutionData,
		Completed:         input.Completed,
	})
	if err != nil {
		log.Print("ERROR", err)
		return "", err
	}

	if count == 0 {
		return "Workflow Run Discarded[Duplicate Event]", nil
	}

	ops.SendWorkflowEvent(model.WorkflowRun{
		ClusterID:         cluster.ClusterID,
		ClusterName:       cluster.ClusterName,
		ProjectID:         cluster.ProjectID,
		LastUpdated:       strconv.FormatInt(time.Now().Unix(), 10),
		WorkflowRunID:     input.WorkflowRunID,
		WorkflowName:      input.WorkflowName,
		Phase:             executionData.Phase,
		ResiliencyScore:   &executionData.ResiliencyScore,
		ExperimentsPassed: &executionData.ExperimentsPassed,
		TotalExperiments:  &executionData.TotalExperiments,
		ExecutionData:     input.ExecutionData,
		WorkflowID:        input.WorkflowID,
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
	}, "create", store.Store)

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
