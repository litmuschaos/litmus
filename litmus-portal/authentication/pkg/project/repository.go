package project

import (
	"context"
	"errors"
	"litmus/litmus-portal/authentication/pkg/entities"
	"litmus/litmus-portal/authentication/pkg/utils"
	"log"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Repository holds the mongo database implementation of the Service
type Repository interface {
	GetProjectByProjectID(projectID string) (*entities.Project, error)
	GetProjects(query bson.D) ([]*entities.Project, error)
	GetProjectsByUserID(uid string, isOwner bool) ([]*entities.Project, error)
	GetProjectStats() ([]*entities.ProjectStats, error)
	CreateProject(project *entities.Project) error
	AddMember(projectID string, member *entities.Member) error
	RemoveInvitation(projectID string, userID string, invitation entities.Invitation) error
	UpdateInvite(projectID string, userID string, invitation entities.Invitation, role *entities.MemberRole) error
	UpdateProjectName(projectID string, projectName string) error
	GetAggregateProjects(pipeline mongo.Pipeline, opts *options.AggregateOptions) (*mongo.Cursor, error)
	UpdateProjectState(userID string, deactivateTime string) error
}

type repository struct {
	Collection *mongo.Collection
}

// GetProject returns a project based on a query or filter value
func (r repository) GetProjectByProjectID(projectID string) (*entities.Project, error) {
	var project = new(entities.Project)

	findOneErr := r.Collection.FindOne(context.TODO(), bson.D{{"_id", projectID}}).Decode(&project)
	if findOneErr != nil {
		return nil, findOneErr
	}

	return project, nil
}

// GetProjects takes a query parameter to retrieve the projects that match query
func (r repository) GetProjects(query bson.D) ([]*entities.Project, error) {
	results, err := r.Collection.Find(context.TODO(), query)
	if err != nil {
		return nil, err
	}

	var projects []*entities.Project
	err = results.All(context.TODO(), &projects)
	if err != nil {
		return nil, err
	}

	return projects, nil
}

// GetProjectsByUserID returns a project based on the userID
func (r repository) GetProjectsByUserID(userID string, isOwner bool) ([]*entities.Project, error) {
	var projects []*entities.Project
	query := bson.D{}

	if isOwner == true {
		query = bson.D{
			{"members", bson.D{
				{"$elemMatch", bson.D{
					{"user_id", userID},
					{"role", bson.D{
						{"$eq", entities.RoleOwner},
					}},
				}},
			}}}
	} else {
		query = bson.D{
			{"removed_at", ""},
			{"members", bson.D{
				{"$elemMatch", bson.D{
					{"user_id", userID},
					{"$and", bson.A{
						bson.D{{"invitation", bson.D{
							{"$ne", entities.DeclinedInvitation},
						}}},
						bson.D{{"invitation", bson.D{
							{"$ne", entities.ExitedProject},
						}}},
					}},
				}},
			}}}
	}

	result, err := r.Collection.Find(context.TODO(), query)
	if err != nil {
		return nil, err
	}
	err = result.All(context.TODO(), &projects)
	if err != nil {
		return nil, err
	}

	return projects, err
}

// GetProjectStats returns stats related to projects in the DB
func (r repository) GetProjectStats() ([]*entities.ProjectStats, error) {
	pipeline := mongo.Pipeline{
		bson.D{{"$project", bson.M{
			"name": 1,
			"memberStat": bson.M{
				"owner": bson.M{
					"$map": bson.M{
						"input": bson.M{"$filter": bson.M{
							"input": "$members",
							"as":    "members",
							"cond": bson.M{
								"$eq": bson.A{"$$members.role", entities.RoleOwner},
							}}},
						"as": "owner",
						"in": bson.M{
							"user_id":  "$$owner.user_id",
							"username": "$$owner.username",
						}}},
				"total": bson.M{"$size": bson.M{
					"$filter": bson.M{
						"input": "$members",
						"as":    "members",
						"cond": bson.M{
							"$eq": bson.A{"$$members.invitation", entities.AcceptedInvitation},
						},
					}}},
			},
		},
		}},
	}
	result, err := r.Collection.Aggregate(context.Background(), pipeline, nil)
	if err != nil {
		return nil, err
	}

	var data []*entities.ProjectStats
	for result.Next(context.TODO()) {
		res := entities.ProjectStats{}
		if err := result.Decode(&res); err != nil {
			log.Fatal(err)
		}
		data = append(data, &res)
	}
	return data, nil
}

// CreateProject creates a new project for a user
func (r repository) CreateProject(project *entities.Project) error {
	_, err := r.Collection.InsertOne(context.Background(), project)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return utils.ErrUserExists
		}
		return err
	}

	return nil
}

