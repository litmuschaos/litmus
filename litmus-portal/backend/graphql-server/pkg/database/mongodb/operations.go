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

func UpsertWorkflowRun(wfRun WorkflowRun) error {
	opts := options.Update().SetUpsert(true)
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.M{"workflow_run_id": wfRun.WorkflowRunID}
	data, err := bson.Marshal(wfRun)
	if err != nil {
		log.Print("ERROR UPDATE CLUSTER : ", err)
		return err
	}
	var doc bson.D
	err = bson.Unmarshal(data, &doc)
	update := bson.D{{"$set", doc}}
	_, err = workflowRunCollection.UpdateOne(ctx, query, update, opts)
	if err != nil {
		log.Print("ERROR UPDATE CLUSTER : ", err)
		return err
	}
	return nil
}

func GetWorkflowRuns(_pid string) ([]WorkflowRun, error) {
	query := bson.D{{"project_id", _pid}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	cursor, err := workflowRunCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GET CLUSTERS : ", err)
		return nil, err
	}
	var wfRuns []WorkflowRun
	err = cursor.All(ctx, &wfRuns)
	if err != nil {
		log.Print("ERROR GET CLUSTERS : ", err)
		return nil, err
	}
	return wfRuns, nil
}

func GetClusterWithProjectID(project_id string, cluster_type *string) ([]*Cluster, error) {

	var query bson.M
	if cluster_type == nil {
		query = bson.M{"project_id": project_id}
	} else {
		query = bson.M{"project_id": project_id, "cluster_type": cluster_type}
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
