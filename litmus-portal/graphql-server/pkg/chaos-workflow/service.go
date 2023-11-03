package chaos_workflow

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	"github.com/ghodss/yaml"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	scheduleTypes "github.com/litmuschaos/chaos-scheduler/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbSchemaWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	workflowDBOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"go.mongodb.org/mongo-driver/bson"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

type Service interface {
	ProcessWorkflow(workflow *model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowRequest, *dbSchemaWorkflow.ChaosWorkflowType, error)
	ProcessWorkflowCreation(input *model.ChaosWorkFlowRequest, username string, wfType *dbSchemaWorkflow.ChaosWorkflowType, r *store.StateData) error
	ProcessWorkflowUpdate(workflow *model.ChaosWorkFlowRequest, username string, wfType *dbSchemaWorkflow.ChaosWorkflowType, r *store.StateData) error
	ProcessWorkflowRunDelete(query bson.D, workflowRunID *string, workflow workflowDBOps.ChaosWorkFlowRequest, username string, r *store.StateData) error
	ProcessWorkflowDelete(query bson.D, workflow workflowDBOps.ChaosWorkFlowRequest, username string, r *store.StateData) error
	ProcessCompletedWorkflowRun(execData ExecutionData, wfID string) (WorkflowRunMetrics, error)
	SendWorkflowEvent(wfRun model.WorkflowRun, r *store.StateData)
	ProcessWorkflowRunSync(workflowID string, workflowRunID *string, workflow workflowDBOps.ChaosWorkFlowRequest, r *store.StateData) error
	GetWorkflow(query bson.D) (dbOperationsWorkflow.ChaosWorkFlowRequest, error)
	GetWorkflows(query bson.D) ([]dbOperationsWorkflow.ChaosWorkFlowRequest, error)
}

// chaosWorkflowService is the implementation of the chaos workflow service
type chaosWorkflowService struct {
	chaosWorkflowOperator *dbOperationsWorkflow.Operator
	clusterOperator       *dbOperationsCluster.Operator
}

// NewService returns a new instance of the chaos workflow service
func NewService(chaosWorkflowOperator *dbOperationsWorkflow.Operator, clusterOperator *dbOperationsCluster.Operator) Service {
	return &chaosWorkflowService{
		chaosWorkflowOperator: chaosWorkflowOperator,
		clusterOperator:       clusterOperator,
	}
}

// ProcessWorkflow takes the workflow and processes it as required
func (c *chaosWorkflowService) ProcessWorkflow(workflow *model.ChaosWorkFlowRequest) (*model.ChaosWorkFlowRequest, *dbSchemaWorkflow.ChaosWorkflowType, error) {
	// security check for cluster access
	cluster, err := c.clusterOperator.GetCluster(workflow.ClusterID)
	if err != nil {
		return nil, nil, err
	}

	if cluster.ProjectID != workflow.ProjectID {
		return nil, nil, errors.New("cluster doesn't belong to this project")
	}

	wfType := dbSchemaWorkflow.Workflow
	var (
		workflow_id = uuid.New().String()
		weights     = make(map[string]int)
		objmeta     unstructured.Unstructured
	)

	if len(workflow.Weightages) > 0 {
		for _, weight := range workflow.Weightages {
			weights[weight.ExperimentName] = weight.Weightage
		}
	}

	if workflow.WorkflowID == nil || (*workflow.WorkflowID) == "" {
		workflow.WorkflowID = &workflow_id
	}

	err = json.Unmarshal([]byte(workflow.WorkflowManifest), &objmeta)
	if err != nil {
		return nil, nil, errors.New("failed to unmarshal workflow manifest1")
	}

	// workflow name in struct should match with actual workflow name
	if workflow.WorkflowName != objmeta.GetName() {
		return nil, nil, errors.New(objmeta.GetKind() + " name doesn't match")
	}

	switch strings.ToLower(objmeta.GetKind()) {
	case "workflow":
		{
			err = processWorkflowManifest(workflow, weights)
			if err != nil {
				return nil, nil, err
			}
		}
	case "cronworkflow":
		{
			err = processCronWorkflowManifest(workflow, weights)
			if err != nil {
				return nil, nil, err
			}
		}
	case "chaosengine":
		{
			wfType = dbSchemaWorkflow.ChaosEngine
			err = processChaosEngineManifest(workflow, weights)
			if err != nil {
				return nil, nil, err
			}
		}
	case "chaosschedule":
		{
			wfType = dbSchemaWorkflow.ChaosEngine
			err = processChaosScheduleManifest(workflow, weights)
			if err != nil {
				return nil, nil, err
			}
		}
	default:
		{
			return nil, nil, errors.New("not a valid object, only workflows/cronworkflows/chaosengines supported")
		}
	}

	return workflow, &wfType, nil
}

