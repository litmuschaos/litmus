package ops

import (
	"encoding/json"
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/argoproj/argo/pkg/apis/workflow/v1alpha1"
	"github.com/ghodss/yaml"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	chaosTypes "github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	scheduleTypes "github.com/litmuschaos/chaos-scheduler/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	chaos_workflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	types "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/chaos-workflow"
	clusterOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	clusterHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster/handler"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbSchemaWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	workflowDBOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	"github.com/tidwall/gjson"
	"go.mongodb.org/mongo-driver/bson"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

// ProcessWorkflow takes the workflow and processes it as required
func ProcessWorkflow(workflow *model.ChaosWorkFlowInput) (*model.ChaosWorkFlowInput, *dbSchemaWorkflow.ChaosWorkflowType, error) {
	// security check for cluster access
	cluster, err := dbOperationsCluster.GetCluster(workflow.ClusterID)
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

	if workflow.WorkflowID == nil {
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
			err = processChaosengineManifest(workflow, weights)
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
func ProcessWorkflowCreation(input *model.ChaosWorkFlowInput, wfType *dbSchemaWorkflow.ChaosWorkflowType, r *store.StateData) error {
	var Weightages []*dbSchemaWorkflow.WeightagesInput
	if input.Weightages != nil {
		copier.Copy(&Weightages, &input.Weightages)
	}

	// Get cluster information
	cluster, err := dbOperationsCluster.GetCluster(input.ClusterID)
	if err != nil {
		return err
	}

	newChaosWorkflow := dbSchemaWorkflow.ChaosWorkFlowInput{
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
	}

	err = dbOperationsWorkflow.InsertChaosWorkflow(newChaosWorkflow)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(input, nil, "create", r)
	}

	return nil
}

// ProcessWorkflowUpdate updates the workflow entry and sends update resource request to required agent
func ProcessWorkflowUpdate(workflow *model.ChaosWorkFlowInput, wfType *dbSchemaWorkflow.ChaosWorkflowType, r *store.StateData) error {
	var Weightages []*dbSchemaWorkflow.WeightagesInput
	if workflow.Weightages != nil {
		copier.Copy(&Weightages, &workflow.Weightages)
	}

	query := bson.D{{"workflow_id", workflow.WorkflowID}, {"project_id", workflow.ProjectID}}
	update := bson.D{{"$set", bson.D{{"workflow_manifest", workflow.WorkflowManifest}, {"type", *wfType}, {"cronSyntax", workflow.CronSyntax}, {"workflow_name", workflow.WorkflowName}, {"workflow_description", workflow.WorkflowDescription}, {"isCustomWorkflow", workflow.IsCustomWorkflow}, {"weightages", Weightages}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err := dbOperationsWorkflow.UpdateChaosWorkflow(query, update)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(workflow, nil, "update", r)
	}
	return nil
}

// ProcessWorkflowDelete deletes the workflow entry and sends delete resource request to required agent
func ProcessWorkflowDelete(query bson.D, workflow workflowDBOps.ChaosWorkFlowInput, r *store.StateData) error {

	update := bson.D{{"$set", bson.D{{"isRemoved", true}}}}
	err := dbOperationsWorkflow.UpdateChaosWorkflow(query, update)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(&model.ChaosWorkFlowInput{
			ProjectID:        workflow.ProjectID,
			ClusterID:        workflow.ClusterID,
			WorkflowManifest: workflow.WorkflowManifest,
		}, nil, "delete", r)
	}
	return nil
}

func ProcessWorkflowRunDelete(query bson.D, workflowRunID *string, workflow workflowDBOps.ChaosWorkFlowInput, r *store.StateData) error {
	update := bson.D{{"$set", bson.D{{"workflow_runs", workflow.WorkflowRuns}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err := dbOperationsWorkflow.UpdateChaosWorkflow(query, update)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(&model.ChaosWorkFlowInput{
			ProjectID: workflow.ProjectID,
			ClusterID: workflow.ClusterID,
		}, workflowRunID, "workflow_delete", r)
	}
	return nil
}

func ProcessWorkflowRunSync(workflowID string, workflowRunID *string, workflow workflowDBOps.ChaosWorkFlowInput, r *store.StateData) error {
	var extData chaos_workflow.WorkflowSyncExternalData
	extData.WorkflowID = workflowID
	extData.WorkflowRunID = *workflowRunID

	strB, err := json.Marshal(extData)
	if err != nil {
		return err
	}

	str := string(strB)
	if r != nil {
		SendWorkflowToSubscriber(&model.ChaosWorkFlowInput{
			ProjectID: workflow.ProjectID,
			ClusterID: workflow.ClusterID,
		}, &str, "workflow_sync", r)
	}
	return nil
}

func SendWorkflowToSubscriber(workflow *model.ChaosWorkFlowInput, externalData *string, reqType string, r *store.StateData) {
	workflowNamespace := gjson.Get(workflow.WorkflowManifest, "metadata.namespace").String()

	if workflowNamespace == "" {
		workflowNamespace = os.Getenv("AGENT_NAMESPACE")
	}
	clusterHandler.SendRequestToSubscriber(clusterOps.SubscriberRequests{
		K8sManifest:  workflow.WorkflowManifest,
		RequestType:  reqType,
		ProjectID:    workflow.ProjectID,
		ClusterID:    workflow.ClusterID,
		Namespace:    workflowNamespace,
		ExternalData: externalData,
	}, *r)
}

// SendWorkflowEvent sends workflow events from the clusters to the appropriate users listening for the events
func SendWorkflowEvent(wfRun model.WorkflowRun, r *store.StateData) {
	r.Mutex.Lock()
	if r.WorkflowEventPublish != nil {
		for _, observer := range r.WorkflowEventPublish[wfRun.ProjectID] {
			observer <- &wfRun
		}
	}
	r.Mutex.Unlock()
}

// ResiliencyScoreCalculator calculates the Resiliency Score and returns the updated ExecutionData
func ResiliencyScoreCalculator(execData types.ExecutionData, wfid string) types.ExecutionData {
	var resiliencyScore float64 = 0.0
	var weightSum, totalTestResult, totalExperiments, totalExperimentsPassed int = 0, 0, 0, 0

	chaosWorkflows, _ := dbOperationsWorkflow.GetWorkflows(bson.D{{"workflow_id", bson.M{"$in": []string{wfid}}}})

	totalExperiments = len(chaosWorkflows[0].Weightages)
	weightMap := map[string]int{}
	for _, weightEnty := range chaosWorkflows[0].Weightages {
		weightMap[weightEnty.ExperimentName] = weightEnty.Weightage
		// Total weight calculated for all experiments
		weightSum = weightSum + weightEnty.Weightage
	}

	for _, value := range execData.Nodes {
		if value.Type == "ChaosEngine" {
			if value.ChaosExp == nil {
				continue
			}
			weight, ok := weightMap[value.ChaosExp.ExperimentName]
			// probeSuccessPercentage will be included only if chaosData is present
			if ok {
				x, _ := strconv.Atoi(value.ChaosExp.ProbeSuccessPercentage)
				totalTestResult += weight * x
			}
			if value.ChaosExp.ExperimentVerdict == "Pass" {
				totalExperimentsPassed += 1
			}
		}
	}
	if weightSum != 0 {
		resiliencyScore = float64(totalTestResult) / float64(weightSum)
	}

	execData.ResiliencyScore = resiliencyScore
	execData.ExperimentsPassed = totalExperimentsPassed
	execData.TotalExperiments = totalExperiments

	return execData
}

func processWorkflowManifest(workflow *model.ChaosWorkFlowInput, weights map[string]int) error {
	var (
		newWeights       []*model.WeightagesInput
		workflowManifest v1alpha1.Workflow
	)
	err := json.Unmarshal([]byte(workflow.WorkflowManifest), &workflowManifest)
	if err != nil {
		return errors.New("failed to unmarshal workflow manifest")
	}

	if workflowManifest.Labels == nil {
		workflowManifest.Labels = map[string]string{
			"workflow_id": *workflow.WorkflowID,
			"cluster_id":  workflow.ClusterID,
			"workflows.argoproj.io/controller-instanceid": workflow.ClusterID,
		}
	} else {
		workflowManifest.Labels["workflow_id"] = *workflow.WorkflowID
		workflowManifest.Labels["cluster_id"] = workflow.ClusterID
		workflowManifest.Labels["workflows.argoproj.io/controller-instanceid"] = workflow.ClusterID
	}

	for i, template := range workflowManifest.Spec.Templates {
		artifact := template.Inputs.Artifacts
		if len(artifact) > 0 {
			var data = artifact[0].Raw.Data
			if len(data) > 0 {
				// This replacement is required because chaos engine yaml have a syntax template. example:{{ workflow.parameters.adminModeNamespace }}
				// And it is not able the unmarshal the yamlstring to chaos engine struct
				data = strings.ReplaceAll(data, "{{", "")
				data = strings.ReplaceAll(data, "}}", "")

				var meta chaosTypes.ChaosEngine
				err := yaml.Unmarshal([]byte(data), &meta)
				if err != nil {
					return errors.New("failed to unmarshal chaosengine")
				}

				if strings.ToLower(meta.Kind) == "chaosengine" {
					var exprname string
					if len(meta.Spec.Experiments) > 0 {
						exprname = meta.Spec.Experiments[0].Name
						if len(exprname) == 0 {
							return errors.New("empty chaos experiment name")
						}
					} else {
						return errors.New("no experiments specified in chaosengine - " + meta.Name)
					}

					if val, ok := weights[exprname]; ok {
						workflowManifest.Spec.Templates[i].Metadata.Labels = map[string]string{
							"weight": strconv.Itoa(val),
						}
					} else if val, ok := workflowManifest.Spec.Templates[i].Metadata.Labels["weight"]; ok {
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

						workflowManifest.Spec.Templates[i].Metadata.Labels = map[string]string{
							"weight": "10",
						}
					}
				}
			}
		}
	}

	workflow.Weightages = append(workflow.Weightages, newWeights...)
	out, err := json.Marshal(workflowManifest)
	if err != nil {
		return err
	}

	workflow.WorkflowManifest = string(out)
	return nil
}

func processCronWorkflowManifest(workflow *model.ChaosWorkFlowInput, weights map[string]int) error {
	var (
		newWeights           []*model.WeightagesInput
		cronWorkflowManifest v1alpha1.CronWorkflow
	)

	err := json.Unmarshal([]byte(workflow.WorkflowManifest), &cronWorkflowManifest)
	if err != nil {
		return errors.New("failed to unmarshal workflow manifest")
	}

	if cronWorkflowManifest.Labels == nil {
		cronWorkflowManifest.Labels = map[string]string{
			"workflow_id": *workflow.WorkflowID,
			"cluster_id":  workflow.ClusterID,
			"workflows.argoproj.io/controller-instanceid": workflow.ClusterID,
		}
	} else {
		cronWorkflowManifest.Labels["workflow_id"] = *workflow.WorkflowID
		cronWorkflowManifest.Labels["cluster_id"] = workflow.ClusterID
		cronWorkflowManifest.Labels["workflows.argoproj.io/controller-instanceid"] = workflow.ClusterID
	}

	if cronWorkflowManifest.Spec.WorkflowMetadata == nil {
		cronWorkflowManifest.Spec.WorkflowMetadata = &v1.ObjectMeta{
			Labels: map[string]string{
				"workflow_id": *workflow.WorkflowID,
				"cluster_id":  workflow.ClusterID,
				"workflows.argoproj.io/controller-instanceid": workflow.ClusterID,
			},
		}
	} else {
		if cronWorkflowManifest.Spec.WorkflowMetadata.Labels == nil {
			cronWorkflowManifest.Spec.WorkflowMetadata.Labels = map[string]string{
				"workflow_id": *workflow.WorkflowID,
				"cluster_id":  workflow.ClusterID,
				"workflows.argoproj.io/controller-instanceid": workflow.ClusterID,
			}
		} else {
			cronWorkflowManifest.Spec.WorkflowMetadata.Labels["workflow_id"] = *workflow.WorkflowID
			cronWorkflowManifest.Spec.WorkflowMetadata.Labels["cluster_id"] = workflow.ClusterID
			cronWorkflowManifest.Spec.WorkflowMetadata.Labels["workflows.argoproj.io/controller-instanceid"] = workflow.ClusterID
		}
	}

	for i, template := range cronWorkflowManifest.Spec.WorkflowSpec.Templates {

		artifact := template.Inputs.Artifacts
		if len(artifact) > 0 {
			var data = artifact[0].Raw.Data
			if len(data) > 0 {
				// This replacement is required because chaos engine yaml have a syntax template. example:{{ workflow.parameters.adminModeNamespace }}
				// And it is not able the unmarshal the yamlstring to chaos engine struct
				data = strings.ReplaceAll(data, "{{", "")
				data = strings.ReplaceAll(data, "}}", "")

				var meta chaosTypes.ChaosEngine
				err = yaml.Unmarshal([]byte(data), &meta)
				if err != nil {
					return errors.New("failed to unmarshal chaosengine")
				}

				if strings.ToLower(meta.Kind) == "chaosengine" {
					var exprname string
					if len(meta.Spec.Experiments) > 0 {
						exprname = meta.Spec.Experiments[0].Name
						if len(exprname) == 0 {
							return errors.New("empty chaos experiment name")
						}
					} else {
						return errors.New("no experiments specified in chaosengine - " + meta.Name)
					}
					if val, ok := weights[exprname]; ok {
						cronWorkflowManifest.Spec.WorkflowSpec.Templates[i].Metadata.Labels = map[string]string{
							"weight": strconv.Itoa(val),
						}
					} else if val, ok := cronWorkflowManifest.Spec.WorkflowSpec.Templates[i].Metadata.Labels["weight"]; ok {
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
						cronWorkflowManifest.Spec.WorkflowSpec.Templates[i].Metadata.Labels = map[string]string{
							"weight": "10",
						}
					}
				}
			}
		}
	}

	workflow.Weightages = append(workflow.Weightages, newWeights...)
	out, err := json.Marshal(cronWorkflowManifest)
	if err != nil {
		return err
	}
	workflow.WorkflowManifest = string(out)
	return nil
}

func processChaosengineManifest(workflow *model.ChaosWorkFlowInput, weights map[string]int) error {
	var (
		newWeights       []*model.WeightagesInput
		workflowManifest chaosTypes.ChaosEngine
	)
	err := json.Unmarshal([]byte(workflow.WorkflowManifest), &workflowManifest)
	if err != nil {
		return errors.New("failed to unmarshal workflow manifest")
	}

	if workflowManifest.Labels == nil {
		workflowManifest.Labels = map[string]string{
			"workflow_id": *workflow.WorkflowID,
			"cluster_id":  workflow.ClusterID,
			"type":        "standalone_workflow",
		}
	} else {
		workflowManifest.Labels["workflow_id"] = *workflow.WorkflowID
		workflowManifest.Labels["cluster_id"] = workflow.ClusterID
		workflowManifest.Labels["type"] = "standalone_workflow"
	}
	if len(workflowManifest.Spec.Experiments) == 0 {
		return errors.New("no experiments specified in chaosengine - " + workflowManifest.Name)
	}
	exprname := workflowManifest.Spec.Experiments[0].Name
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

func processChaosScheduleManifest(workflow *model.ChaosWorkFlowInput, weights map[string]int) error {
	var (
		newWeights       []*model.WeightagesInput
		workflowManifest scheduleTypes.ChaosSchedule
	)
	err := json.Unmarshal([]byte(workflow.WorkflowManifest), &workflowManifest)
	if err != nil {
		return errors.New("failed to unmarshal workflow manifest")
	}

	if workflowManifest.Labels == nil {
		workflowManifest.Labels = map[string]string{
			"workflow_id": *workflow.WorkflowID,
			"cluster_id":  workflow.ClusterID,
			"type":        "standalone_workflow",
		}
	} else {
		workflowManifest.Labels["workflow_id"] = *workflow.WorkflowID
		workflowManifest.Labels["cluster_id"] = workflow.ClusterID
		workflowManifest.Labels["type"] = "standalone_workflow"
	}
	if len(workflowManifest.Spec.EngineTemplateSpec.Experiments) == 0 {
		return errors.New("no experiments specified in chaosengine - " + workflowManifest.Name)
	}
	exprname := workflowManifest.Spec.EngineTemplateSpec.Experiments[0].Name
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
