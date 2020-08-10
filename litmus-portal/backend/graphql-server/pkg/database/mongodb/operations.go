package database

import (
	"context"
	"time"
)

func InsertChaosWorkflow(workflow ChaosWorkFlowInput) error {
	ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := clusterCollection.InsertOne(ctx, workflow)
	if err != nil {
		return err
	}

	return nil
}

