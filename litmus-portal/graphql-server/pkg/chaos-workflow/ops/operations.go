package ops

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	store "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/data-store"
	database "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/graphql"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/graphql/subscriptions"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"go.mongodb.org/mongo-driver/bson"
)

//ProcessWorkflow takes the workflow and processes it as required
func ProcessWorkflow(workflow *model.ChaosWorkFlowInput) (*model.ChaosWorkFlowInput, error) {
	// workflow name in struct should match with actual workflow name
	workflowName := gjson.Get(workflow.WorkflowManifest, "metadata.name").String()
	if workflow.WorkflowName != workflowName {
		return nil, errors.New("workflow name doesn't match")
	}

	// security check for cluster access
	cluster, err := database.GetCluster(workflow.ClusterID)
	if err != nil {
		return nil, err
	}
	if cluster.ProjectID != workflow.ProjectID {
		return nil, errors.New("cluster doesn't belong to this project")
	}

	if workflow.WorkflowID == nil {
		workflow_id := uuid.New().String()
		workflow.WorkflowID = &workflow_id
	}

	resKind := gjson.Get(workflow.WorkflowManifest, "kind").String()

	newWorkflowManifest, _ := sjson.Set(workflow.WorkflowManifest, "metadata.labels.workflow_id", workflow.WorkflowID)
	newWorkflowManifest, _ = sjson.Set(newWorkflowManifest, "metadata.labels.cluster_id", workflow.ClusterID)

	if strings.ToLower(resKind) == "cronworkflow" {
		newWorkflowManifest, _ = sjson.Set(workflow.WorkflowManifest, "spec.workflowMetadata.labels.workflow_id", workflow.WorkflowID)
		newWorkflowManifest, _ = sjson.Set(newWorkflowManifest, "spec.workflowMetadata.labels.cluster_id", workflow.ClusterID)
	}
	workflow.WorkflowManifest = newWorkflowManifest

	return workflow, nil
}

//ProcessWorkflowCreation creates new workflow entry and sends the workflow to the specific agent for execution
func ProcessWorkflowCreation(input *model.ChaosWorkFlowInput, r *store.StateData) error {
	var Weightages []*database.WeightagesInput
	if input.Weightages != nil {
		copier.Copy(&Weightages, &input.Weightages)
	}

	newChaosWorkflow := database.ChaosWorkFlowInput{
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
		WorkflowRuns:        []*database.WorkflowRun{},
		IsRemoved:           false,
	}

	err := database.InsertChaosWorkflow(newChaosWorkflow)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(input, "create", r)
	}

	return nil
}

//ProcessWorkflowUpdate updates the workflow entry and sends update resource request to required agent
func ProcessWorkflowUpdate(workflow *model.ChaosWorkFlowInput, r *store.StateData) error {
	var Weightages []*database.WeightagesInput
	if workflow.Weightages != nil {
		copier.Copy(&Weightages, &workflow.Weightages)
	}

	query := bson.D{{"workflow_id", workflow.WorkflowID}, {"project_id", workflow.ProjectID}}
	update := bson.D{{"$set", bson.D{{"workflow_manifest", workflow.WorkflowManifest}, {"cronSyntax", workflow.CronSyntax}, {"workflow_name", workflow.WorkflowName}, {"workflow_description", workflow.WorkflowDescription}, {"isCustomWorkflow", workflow.IsCustomWorkflow}, {"weightages", Weightages}, {"updated_at", strconv.FormatInt(time.Now().Unix(), 10)}}}}

	err := database.UpdateChaosWorkflow(query, update)
	if err != nil {
		return err
	}

	if r != nil {
		SendWorkflowToSubscriber(workflow, "update", r)
	}
	return nil
}

//ProcessWorkflowDelete deletes the workflow entry and sends delete resource request to required agent
func ProcessWorkflowDelete(query bson.D, r *store.StateData) error {
	workflows, err := database.GetWorkflows(query)
	if err != nil {
		return err
	}

	update := bson.D{{"$set", bson.D{{"isRemoved", true}}}}

	err = database.UpdateChaosWorkflow(query, update)

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
	subscriptions.SendRequestToSubscriber(graphql.SubscriberRequests{
		K8sManifest: workflow.WorkflowManifest,
		RequestType: reqType,
		ProjectID:   workflow.ProjectID,
		ClusterID:   workflow.ClusterID,
		Namespace:   workflowNamespace,
	}, *r)
}
