package workflow

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	backgroundContext = context.Background()
)

// Operator is the model for cluster collection
type Operator struct {
	operator mongodb.MongoOperator
}

// NewChaosWorkflowOperator returns a new instance of Operator
func NewChaosWorkflowOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

// UpdateWorkflowRun takes workflowID and wfRun parameters to update the workflow run details in the database
func (c *Operator) UpdateWorkflowRun(workflowID string, wfRun ChaosWorkflowRun) (int, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	count, err := c.operator.CountDocuments(ctx, mongodb.WorkflowCollection, bson.D{
		{"workflow_id", workflowID},
		{"workflow_runs.workflow_run_id", wfRun.WorkflowRunID},
	})
	if err != nil {
		return 0, err
	}

	updateCount := 1
	if count == 0 {
		query := bson.D{{"workflow_id", workflowID}}
		update := bson.D{
			{"$push", bson.D{
				{"workflow_runs", wfRun},
			}}}

		result, err := c.operator.Update(ctx, mongodb.WorkflowCollection, query, update)
		if err != nil {
			return 0, err
		}
		if result.MatchedCount == 0 {
			return 0, errors.New("workflow not found")
		}
	} else if count == 1 {
		query := bson.D{
			{"workflow_id", workflowID},
			{"workflow_runs", bson.D{
				{"$elemMatch", bson.D{
					{"workflow_run_id", wfRun.WorkflowRunID},
					{"completed", false},
				}},
			}}}
		update := bson.D{
			{"$set", bson.D{
				{"workflow_runs.$.last_updated", wfRun.LastUpdated},
				{"workflow_runs.$.phase", wfRun.Phase},
				{"workflow_runs.$.resiliency_score", wfRun.ResiliencyScore},
				{"workflow_runs.$.experiments_passed", wfRun.ExperimentsPassed},
				{"workflow_runs.$.experiments_failed", wfRun.ExperimentsFailed},
				{"workflow_runs.$.experiments_awaited", wfRun.ExperimentsAwaited},
				{"workflow_runs.$.experiments_stopped", wfRun.ExperimentsStopped},
				{"workflow_runs.$.experiments_na", wfRun.ExperimentsNA},
				{"workflow_runs.$.total_experiments", wfRun.TotalExperiments},
				{"workflow_runs.$.execution_data", wfRun.ExecutionData},
				{"workflow_runs.$.completed", wfRun.Completed},
				{"workflow_runs.$.isRemoved", wfRun.IsRemoved},
			}}}

		result, err := c.operator.Update(ctx, mongodb.WorkflowCollection, query, update)
		if err != nil {
			return 0, err
		}
		updateCount = int(result.MatchedCount)
	}

	return updateCount, nil
}

// GetWorkflows takes a query parameter to retrieve the workflow details from the database
func (c *Operator) GetWorkflows(query bson.D) ([]ChaosWorkFlowRequest, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	results, err := c.operator.List(ctx, mongodb.WorkflowCollection, query)
	if err != nil {
		return nil, err
	}

	var workflows []ChaosWorkFlowRequest
	err = results.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}

	return workflows, nil
}

// GetWorkflow takes a query parameter to retrieve the workflow details from the database
func (c *Operator) GetWorkflow(query bson.D) (ChaosWorkFlowRequest, error) {

	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var workflow ChaosWorkFlowRequest
	results, err := c.operator.Get(ctx, mongodb.WorkflowCollection, query)
	if err != nil {
		return ChaosWorkFlowRequest{}, err
	}

	err = results.Decode(&workflow)
	if err != nil {
		return ChaosWorkFlowRequest{}, err
	}

	return workflow, nil
}

// GetAggregateWorkflows takes a mongo pipeline to retrieve the workflow details from the database
func (c *Operator) GetAggregateWorkflows(pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	results, err := c.operator.Aggregate(ctx, mongodb.WorkflowCollection, pipeline)
	if err != nil {
		return nil, err
	}

	return results, nil
}

// GetWorkflowsByClusterID takes a clusterID parameter to retrieve the workflow details from the database
func (c *Operator) GetWorkflowsByClusterID(clusterID string) ([]ChaosWorkFlowRequest, error) {
	query := bson.D{{"cluster_id", clusterID}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	results, err := c.operator.List(ctx, mongodb.WorkflowCollection, query)
	if err != nil {
		return nil, err
	}

	var workflows []ChaosWorkFlowRequest
	err = results.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}
	return workflows, nil
}

// InsertChaosWorkflow takes details of a workflow and inserts into the database collection
func (c *Operator) InsertChaosWorkflow(chaosWorkflow ChaosWorkFlowRequest) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	err := c.operator.Create(ctx, mongodb.WorkflowCollection, chaosWorkflow)
	if err != nil {
		return err
	}

	return nil
}

// UpdateChaosWorkflow takes query and update parameters to update the workflow details in the database
func (c *Operator) UpdateChaosWorkflow(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := c.operator.Update(ctx, mongodb.WorkflowCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}
