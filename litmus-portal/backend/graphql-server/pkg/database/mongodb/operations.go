package database

import (
	"context"
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
