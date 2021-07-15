package project

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CreateProject creates a new project for a user
func CreateProject(ctx context.Context, project *Project) error {
	err := mongodb.Operator.Create(ctx, mongodb.ProjectCollection, project)
	if err != nil {
		log.Print("Error creating project: ", err)
		return err
	}

	return nil
}

// GetProject returns a project based on a query or filter value
func GetProject(ctx context.Context, query bson.D) (*Project, error) {
	var project = new(Project)
	result, err := mongodb.Operator.Get(ctx, mongodb.ProjectCollection, query)
	if err != nil {
		log.Print("Error getting project with query: ", query, "\nError message: ", err)
		return nil, err
	}
	err = result.Decode(project)
	if err != nil {
		log.Print("Error unmarshalling the result in project struct: ", err)
		return nil, err
	}

	return project, err
}

// GetProjects takes a query parameter to retrieve the projects that match query
func GetProjects(ctx context.Context, query bson.D) ([]Project, error) {
	results, err := mongodb.Operator.List(ctx, mongodb.ProjectCollection, query)
	if err != nil {
		return nil, err
	}

	var projects []Project
	err = results.All(ctx, &projects)
	if err != nil {
		return nil, err
	}

	return projects, nil
}

// GetProjectsByUserID returns a project based on the userID
func GetProjectsByUserID(ctx context.Context, userID string, isOwner bool) ([]Project, error) {
	var projects []Project
	query := bson.D{}

	if isOwner == true {
		query = bson.D{
			{"members", bson.D{
				{"$elemMatch", bson.D{
					{"user_id", userID},
					{"role", bson.D{
						{"$eq", model.MemberRoleOwner},
					}},
				}},
			}}}
	} else {
		query = bson.D{
			{"removed_at", ""},
			{"members", bson.D{
				{"$elemMatch", bson.D{
					{"user_id", userID},
					{"invitation", bson.D{
						{"$ne", DeclinedInvitation},
					}},
				}},
			}}}
	}

	result, err := mongodb.Operator.List(ctx, mongodb.ProjectCollection, query)
	if err != nil {
		log.Print("Error getting project with userID: ", userID, " error: ", err)
		return nil, err
	}
	err = result.All(ctx, &projects)
	if err != nil {
		log.Print("Error getting project with userID: ", userID, " error: ", err)
		return nil, err
	}

	return projects, err
}

// AddMember adds a new member into the project whose projectID is passed
func AddMember(ctx context.Context, projectID string, member *Member) error {
	query := bson.D{{"_id", projectID}}
	update := bson.D{{"$push", bson.D{
		{"members", member},
	}}}

	result, err := mongodb.Operator.Update(ctx, mongodb.ProjectCollection, query, update)
	if err != nil {
		log.Print("Error in adding a member to project with projectID: ", projectID, "\nError: ", err)
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("could not find matching projectID in database")
	}

	return nil
}

// RemoveInvitation removes member or cancels the invitation
func RemoveInvitation(ctx context.Context, projectID string, userID string, invitation Invitation) error {
	query := bson.D{{"_id", projectID}}
	update := bson.D{
		{"$pull", bson.D{
			{"members", bson.D{
				{"user_id", userID},
			}},
		}},
	}

	result, err := mongodb.Operator.Update(ctx, mongodb.ProjectCollection, query, update)
	if err != nil {
		if invitation == AcceptedInvitation {
			log.Print("Error removing the member with userID: ", userID, " from the project", "\nError message: ", err)
			return err
		}
		log.Print("Error removing the invite with userID:", userID, " from the project", "\nError message: ", err)
		return err

	}
	if result.MatchedCount == 0 {
		return errors.New("could not find matching projectID in database")
	}

	return nil
}

// UpdateInvite updates the status of sent invitation
func UpdateInvite(ctx context.Context, projectID, userID string, invitation Invitation, Role *model.MemberRole) error {
	opts := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.D{{"elem.user_id", userID}},
		},
	})
	query := bson.D{{"_id", projectID}}
	var update bson.D

	switch invitation {
	case PendingInvitation:
		update = bson.D{
			{"$set", bson.D{
				{"members.$[elem].invitation", invitation},
				{"members.$[elem].role", Role},
			}}}
	case DeclinedInvitation:
		update = bson.D{
			{"$set", bson.D{
				{"members.$[elem].invitation", invitation},
			}}}
	case AcceptedInvitation:
		update = bson.D{
			{"$set", bson.D{
				{"members.$[elem].invitation", invitation},
				{"members.$[elem].joined_at", time.Now().Format(time.RFC1123Z)},
			}}}
	case ExitedProject:
		update = bson.D{
			{"$set", bson.D{
				{"members.$[elem].invitation", invitation},
			}}}
	}

	result, err := mongodb.Operator.Update(ctx, mongodb.ProjectCollection, query, update, opts)
	if err != nil {
		log.Print("Error updating project with projectID: ", projectID, " error: ", err)
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("could not find matching projectID in database")
	}

	return nil
}

// UpdateProjectName :Updates Name of the project
func UpdateProjectName(ctx context.Context, projectID string, projectName string) error {
	query := bson.D{{"_id", projectID}}
	update := bson.D{{"$set", bson.M{"name": projectName}}}

	_, err := mongodb.Operator.Update(ctx, mongodb.ProjectCollection, query, update)
	if err != nil {
		return err
	}

	return nil
}

// GetAggregateProjects takes a mongo pipeline to retrieve the project details from the database
func GetAggregateProjects(ctx context.Context, pipeline mongo.Pipeline) (*mongo.Cursor, error) {
	results, err := mongodb.Operator.Aggregate(ctx, mongodb.ProjectCollection, pipeline)
	if err != nil {
		return nil, err
	}

	return results, nil
}