// AddMember adds a new member into the project whose projectID is passed
func (r repository) AddMember(projectID string, member *entities.Member) error {
	query := bson.D{{"_id", projectID}}
	update := bson.D{{"$push", bson.D{
		{"members", member},
	}}}

	result, err := r.Collection.UpdateOne(context.TODO(), query, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("could not find matching projectID in database")
	}

	return nil
}

// RemoveInvitation removes member or cancels the invitation
func (r repository) RemoveInvitation(projectID string, userID string, invitation entities.Invitation) error {
	query := bson.D{{"_id", projectID}}
	update := bson.D{
		{"$pull", bson.D{
			{"members", bson.D{
				{"user_id", userID},
			}},
		}},
	}

	result, err := r.Collection.UpdateOne(context.TODO(), query, update)
	if err != nil {
		if invitation == entities.AcceptedInvitation {
			return err
		}
		return err

	}
	if result.MatchedCount == 0 {
		return errors.New("could not find matching projectID in database")
	}

	return nil
}

// UpdateInvite updates the status of sent invitation
func (r repository) UpdateInvite(projectID string, userID string, invitation entities.Invitation, role *entities.MemberRole) error {
	opts := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.D{{"elem.user_id", userID}},
		},
	})
	query := bson.D{{"_id", projectID}}
	var update bson.D

	switch invitation {
	case entities.PendingInvitation:
		update = bson.D{
			{"$set", bson.D{
				{"members.$[elem].invitation", invitation},
				{"members.$[elem].role", role},
			}}}
	case entities.DeclinedInvitation:
		update = bson.D{
			{"$set", bson.D{
				{"members.$[elem].invitation", invitation},
			}}}
	case entities.AcceptedInvitation:
		update = bson.D{
			{"$set", bson.D{
				{"members.$[elem].invitation", invitation},
				{"members.$[elem].joined_at", strconv.FormatInt(time.Now().Unix(), 10)},
			}}}
	case entities.ExitedProject:
		update = bson.D{
			{"$set", bson.D{
				{"members.$[elem].invitation", invitation},
			}}}
	}

	result, err := r.Collection.UpdateOne(context.TODO(), query, update, opts)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("could not find matching projectID in database")
	}

	return nil
}

// UpdateProjectName :Updates Name of the project
func (r repository) UpdateProjectName(projectID string, projectName string) error {
	query := bson.D{{"_id", projectID}}
	update := bson.D{{"$set", bson.M{"name": projectName}}}

	_, err := r.Collection.UpdateOne(context.TODO(), query, update)
	if err != nil {
		return err
	}

	return nil
}

// GetAggregateProjects takes a mongo pipeline to retrieve the project details from the database
func (r repository) GetAggregateProjects(pipeline mongo.Pipeline, opts *options.AggregateOptions) (*mongo.Cursor, error) {
	results, err := r.Collection.Aggregate(context.TODO(), pipeline, opts)
	if err != nil {
		return nil, err
	}

	return results, nil
}

// UpdateUserState updates the deactivated_at state of the member and removed_at field of the project
func (r repository) UpdateProjectState(userID string, deactivateTime string) error {
	opts := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.D{{"elem.user_id", userID}},
		},
	})

	filter := bson.D{{}}
	update := bson.D{
		{"$set", bson.D{
			{"members.$[elem].deactivated_at", deactivateTime},
		}},
	}

	_, err := r.Collection.UpdateMany(context.Background(), filter, update, opts)
	if err != nil {
		//log.Print("Error updating user's state in projects : ", err)
		return err
	}

	filter = bson.D{
		{"members", bson.D{
			{"$elemMatch", bson.D{
				{"user_id", userID},
				{"role", bson.D{
					{"$eq", entities.RoleOwner},
				}},
			}},
		}}}

	update = bson.D{
		{"$set", bson.D{
			{"removed_at", deactivateTime},
		}},
	}

	_, err = r.Collection.UpdateMany(context.Background(), filter, update)
	if err != nil {
		//log.Print("Error updating user's state in projects : ", err)
		return err
	}

	return nil
}

// NewRepo creates a new instance of this repository
func NewRepo(collection *mongo.Collection) Repository {
	return &repository{
		Collection: collection,
	}
}
