package project

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
)

var projectCollection *mongo.Collection

func init() {
	projectCollection = mongodb.Database.Collection("project")
}

// CreateProject ...
func CreateProject(ctx context.Context, project *Project) error {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	_, err := projectCollection.InsertOne(ctx, project)
	if err != nil {
		log.Print("Error creating Project: ", err)
		return err
	}

	return nil
}

// GetProject ...
func GetProject(ctx context.Context, projectID string) (*Project, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	var project = new(Project)
	query := bson.M{"_id": projectID}
	err := projectCollection.FindOne(ctx, query).Decode(project)
	if err != nil {
		log.Print("Error getting project with id: ", projectID, " error: ", err)
		return nil, err
	}

	return project, err
}

// GetProjectsByUserID ...
func GetProjectsByUserID(ctx context.Context, userID string) ([]Project, error) {
	// ctx, _ := context.WithTimeout(backgroundContext, 10*time.Second)
	projects := []Project{}
	query := bson.M{"members": bson.M{"$elemMatch": bson.M{"user_id": userID, "invitation": bson.M{"$ne": DeclinedInvitation}}}}
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

// AddMember ...
func AddMember(ctx context.Context, projectID string, member *Member) error {

	query := bson.M{"_id": projectID}
	update := bson.M{"$push": bson.M{"members": member}}
	_, err := projectCollection.UpdateOne(ctx, query, update)
	if err != nil {
		log.Print("Error updating project with projectID: ", projectID, " error: ", err)
		return err
	}
	return nil
}

// RemoveInvitation ...
func RemoveInvitation(ctx context.Context, projectID string, userName string, invitation Invitation) error {
	query := bson.M{"_id": projectID}
	update := bson.M{"$pull": bson.M{"members": bson.M{"username": userName}}}
	_, err := projectCollection.UpdateOne(ctx, query, update)
	if err != nil {
		if invitation == AcceptedInvitation {
			log.Print("Error Removing the member with username:", userName, "from project with project id: ", projectID, err)
			return err
		}
		log.Print("Error Removing the invite with username:", userName, "from project with project id: ", projectID, err)
		return err

	}
	return nil
}

// UpdateInvite ...
func UpdateInvite(ctx context.Context, projectID, userName string, invitation Invitation, Role *model.MemberRole) error {
	options := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.M{"elem.username": userName},
		},
	})

	query := bson.M{"_id": projectID}
	var update bson.M

	switch invitation {
	case PendingInvitation:
		update = bson.M{"$set": bson.M{"members.$[elem].invitation": invitation, "members.$[elem].role": Role}}
	case DeclinedInvitation:
		update = bson.M{"$set": bson.M{"members.$[elem].invitation": invitation}}
	case AcceptedInvitation:
		update = bson.M{"$set": bson.M{"members.$[elem].invitation": invitation, "members.$[elem].joined_at": time.Now().Format(time.RFC1123Z)}}
	case ExitedProject:
		update = bson.M{"$set": bson.M{"members.$[elem].invitation": invitation}}
	}
	_, err := projectCollection.UpdateOne(ctx, query, update, options)
	if err != nil {
		log.Print("Error updating project with projectID: ", projectID, " error: ", err)
		return err
	}
	return nil
}
