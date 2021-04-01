package ops

import (
	"encoding/json"
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/ghodss/yaml"

	"github.com/argoproj/argo/pkg/apis/workflow/v1alpha1"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	chaosTypes "github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/tidwall/gjson"
	"go.mongodb.org/mongo-driver/bson"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	clusterOps "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	clusterHandler "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster/handler"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	dbOperationsCluster "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/cluster"
	dbOperationsWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
	dbSchemaWorkflow "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/workflow"
)

type WorkflowEvent struct {
	WorkflowID        string          `json:"-"`
	EventType         string          `json:"event_type"`
	UID               string          `json:"-"`
	Namespace         string          `json:"namespace"`
	Name              string          `json:"name"`
	CreationTimestamp string          `json:"creationTimestamp"`
	Phase             string          `json:"phase"`
	Message           string          `json:"message"`
	StartedAt         string          `json:"startedAt"`
	FinishedAt        string          `json:"finishedAt"`
	Nodes             map[string]Node `json:"nodes"`
}

// each node/step data
type Node struct {
	Name       string     `json:"name"`
	Phase      string     `json:"phase"`
	Message    string     `json:"message"`
	StartedAt  string     `json:"startedAt"`
	FinishedAt string     `json:"finishedAt"`
	Children   []string   `json:"children"`
	Type       string     `json:"type"`
	ChaosExp   *ChaosData `json:"chaosData,omitempty"`
}

// chaos data
type ChaosData struct {
	EngineUID              string                  `json:"engineUID"`
	EngineName             string                  `json:"engineName"`
	Namespace              string                  `json:"namespace"`
	ExperimentName         string                  `json:"experimentName"`
	ExperimentStatus       string                  `json:"experimentStatus"`
	LastUpdatedAt          string                  `json:"lastUpdatedAt"`
	ExperimentVerdict      string                  `json:"experimentVerdict"`
	ExperimentPod          string                  `json:"experimentPod"`
	RunnerPod              string                  `json:"runnerPod"`
	ProbeSuccessPercentage string                  `json:"probeSuccessPercentage"`
	FailStep               string                  `json:"failStep"`
	ChaosResult            *chaosTypes.ChaosResult `json:"chaosResult"`
}

