package operations

import (
	"context"
	"log"

	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb"
	dbSchema "github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/database/mongodb/schema"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var projectCollection *mongo.Collection

func init() {
	projectCollection = mongodb.Database.Collection("project")
}

// CreateProject ...
func CreateProject(ctx context.Context, project *dbSchema.Project) error {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := projectCollection.InsertOne(ctx, project)
	if err != nil {
		log.Print("Error creating Project: ", err)
		return err
	}

	return nil
}

//GetProject ...
func GetProject(ctx context.Context, projectID string) (*dbSchema.Project, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var project *dbSchema.Project = new(dbSchema.Project)
	query := bson.M{"_id": projectID}
	err := projectCollection.FindOne(ctx, query).Decode(project)
	if err != nil {
		log.Print("Error getting project with id: ", projectID, " error: ", err)
		return nil, err
	}

	return project, err
}

//GetProjectsByUserID ...
func GetProjectsByUserID(ctx context.Context, userID string) ([]dbSchema.Project, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	projects := []dbSchema.Project{}
	query := bson.M{"members.user_id": userID}
	cursor, err := projectCollection.Find(ctx, query)
	if err != nil {
		log.Print("Error getting project with userID: ", userID, " error: ", err)
		return nil, err
	}
	err = cursor.All(ctx, &projects)
	if err != nil {
		log.Print("Error getting project with userID: ", userID, " error: ", err)
		return nil, err
	}

	return projects, err
}
