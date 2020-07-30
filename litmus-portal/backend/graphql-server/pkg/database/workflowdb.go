package database

import (
	"context"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"time"
)

func UpsertWorkflowRun(wfRun model.WorkflowRun) error {
	opts := options.Update().SetUpsert(true)
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	query := bson.M{"workflow_run_id": wfRun.WorkflowRunID}
	data,err:=bson.Marshal(wfRun)
	if err != nil {
		log.Print("ERROR UPDATE CLUSTER : ", err)
		return err
	}
	var doc bson.D
	err=bson.Unmarshal(data,&doc)
	update := bson.D{{"$set",doc }}
	_, err = workflowRunCollection.UpdateOne(ctx, query, update,opts)
	if err != nil {
		log.Print("ERROR UPDATE CLUSTER : ", err)
		return err
	}
	return nil
}

func GetWorkflowRuns(_pid string) ([]model.WorkflowRun, error) {
	query := bson.D{{"project_id", _pid}}
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	cursor, err := workflowRunCollection.Find(ctx, query)
	if err != nil {
		log.Print("ERROR GET CLUSTERS : ", err)
		return nil, err
	}
	var wfRuns []model.WorkflowRun
	err = cursor.All(ctx, &wfRuns)
	if err != nil {
		log.Print("ERROR GET CLUSTERS : ", err)
		return nil, err
	}
	return wfRuns, nil
}