// ProcessWorkflowCreation creates new workflow entry and sends the workflow to the specific agent for execution
func (c *chaosWorkflowService) ProcessWorkflowCreation(input *model.ChaosWorkFlowRequest, username string, wfType *dbSchemaWorkflow.ChaosWorkflowType, r *store.StateData) error {
	var Weightages []*dbSchemaWorkflow.WeightagesInput
	if input.Weightages != nil {
		copier.Copy(&Weightages, &input.Weightages)
	}

	// Get cluster information
	cluster, err := c.clusterOperator.GetCluster(input.ClusterID)
	if err != nil {
		return err
	}

	newChaosWorkflow := dbSchemaWorkflow.ChaosWorkFlowRequest{
		WorkflowID:          *input.WorkflowID,
		WorkflowManifest:    input.WorkflowManifest,
		CronSyntax:          input.CronSyntax,
		WorkflowName:        input.WorkflowName,
		WorkflowDescription: input.WorkflowDescription,
		WorkflowType:        *wfType,
		IsCustomWorkflow:    input.IsCustomWorkflow,
		ProjectID:           input.ProjectID,
		ClusterID:           input.ClusterID,
		ClusterName:         cluster.ClusterName,
		ClusterType:         cluster.ClusterType,
		Weightages:          Weightages,
		CreatedAt:           strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:           strconv.FormatInt(time.Now().Unix(), 10),
		WorkflowRuns:        []*dbSchemaWorkflow.ChaosWorkflowRun{},
		IsRemoved:           false,
		LastUpdatedBy:       username,
	}

	err = c.chaosWorkflowOperator.InsertChaosWorkflow(newChaosWorkflow)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(input, &username, nil, "create", r)
	}

	return nil
}

// ProcessWorkflowUpdate updates the workflow entry and sends update resource request to required agent
func (c *chaosWorkflowService) ProcessWorkflowUpdate(workflow *model.ChaosWorkFlowRequest, username string, wfType *dbSchemaWorkflow.ChaosWorkflowType, r *store.StateData) error {
	var Weightages []*dbSchemaWorkflow.WeightagesInput
	if workflow.Weightages != nil {
		copier.Copy(&Weightages, &workflow.Weightages)
	}

	query := bson.D{{"workflow_id", workflow.WorkflowID}, {"project_id", workflow.ProjectID}}
	update := bson.D{{"$set", bson.D{{"workflow_manifest", workflow.WorkflowManifest}, {"type", *wfType}, {"cronSyntax", workflow.CronSyntax}, {"workflow_name", workflow.WorkflowName}, {"workflow_description", workflow.WorkflowDescription}, {"isCustomWorkflow", workflow.IsCustomWorkflow}, {"weightages", Weightages}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}, {"last_updated_by", username}}}}

	err := c.chaosWorkflowOperator.UpdateChaosWorkflow(query, update)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(workflow, &username, nil, "update", r)
	}
	return nil
}

// ProcessWorkflowDelete deletes the workflow entry and sends delete resource request to required agent
func (c *chaosWorkflowService) ProcessWorkflowDelete(query bson.D, workflow workflowDBOps.ChaosWorkFlowRequest, username string, r *store.StateData) error {

	update := bson.D{{"$set", bson.D{{"isRemoved", true}, {"last_updated_by", username}}}}
	err := c.chaosWorkflowOperator.UpdateChaosWorkflow(query, update)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(&model.ChaosWorkFlowRequest{
			ProjectID:        workflow.ProjectID,
			ClusterID:        workflow.ClusterID,
			WorkflowManifest: workflow.WorkflowManifest,
		}, &username, nil, "delete", r)
	}
	return nil
}

