package mongodb

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func InsertCluster(cluster Cluster) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := clusterCollection.InsertOne(ctx, cluster)
	if err != nil {
		return err
	}

	return nil
}

func GetCluster(cluster_id string) (Cluster, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.M{"cluster_id": cluster_id}

	var cluster Cluster
	err = clusterCollection.FindOne(ctx, query).Decode(&cluster)
	if err != nil {
		return Cluster{}, err
	}

	return cluster, nil
}

func UpdateCluster(query bson.D, update bson.D) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	_, err := clusterCollection.UpdateOne(ctx, query, update)
	if err != nil {
		return err
	}

	return nil
}

func UpsertWorkflowRun(workflow_id string, wfRun WorkflowRun) error {
	opts := options.Update().SetUpsert(true)
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	count, err := workflowCollection.CountDocuments(ctx, bson.M{"workflow_id": workflow_id, "workflow_runs.workflow_run_id": wfRun.WorkflowRunID})
	if err != nil {
		return err
	}

	if count == 0 {
		filter := bson.M{"workflow_id": workflow_id}
		update := bson.M{"$push": bson.M{"workflow_runs": wfRun}}
		_, err = workflowCollection.UpdateOne(ctx, filter, update, opts)
		if err != nil {
			return err
		}
	} else if count == 1 {
		filter := bson.M{"workflow_id": workflow_id, "workflow_runs.workflow_run_id": wfRun.WorkflowRunID}
		update := bson.M{"$set": bson.M{"workflow_runs.$.last_updated": wfRun.LastUpdated, "workflow_runs.$.execution_data": wfRun.ExecutionData}}
		_, err = workflowCollection.UpdateOne(ctx, filter, update, opts)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetWorkflowsByProjectID(project_id string) ([]ChaosWorkFlowInput, error) {
	query := bson.D{{"project_id", project_id}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	cursor, err := workflowCollection.Find(ctx, query)
	if err != nil {
		return nil, err
	}

	var workflows []ChaosWorkFlowInput
	err = cursor.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}
	return workflows, nil
}

func GetWorkflowsByIDs(workflow_ids []*string) ([]ChaosWorkFlowInput, error) {
	query := bson.M{"workflow_id": bson.M{"$in": workflow_ids}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	cursor, err := workflowCollection.Find(ctx, query)
	if err != nil {
		return nil, err
	}

	var workflows []ChaosWorkFlowInput
	err = cursor.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}

	return workflows, nil
}

func GetWorkflowsByClusterID(cluster_id string) ([]ChaosWorkFlowInput, error) {
	query := bson.D{{"cluster_id", cluster_id}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)

	cursor, err := workflowCollection.Find(ctx, query)
	if err != nil {
		return nil, err
	}

	var workflows []ChaosWorkFlowInput
	err = cursor.All(ctx, &workflows)
	if err != nil {
		return nil, err
	}
	return workflows, nil
}

func GetClusterWithProjectID(project_id string, cluster_type *string) ([]*Cluster, error) {

	var query bson.M
	if cluster_type == nil {
		query = bson.M{"project_id": project_id, "is_removed": false}
	} else {
		query = bson.M{"project_id": project_id, "cluster_type": cluster_type, "is_removed": false}
	}

	fmt.Print(query)
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var clusters []*Cluster

	cursor, err := clusterCollection.Find(ctx, query)
	if err != nil {
		return []*Cluster{}, err
	}

	err = cursor.All(ctx, &clusters)
	if err != nil {
		return []*Cluster{}, err
	}

	return clusters, nil
}

func InsertChaosWorkflow(chaosWorkflow ChaosWorkFlowInput) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := workflowCollection.InsertOne(ctx, chaosWorkflow)
	if err != nil {
		return err
	}

	return nil
}

func DeleteChaosWorkflow(workflowid string) (bool, error) {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	res, err := workflowCollection.DeleteOne(ctx, bson.M{"workflow_id": workflowid})

	if err != nil {
		return false, err
	} else if res.DeletedCount == 0 {
		return false, nil
	}

	log.Println("Successfully delete %v", workflowid)
	return true, nil
}
