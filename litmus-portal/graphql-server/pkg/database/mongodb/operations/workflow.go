package operations

import (
	"context"
	"errors"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/schema"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"time"
)

var (
	workflowCollection *mongo.Collection
)

func init() {
	workflowCollection = mongodb.Database.Collection("workflow-collection")
	_, err := workflowCollection.Indexes().CreateMany(backgroundContext, []mongo.IndexModel{
		{
			Keys: bson.M{
				"workflow_id": 1,
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.M{
				"workflow_name": 1,
			},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		log.Fatal("Error Creating Index for Workflow Collection: ", err)
	}
}

func UpdateWorkflowRun(workflow_id string, wfRun dbSchema.WorkflowRun) (int, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	count, err := workflowCollection.CountDocuments(ctx, bson.M{"workflow_id": workflow_id, "workflow_runs.workflow_run_id": wfRun.WorkflowRunID})
	if err != nil {
		return 0, err
	}

	updateCount := 1
	if count == 0 {
		filter := bson.M{"workflow_id": workflow_id}
		update := bson.M{"$push": bson.M{"workflow_runs": wfRun}}
		updateResp, err := workflowCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			return 0, err
		}
		if updateResp.MatchedCount == 0 {
			return 0, errors.New("workflow not found")
		}
	} else if count == 1 {
		filter := bson.M{"workflow_id": workflow_id, "workflow_runs.workflow_run_id": wfRun.WorkflowRunID, "workflow_runs.completed": false}
		update := bson.M{"$set": bson.M{"workflow_runs.$.last_updated": wfRun.LastUpdated, "workflow_runs.$.execution_data": wfRun.ExecutionData, "workflow_runs.$.completed": wfRun.Completed}}
		updateResp, err := workflowCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			return 0, err
		}
		updateCount = int(updateResp.MatchedCount)
	}

	return updateCount, nil
}

func GetWorkflows(query bson.D) ([]dbSchema.ChaosWorkFlowInput, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	cursor, err := workflowCollection.Find(ctx, query)
	if err != nil {
		return nil, err
	}

	var workflows []dbSchema.ChaosWorkFlowInput
	err = cursor.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}

	return workflows, nil
}

func GetWorkflowsByClusterID(cluster_id string) ([]dbSchema.ChaosWorkFlowInput, error) {
	query := bson.D{{"cluster_id", cluster_id}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	cursor, err := workflowCollection.Find(ctx, query)
	if err != nil {
		return nil, err
	}

	var workflows []dbSchema.ChaosWorkFlowInput
	err = cursor.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}
	return workflows, nil
}

func InsertChaosWorkflow(chaosWorkflow dbSchema.ChaosWorkFlowInput) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := workflowCollection.InsertOne(ctx, chaosWorkflow)
	if err != nil {
		return err
	}

	return nil
}

func UpdateChaosWorkflow(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := workflowCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}