// ProcessWorkflowRunDelete deletes a workflow entry and updates the database
func (c *chaosWorkflowService) ProcessWorkflowRunDelete(query bson.D, workflowRunID *string, workflow workflowDBOps.ChaosWorkFlowRequest, username string, r *store.StateData) error {
	update := bson.D{{"$set", bson.D{{"workflow_runs", workflow.WorkflowRuns}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err := c.chaosWorkflowOperator.UpdateChaosWorkflow(query, update)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(&model.ChaosWorkFlowRequest{
			ProjectID: workflow.ProjectID,
			ClusterID: workflow.ClusterID,
		}, &username, workflowRunID, "workflow_delete", r)
	}
	return nil
}

func (c *chaosWorkflowService) ProcessWorkflowRunSync(workflowID string, workflowRunID *string, workflow workflowDBOps.ChaosWorkFlowRequest, r *store.StateData) error {
	var extData WorkflowSyncExternalData
	extData.WorkflowID = workflowID
	extData.WorkflowRunID = *workflowRunID

	strB, err := json.Marshal(extData)
	if err != nil {
		return err
	}

	str := string(strB)
	if r != nil {
		SendWorkflowToSubscriber(&model.ChaosWorkFlowRequest{
			ProjectID: workflow.ProjectID,
			ClusterID: workflow.ClusterID,
		}, nil, &str, "workflow_sync", r)
	}
	return nil
}

// SendWorkflowEvent sends workflow events from the clusters to the appropriate users listening for the events
func (c *chaosWorkflowService) SendWorkflowEvent(wfRun model.WorkflowRun, r *store.StateData) {
	r.Mutex.Lock()
	if r.WorkflowEventPublish != nil {
		for _, observer := range r.WorkflowEventPublish[wfRun.ProjectID] {
			observer <- &wfRun
		}
	}
	r.Mutex.Unlock()
}

// ProcessCompletedWorkflowRun calculates the Resiliency Score and returns the updated ExecutionData
func (c *chaosWorkflowService) ProcessCompletedWorkflowRun(execData ExecutionData, wfID string) (WorkflowRunMetrics, error) {
	var weightSum, totalTestResult = 0, 0
	var result WorkflowRunMetrics

	chaosWorkflows, err := c.chaosWorkflowOperator.GetWorkflows(bson.D{{"workflow_id", wfID}})
	if err != nil {
		return result, fmt.Errorf("failed to get workflow from db on complete, error: %w", err)
	}
	if len(chaosWorkflows) != 1 {
		return result, fmt.Errorf("failed to get workflow from db on complete, error: couldn't find the unique workflow with id %v", wfID)
	}

	result.TotalExperiments = len(chaosWorkflows[0].Weightages)
	weightMap := map[string]int{}
	for _, weightEntry := range chaosWorkflows[0].Weightages {
		weightMap[weightEntry.ExperimentName] = weightEntry.Weightage
		// Total weight calculated for all experiments
		weightSum = weightSum + weightEntry.Weightage
	}

	for _, value := range execData.Nodes {
		if value.Type == "ChaosEngine" {
			experimentName := ""
			if value.ChaosExp == nil {
				continue
			}
			for expName := range weightMap {
				if strings.Contains(value.ChaosExp.EngineName, expName) {
					experimentName = expName
				}
			}
			weight, ok := weightMap[experimentName]
			// probeSuccessPercentage will be included only if chaosData is present
			if ok {
				x, _ := strconv.Atoi(value.ChaosExp.ProbeSuccessPercentage)
				totalTestResult += weight * x
			}
			if value.ChaosExp.ExperimentVerdict == "Pass" {
				result.ExperimentsPassed += 1
			}
			if value.ChaosExp.ExperimentVerdict == "Fail" {
				result.ExperimentsFailed += 1
			}
			if value.ChaosExp.ExperimentVerdict == "Awaited" {
				result.ExperimentsAwaited += 1
			}
			if value.ChaosExp.ExperimentVerdict == "Stopped" {
				result.ExperimentsStopped += 1
			}
			if value.ChaosExp.ExperimentVerdict == "N/A" || value.ChaosExp.ExperimentVerdict == "" {
				result.ExperimentsNA += 1
			}
		}
	}
	if weightSum != 0 {
		result.ResiliencyScore = utils.Truncate(float64(totalTestResult) / float64(weightSum))
	}

	return result, nil
}

func updateManifestLabels(labels map[string]string, workflowID string, clusterID string, requiresType bool) map[string]string {
	if labels == nil {
		labels = map[string]string{}
	}
	labels["workflow_id"] = workflowID
	labels["cluster_id"] = clusterID
	if requiresType {
		labels["type"] = "standalone_workflow"
	} else {
		labels["workflows.argoproj.io/controller-instanceid"] = clusterID
	}
	return labels
}

func generateFaultWeights(templates []v1alpha1.Template, weights map[string]int) ([]v1alpha1.Template, []*model.WeightagesInput, error) {
	var newWeights []*model.WeightagesInput

	for i, template := range templates {
		artifact := template.Inputs.Artifacts
		if len(artifact) > 0 && artifact[0].Raw != nil {
			data := artifact[0].Raw.Data
			if len(data) > 0 {
				// This replacement is required because chaos engine yaml have a syntax template. example:{{ workflow.parameters.adminModeNamespace }}
				// And it is not able the unmarshal the yamlstring to chaos engine struct
				data = strings.ReplaceAll(data, "{{", "")
				data = strings.ReplaceAll(data, "}}", "")

				var meta chaosTypes.ChaosEngine
				err := yaml.Unmarshal([]byte(data), &meta)
				if err != nil {
					return nil, nil, fmt.Errorf("failed to unmarshal chaosengine %v", err)
				}

				if strings.ToLower(meta.Kind) == "chaosengine" {
					var exprname string
					if len(meta.Spec.Experiments) > 0 {
						exprname = meta.GenerateName
						if len(exprname) == 0 {
							return nil, nil, errors.New("empty chaos experiment name")
						}
					} else {
						return nil, nil, errors.New("no experiments specified in chaosengine - " + meta.Name)
					}

					if val, ok := weights[exprname]; ok {
						templates[i].Metadata.Labels = map[string]string{
							"weight": strconv.Itoa(val),
						}
					} else if val, ok := templates[i].Metadata.Labels["weight"]; ok {
						intVal, err := strconv.Atoi(val)
						if err != nil {
							return nil, nil, errors.New("failed to convert")
						}
						newWeights = append(newWeights, &model.WeightagesInput{
							ExperimentName: exprname,
							Weightage:      intVal,
						})
					} else {
						newWeights = append(newWeights, &model.WeightagesInput{
							ExperimentName: exprname,
							Weightage:      10,
						})

						templates[i].Metadata.Labels = map[string]string{
							"weight": "10",
						}
					}
				}
			}
		}
	}

	return templates, newWeights, nil
}

func processWorkflowManifest(workflow *model.ChaosWorkFlowRequest, weights map[string]int) error {
	var (
		newWeights       []*model.WeightagesInput
		workflowManifest v1alpha1.Workflow
	)
	err := json.Unmarshal([]byte(workflow.WorkflowManifest), &workflowManifest)
	if err != nil {
		return errors.New("failed to unmarshal workflow manifest")
	}

	workflowManifest.Labels = updateManifestLabels(workflowManifest.Labels, *workflow.WorkflowID, workflow.ClusterID, false)

	workflowManifest.Spec.Templates, newWeights, err = generateFaultWeights(workflowManifest.Spec.Templates, weights)
	if err != nil {
		return err
	}

	workflow.Weightages = append(workflow.Weightages, newWeights...)
	out, err := json.Marshal(workflowManifest)
	if err != nil {
		return err
	}

	workflow.WorkflowManifest = string(out)
	return nil
}

func processCronWorkflowManifest(workflow *model.ChaosWorkFlowRequest, weights map[string]int) error {
	var (
		newWeights           []*model.WeightagesInput
		cronWorkflowManifest v1alpha1.CronWorkflow
	)

	err := json.Unmarshal([]byte(workflow.WorkflowManifest), &cronWorkflowManifest)
	if err != nil {
		return errors.New("failed to unmarshal workflow manifest")
	}

	cronWorkflowManifest.Labels = updateManifestLabels(cronWorkflowManifest.Labels, *workflow.WorkflowID, workflow.ClusterID, false)

	if cronWorkflowManifest.Spec.WorkflowMetadata == nil {
		cronWorkflowManifest.Spec.WorkflowMetadata = &v1.ObjectMeta{}
	}
	cronWorkflowManifest.Spec.WorkflowMetadata.Labels = updateManifestLabels(cronWorkflowManifest.Spec.WorkflowMetadata.Labels, *workflow.WorkflowID, workflow.ClusterID, false)

	cronWorkflowManifest.Spec.WorkflowSpec.Templates, newWeights, err = generateFaultWeights(cronWorkflowManifest.Spec.WorkflowSpec.Templates, weights)

	if err != nil {
		return err
	}

	workflow.Weightages = append(workflow.Weightages, newWeights...)
	out, err := json.Marshal(cronWorkflowManifest)
	if err != nil {
		return err
	}
	workflow.WorkflowManifest = string(out)
	return nil
}

func processChaosEngineManifest(workflow *model.ChaosWorkFlowRequest, weights map[string]int) error {
	var (
		newWeights       []*model.WeightagesInput
		workflowManifest chaosTypes.ChaosEngine
	)
	err := json.Unmarshal([]byte(workflow.WorkflowManifest), &workflowManifest)
	if err != nil {
		return errors.New("failed to unmarshal workflow manifest")
	}

	workflowManifest.Labels = updateManifestLabels(workflowManifest.Labels, *workflow.WorkflowID, workflow.ClusterID, true)

	if len(workflowManifest.Spec.Experiments) == 0 {
		return errors.New("no experiments specified in chaosengine - " + workflowManifest.Name)
	}
	exprname := workflowManifest.GenerateName
	if len(exprname) == 0 {
		return errors.New("empty chaos experiment name")
	}
	if val, ok := weights[exprname]; ok {
		workflowManifest.Labels["weight"] = strconv.Itoa(val)
	} else if val, ok := workflowManifest.Labels["weight"]; ok {
		intVal, err := strconv.Atoi(val)
		if err != nil {
			return errors.New("failed to convert")
		}
		newWeights = append(newWeights, &model.WeightagesInput{
			ExperimentName: exprname,
			Weightage:      intVal,
		})
	} else {
		newWeights = append(newWeights, &model.WeightagesInput{
			ExperimentName: exprname,
			Weightage:      10,
		})
		workflowManifest.Labels["weight"] = "10"
	}
	workflow.Weightages = append(workflow.Weightages, newWeights...)
	out, err := json.Marshal(workflowManifest)
	if err != nil {
		return err
	}

	workflow.WorkflowManifest = string(out)
	return nil
}

func processChaosScheduleManifest(workflow *model.ChaosWorkFlowRequest, weights map[string]int) error {
	var (
		newWeights       []*model.WeightagesInput
		workflowManifest scheduleTypes.ChaosSchedule
	)
	err := json.Unmarshal([]byte(workflow.WorkflowManifest), &workflowManifest)
	if err != nil {
		return errors.New("failed to unmarshal workflow manifest")
	}

	workflowManifest.Labels = updateManifestLabels(workflowManifest.Labels, *workflow.WorkflowID, workflow.ClusterID, true)

	if len(workflowManifest.Spec.EngineTemplateSpec.Experiments) == 0 {
		return errors.New("no experiments specified in chaosengine - " + workflowManifest.Name)
	}
	exprname := workflowManifest.GenerateName
	if len(exprname) == 0 {
		return errors.New("empty chaos experiment name")
	}
	if val, ok := weights[exprname]; ok {
		workflowManifest.Labels["weight"] = strconv.Itoa(val)
	} else if val, ok := workflowManifest.Labels["weight"]; ok {
		intVal, err := strconv.Atoi(val)
		if err != nil {
			return errors.New("failed to convert")
		}
		newWeights = append(newWeights, &model.WeightagesInput{
			ExperimentName: exprname,
			Weightage:      intVal,
		})
	} else {
		newWeights = append(newWeights, &model.WeightagesInput{
			ExperimentName: exprname,
			Weightage:      10,
		})
		workflowManifest.Labels["weight"] = "10"
	}
	workflow.Weightages = append(workflow.Weightages, newWeights...)
	out, err := json.Marshal(workflowManifest)
	if err != nil {
		return err
	}

	workflow.WorkflowManifest = string(out)
	return nil
}

func (c *chaosWorkflowService) GetWorkflow(query bson.D) (dbOperationsWorkflow.ChaosWorkFlowRequest, error) {
	return c.chaosWorkflowOperator.GetWorkflow(query)
}

// GetWorkflows returns the list of workflows
func (c *chaosWorkflowService) GetWorkflows(query bson.D) ([]dbOperationsWorkflow.ChaosWorkFlowRequest, error) {
	return c.chaosWorkflowOperator.GetWorkflows(query)
}
