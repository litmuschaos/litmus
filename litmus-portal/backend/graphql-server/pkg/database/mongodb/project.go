package database

import (
	"context"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/graph/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var projectCollection *mongo.Collection

// CreateProject ...
func CreateProject(ctx context.Context, project *model.Project) error {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := projectCollection.InsertOne(ctx, project)
	if err != nil {
		log.Print("Error creating Project: ", err)
		return err
	}

	return nil
}

//GetProject ...
func GetProject(ctx context.Context, projectID string) (*model.Project, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var project *model.Project = new(model.Project)
	query := bson.M{"id": projectID}
	err := projectCollection.FindOne(ctx, query).Decode(project)
	if err != nil {
		log.Print("Error getting project with id: ", projectID, " error: ", err)
		return nil, err
	}

	return project, err
}
