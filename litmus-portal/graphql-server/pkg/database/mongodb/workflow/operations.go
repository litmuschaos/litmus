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

// UpdateWorkflowRun takes workflowID and wfRun parameters to update the workflow run details in the database
func UpdateWorkflowRun(workflowID string, wfRun ChaosWorkflowRun) (int, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	count, err := mongodb.Operator.CountDocuments(ctx, mongodb.WorkflowCollection, bson.D{
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

		result, err := mongodb.Operator.Update(ctx, mongodb.WorkflowCollection, query, update)
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
				{"workflow_runs.$.total_experiments", wfRun.TotalExperiments},
				{"workflow_runs.$.execution_data", wfRun.ExecutionData},
				{"workflow_runs.$.completed", wfRun.Completed},
				{"workflow_runs.$.isRemoved", wfRun.IsRemoved},
			}}}

		result, err := mongodb.Operator.Update(ctx, mongodb.WorkflowCollection, query, update)
		if err != nil {
			return 0, err
		}
		updateCount = int(result.MatchedCount)
	}

	return updateCount, nil
}

// GetWorkflows takes a query parameter to retrieve the workflow details from the database
func GetWorkflows(query bson.D) ([]ChaosWorkFlowInput, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	results, err := mongodb.Operator.List(ctx, mongodb.WorkflowCollection, query)
	if err != nil {
		return nil, err
	}

	var workflows []ChaosWorkFlowInput
	err = results.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}

	return workflows, nil
}

// GetWorkflow takes a query parameter to retrieve the workflow details from the database
func GetWorkflow(query bson.D) (ChaosWorkFlowInput, error) {

	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	var workflow ChaosWorkFlowInput
	results, err := mongodb.Operator.Get(ctx, mongodb.WorkflowCollection, query)
	if err != nil {
		return ChaosWorkFlowInput{}, err
	}

	err = results.Decode(&workflow)
	if err != nil {
		return ChaosWorkFlowInput{}, err
	}

	return workflow, nil
}

// GetAggregateWorkflows takes a mongo pipeline to retrieve the workflow details from the database
func GetAggregateWorkflows(pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	results, err := mongodb.Operator.Aggregate(ctx, mongodb.WorkflowCollection, pipeline)
	if err != nil {
		return nil, err
	}

	return results, nil
}

// GetWorkflowsByClusterID takes a clusterID parameter to retrieve the workflow details from the database
func GetWorkflowsByClusterID(clusterID string) ([]ChaosWorkFlowInput, error) {
	query := bson.D{{"cluster_id", clusterID}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	results, err := mongodb.Operator.List(ctx, mongodb.WorkflowCollection, query)
	if err != nil {
		return nil, err
	}

	var workflows []ChaosWorkFlowInput
	err = results.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}
	return workflows, nil
}

// InsertChaosWorkflow takes details of a workflow and inserts into the database collection
func InsertChaosWorkflow(chaosWorkflow ChaosWorkFlowInput) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	err := mongodb.Operator.Create(ctx, mongodb.WorkflowCollection, chaosWorkflow)
	if err != nil {
		return err
	}

	return nil
}

// UpdateChaosWorkflow takes query and update parameters to update the workflow details in the database
func UpdateChaosWorkflow(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := mongodb.Operator.Update(ctx, mongodb.WorkflowCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}