// ProcessWorkflow takes the workflow and processes it as required
func ProcessWorkflow(workflow *model.ChaosWorkFlowInput) (*model.ChaosWorkFlowInput, error) {
	// security check for cluster access
	cluster, err := dbOperationsCluster.GetCluster(workflow.ClusterID)
	if err != nil {
		return nil, err
	}

	if cluster.ProjectID != workflow.ProjectID {
		return nil, errors.New("cluster doesn't belong to this project")
	}

	var (
		workflow_id = uuid.New().String()
		weights     = make(map[string]int)
		newWeights  []*model.WeightagesInput
		objmeta     v1alpha1.Workflow
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
		return nil, errors.New("failed to unmarshal workflow manifest1")
	}

	// workflow name in struct should match with actual workflow name
	if workflow.WorkflowName != objmeta.Name {
		return nil, errors.New(objmeta.Kind + " name doesn't match")
	}

	if strings.ToLower(objmeta.Kind) == "workflow" {
		var workflowManifest v1alpha1.Workflow
		err = json.Unmarshal([]byte(workflow.WorkflowManifest), &workflowManifest)
		if err != nil {
			return nil, errors.New("failed to unmarshal workflow manifest")
		}

		workflowManifest.Labels = map[string]string{
			"workflow_id": *workflow.WorkflowID,
			"cluster_id":  workflow.ClusterID,
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
						return nil, errors.New("failed to unmarshal chaosengine")
					}

					if strings.ToLower(meta.Kind) == "chaosengine" {
						var exprname string
						if len(meta.Spec.Experiments) > 0 {
							exprname = meta.Spec.Experiments[0].Name
							if len(exprname) == 0 {
								return nil, errors.New("empty chaos engine name")
							}
						}

						if val, ok := weights[exprname]; ok {
							workflowManifest.Spec.Templates[i].Metadata.Labels = map[string]string{
								"weight": strconv.Itoa(val),
							}
						} else if val, ok := workflowManifest.Spec.Templates[i].Metadata.Labels["weight"]; ok {
							intVal, err := strconv.Atoi(val)
							if err != nil {
								return nil, errors.New("failed to convert")
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
			return nil, nil
		}

		workflow.WorkflowManifest = string(out)
	} else if strings.ToLower(objmeta.Kind) == "cronworkflow" {
		var cronWorkflowManifest v1alpha1.CronWorkflow
		err = json.Unmarshal([]byte(workflow.WorkflowManifest), &cronWorkflowManifest)
		if err != nil {
			return nil, errors.New("failed to unmarshal workflow manifest")
		}

		cronWorkflowManifest.Labels = map[string]string{
			"workflow_id": *workflow.WorkflowID,
			"cluster_id":  workflow.ClusterID,
		}

		cronWorkflowManifest.Spec.WorkflowMetadata = &v1.ObjectMeta{
			Labels: map[string]string{
				"workflow_id": *workflow.WorkflowID,
				"cluster_id":  workflow.ClusterID,
			},
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
						return nil, errors.New("failed to unmarshal chaosengine")
					}

					if strings.ToLower(meta.Kind) == "chaosengine" {
						var exprname string
						if len(meta.Spec.Experiments) > 0 {
							exprname = meta.Spec.Experiments[0].Name
							if len(exprname) == 0 {
								return nil, errors.New("empty chaos engine name")
							}
						}
						if val, ok := weights[exprname]; ok {
							cronWorkflowManifest.Spec.WorkflowSpec.Templates[i].Metadata.Labels = map[string]string{
								"weight": strconv.Itoa(val),
							}
						} else if val, ok := cronWorkflowManifest.Spec.WorkflowSpec.Templates[i].Metadata.Labels["weight"]; ok {
							intVal, err := strconv.Atoi(val)
							if err != nil {
								return nil, errors.New("failed to convert")
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
			return nil, nil
		}

		workflow.WorkflowManifest = string(out)
	}

	return workflow, nil
}

// ProcessWorkflowCreation creates new workflow entry and sends the workflow to the specific agent for execution
func ProcessWorkflowCreation(input *model.ChaosWorkFlowInput, r *store.StateData) error {
	var Weightages []*dbSchemaWorkflow.WeightagesInput
	if input.Weightages != nil {
		copier.Copy(&Weightages, &input.Weightages)
	}

	newChaosWorkflow := dbSchemaWorkflow.ChaosWorkFlowInput{
		WorkflowID:          *input.WorkflowID,
		WorkflowManifest:    input.WorkflowManifest,
		CronSyntax:          input.CronSyntax,
		WorkflowName:        input.WorkflowName,
		WorkflowDescription: input.WorkflowDescription,
		IsCustomWorkflow:    input.IsCustomWorkflow,
		ProjectID:           input.ProjectID,
		ClusterID:           input.ClusterID,
		Weightages:          Weightages,
		CreatedAt:           strconv.FormatInt(time.Now().Unix(), 10),
		UpdatedAt:           strconv.FormatInt(time.Now().Unix(), 10),
		WorkflowRuns:        []*dbSchemaWorkflow.ChaosWorkflowRun{},
		IsRemoved:           false,
	}

	err := dbOperationsWorkflow.InsertChaosWorkflow(newChaosWorkflow)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(input, "create", r)
	}

	return nil
}

// ProcessWorkflowUpdate updates the workflow entry and sends update resource request to required agent
func ProcessWorkflowUpdate(workflow *model.ChaosWorkFlowInput, r *store.StateData) error {
	var Weightages []*dbSchemaWorkflow.WeightagesInput
	if workflow.Weightages != nil {
		copier.Copy(&Weightages, &workflow.Weightages)
	}

	query := bson.D{{"workflow_id", workflow.WorkflowID}, {"project_id", workflow.ProjectID}}
	update := bson.D{{"$set", bson.D{{"workflow_manifest", workflow.WorkflowManifest}, {"cronSyntax", workflow.CronSyntax}, {"workflow_name", workflow.WorkflowName}, {"workflow_description", workflow.WorkflowDescription}, {"isCustomWorkflow", workflow.IsCustomWorkflow}, {"weightages", Weightages}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err := dbOperationsWorkflow.UpdateChaosWorkflow(query, update)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(workflow, "update", r)
	}
	return nil
}

// ProcessWorkflowDelete deletes the workflow entry and sends delete resource request to required agent
func ProcessWorkflowDelete(query bson.D, r *store.StateData) error {
	workflows, err := dbOperationsWorkflow.GetWorkflows(query)
	if err != nil {
		return err
	}

	update := bson.D{{"$set", bson.D{{"isRemoved", true}}}}

	err = dbOperationsWorkflow.UpdateChaosWorkflow(query, update)

	if err != nil {
		return err
	}

	if r != nil {
		for _, workflow := range workflows {
			SendWorkflowToSubscriber(&model.ChaosWorkFlowInput{
				ProjectID:        workflow.ProjectID,
				ClusterID:        workflow.ClusterID,
				WorkflowManifest: workflow.WorkflowManifest,
			}, "delete", r)
		}
	}
	return nil
}

func SendWorkflowToSubscriber(workflow *model.ChaosWorkFlowInput, reqType string, r *store.StateData) {
	workflowNamespace := gjson.Get(workflow.WorkflowManifest, "metadata.namespace").String()

	if workflowNamespace == "" {
		workflowNamespace = os.Getenv("AGENT_NAMESPACE")
	}
	clusterHandler.SendRequestToSubscriber(clusterOps.SubscriberRequests{
		K8sManifest: workflow.WorkflowManifest,
		RequestType: reqType,
		ProjectID:   workflow.ProjectID,
		ClusterID:   workflow.ClusterID,
		Namespace:   workflowNamespace,
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

// ResiliencyScoreCalculator calculates the Rscore and returns the execdata string
func ResiliencyScoreCalculator(execData string, wfid string) string {
	var resiliency_score, weightSum, totalTestResult, totalExperiments, totalExperimentsPassed int = 0, 0, 0, 0, 0
	var jsonData WorkflowEvent
	json.Unmarshal([]byte(execData), &jsonData)
	chaosWorkflows, _ := dbOperationsWorkflow.GetWorkflows(bson.D{{"workflow_id", bson.M{"$in": []string{wfid}}}})
	totalExperiments = len(chaosWorkflows[0].Weightages)
	weightMap := map[string]int{}
	for _, weightEnty := range chaosWorkflows[0].Weightages {
		weightMap[weightEnty.ExperimentName] = weightEnty.Weightage
	}
	for _, value := range jsonData.Nodes {
		if value.Type == "ChaosEngine" {
			if value.ChaosExp == nil {
				continue
			}
			weight, ok := weightMap[value.ChaosExp.ExperimentName]
			if ok {
				x, _ := strconv.Atoi(value.ChaosExp.ProbeSuccessPercentage)
				totalTestResult += weight * x
				weightSum += weight
			}
			if value.ChaosExp.ExperimentVerdict == "Pass" {
				totalExperimentsPassed += 1
			}
		}
	}
	if weightSum == 0 {
		resiliency_score = 0
	} else {
		resiliency_score = (totalTestResult / weightSum)
	}
	execData = "{" + `"resiliency_score":` + `"` + strconv.Itoa(resiliency_score) + `",` + `"experiments_passed":` + `"` + strconv.Itoa(totalExperimentsPassed) + `",` + `"total_experiments":` + `"` + strconv.Itoa(totalExperiments) + `",` + execData[1:]
	return execData
}
