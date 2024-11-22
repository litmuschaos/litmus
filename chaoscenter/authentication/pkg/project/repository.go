package project

import (
	"context"
	"errors"
	"log"
	"time"

	project_utils "github.com/litmuschaos/litmus/chaoscenter/authentication/api/utils"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Repository holds the mongo database implementation of the Service
type Repository interface {
	GetProjectByProjectID(projectID string) (*entities.Project, error)
	GetProjects(query bson.D) ([]*entities.Project, error)
	GetProjectsByUserID(request *entities.ListProjectRequest) (*entities.ListProjectResponse, error)
	GetProjectStats() ([]*entities.ProjectStats, error)
	CreateProject(project *entities.Project) error
	AddMember(projectID string, member *entities.Member) error
	RemoveInvitation(projectID string, userID string, invitation entities.Invitation) error
	UpdateInvite(projectID string, userID string, invitation entities.Invitation, role *entities.MemberRole) error
	UpdateProjectName(projectID string, projectName string) error
	UpdateMemberRole(projectID string, userID string, role *entities.MemberRole) error
	GetAggregateProjects(pipeline mongo.Pipeline, opts *options.AggregateOptions) (*mongo.Cursor, error)
	UpdateProjectState(ctx context.Context, userID string, deactivateTime int64, isDeactivate bool) error
	GetOwnerProjects(ctx context.Context, userID string) ([]*entities.Project, error)
	GetProjectRole(projectID string, userID string) (*entities.MemberRole, error)
	GetProjectMembers(projectID string, state string) ([]*entities.Member, error)
	GetProjectOwners(projectID string) ([]*entities.Member, error)
	DeleteProject(projectID string) error
	ListInvitations(userID string, invitationState entities.Invitation) ([]*entities.Project, error)
}

type repository struct {
	Collection *mongo.Collection
}

// GetProjectByProjectID returns a project based on a query or filter value
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
func (r repository) GetProjectsByUserID(request *entities.ListProjectRequest) (*entities.ListProjectResponse, error) {
	var projects []*entities.Project
	ctx := context.TODO()

	// Construct the pipeline
	var pipeline mongo.Pipeline

	// Match stage
	pipeline = append(pipeline, project_utils.CreateMatchStage(request.UserID))

	// Filter stage
	if request.Filter != nil {
		filterStages := project_utils.CreateFilterStages(request.Filter, request.UserID)
		pipeline = append(pipeline, filterStages...)
	}

	// Sort stage
	sortStage := project_utils.CreateSortStage(request.Sort)
	if len(sortStage) > 0 {
		pipeline = append(pipeline, sortStage)
	}

	// Pagination stages
	paginationStages := project_utils.CreatePaginationStage(request.Pagination)

	// Facet stage to count total projects and paginate results
	facetStage := bson.D{
		{"$facet", bson.D{
			{"totalCount", bson.A{
				bson.D{{"$count", "totalNumberOfProjects"}},
			}},
			{"projects", append(mongo.Pipeline{}, paginationStages...)},
		}},
	}
	pipeline = append(pipeline, facetStage)

	// Execute the aggregate pipeline
	cursor, err := r.Collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Extract results
	var result struct {
		TotalCount []struct {
			TotalNumberOfProjects int64 `bson:"totalNumberOfProjects"`
		} `bson:"totalCount"`
		Projects []*entities.Project `bson:"projects"`
	}

	if cursor.Next(ctx) {
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
	}

	var totalNumberOfProjects int64
	if len(result.TotalCount) > 0 {
		totalNumberOfProjects = result.TotalCount[0].TotalNumberOfProjects
	} else {
		zero := int64(0)
		return &entities.ListProjectResponse{
			Projects:              projects,
			TotalNumberOfProjects: &zero,
		}, nil
	}

	projects = result.Projects

	response := entities.ListProjectResponse{
		Projects:              projects,
		TotalNumberOfProjects: &totalNumberOfProjects,
	}

	return &response, nil
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
	query := bson.D{{"_id", bson.D{{"$eq", projectID}}}}
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
	query := bson.D{{"_id", bson.D{{"$eq", projectID}}}}
	update := bson.D{
		{"$pull", bson.D{
			{"members", bson.D{
				{"user_id", userID},
			}},
		}},
	}

	result, err := r.Collection.UpdateOne(context.TODO(), query, update)
	if err != nil {
		// TODO check it's usage
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
				{"members.$[elem].joined_at", time.Now().UnixMilli()},
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
	query := bson.D{{"_id", bson.D{{"$eq", projectID}}}}
	update := bson.D{{"$set", bson.M{"name": projectName}}}

	_, err := r.Collection.UpdateOne(context.TODO(), query, update)
	if err != nil {
		return err
	}

	return nil
}

// UpdateMemberRole : Updates Role of the member in the project.
func (r repository) UpdateMemberRole(projectID string, userID string, role *entities.MemberRole) error {
	opts := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{
			bson.D{{"elem.user_id", userID}},
		},
	})
	query := bson.D{{"_id", bson.D{{"$eq", projectID}}}}
	update := bson.D{{"$set", bson.M{"members.$[elem].role": role}}}

	_, err := r.Collection.UpdateOne(context.TODO(), query, update, opts)
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

// UpdateProjectState updates the deactivated_at state of the member and removed_at field of the project
func (r repository) UpdateProjectState(ctx context.Context, userID string, deactivateTime int64, isDeactivate bool) error {
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

	_, err := r.Collection.UpdateMany(ctx, filter, update, opts)
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
			{"is_removed", isDeactivate},
		}},
	}

	_, err = r.Collection.UpdateMany(ctx, filter, update)
	if err != nil {
		//log.Print("Error updating user's state in projects : ", err)
		return err
	}

	return nil
}

// GetOwnerProjects takes a userID to retrieve the project IDs in which user is the owner
func (r repository) GetOwnerProjects(ctx context.Context, userID string) ([]*entities.Project, error) {
	filter := bson.D{
		{"members", bson.D{
			{"$elemMatch", bson.D{
				{"user_id", userID},
				{"role", bson.D{
					{"$eq", entities.RoleOwner},
				}},
			}},
		}}}

	pipeline := mongo.Pipeline{
		bson.D{{"$match", filter}},
		bson.D{{"$project", bson.D{
			{"name", 1},
			{"state", 1},
			{"created_at", 1},
			{"updated_at", 1},
			{"created_by", 1},
			{"updated_by", 1},
			{"is_removed", 1},
			{"members", bson.D{
				{"$filter", bson.D{
					{"input", "$members"},
					{"as", "member"},
					{"cond", bson.D{{
						"$eq", bson.A{"$$member.invitation", entities.AcceptedInvitation},
					}}},
				}},
			}},
		}}},
	}

	cursor, err := r.GetAggregateProjects(pipeline, nil)
	if err != nil {
		return nil, err
	}

	var projects []*entities.Project
	err = cursor.All(context.TODO(), &projects)
	if err != nil {
		return nil, err
	}

	return projects, nil
}

// GetProjectOwners takes projectID and returns the owners
func (r repository) GetProjectOwners(projectID string) ([]*entities.Member, error) {
	filter := bson.D{{"_id", bson.D{{"$eq", projectID}}}}

	var project struct {
		Members []*entities.Member `bson:"members"`
	}
	err := r.Collection.FindOne(context.TODO(), filter).Decode(&project)
	if err != nil {
		return nil, err
	}

	// Filter the members to include only the owners
	var owners []*entities.Member
	for _, member := range project.Members {
		if member.Role == entities.RoleOwner && member.Invitation == entities.AcceptedInvitation {
			owners = append(owners, member)
		}
	}
	return owners, nil
}

// GetProjectRole returns the role of a user in the project
func (r repository) GetProjectRole(projectID string, userID string) (*entities.MemberRole, error) {
	filter := bson.D{
		{"_id", projectID},
	}
	projection := bson.D{
		{"_id", 0},
		{"members", bson.D{
			{"$elemMatch", bson.D{
				{"user_id", userID},
				{"invitation", entities.AcceptedInvitation},
			}},
		}},
	}

	var res struct {
		Members []*entities.Member `bson:"members"`
	}
	findOneErr := r.Collection.FindOne(context.TODO(), filter, options.FindOne().SetProjection(projection)).Decode(&res)
	if findOneErr != nil {
		return nil, findOneErr
	}

	if len(res.Members) == 0 {
		return nil, nil
	}
	return &(res.Members[0].Role), nil
}

func (r repository) GetProjectMembers(projectID string, state string) ([]*entities.Member, error) {
	var pipeline mongo.Pipeline
	filter := bson.D{
		{"$match", bson.D{
			{"_id", projectID},
		}},
	}
	pipeline = append(pipeline, filter)
	var projection bson.D
	switch state {
	case string(entities.Accepted):
		projection = bson.D{
			{"$project", bson.D{
				{"_id", 0},
				{"members", bson.D{
					{"$filter", bson.D{
						{"input", "$members"},
						{"as", "member"},
						{"cond", bson.D{{
							"$eq", bson.A{"$$member.invitation", entities.AcceptedInvitation},
						}}},
					}},
				}},
			}},
		}
		pipeline = append(pipeline, projection)
	case string(entities.NotAccepted):
		projection = bson.D{
			{"$project", bson.D{
				{"_id", 0},
				{"members", bson.D{
					{"$filter", bson.D{
						{"input", "$members"},
						{"as", "member"},
						{"cond", bson.D{{
							"$ne", bson.A{"$$member.invitation", entities.AcceptedInvitation},
						}}},
					}},
				}},
			}},
		}
		pipeline = append(pipeline, projection)
	case string(entities.All):
		projection = bson.D{
			{"$project", bson.D{
				{"_id", 0},
				{"members", 1},
			}},
		}
		pipeline = append(pipeline, projection)
	}

	var res []entities.Members
	cursor, err := r.GetAggregateProjects(pipeline, nil)
	if err != nil {
		return nil, err
	}

	if err = cursor.All(context.TODO(), &res); err != nil {
		return nil, err
	}

	if len(res) <= 0 {
		return nil, nil
	}
	return res[0].Members, nil
}

func (r repository) ListInvitations(userID string, invitationState entities.Invitation) ([]*entities.Project, error) {

	var pipeline mongo.Pipeline
	var filter bson.D
	if invitationState == entities.PendingInvitation {
		filter = bson.D{
			{"$match", bson.D{
				{"members", bson.D{
					{"$elemMatch", bson.D{
						{"user_id", userID},
						{"invitation", bson.D{
							{"$eq", invitationState},
						}},
					}},
				}}},
			},
		}
	} else if invitationState == entities.AcceptedInvitation {
		filter = bson.D{
			{"$match", bson.D{
				{"members", bson.D{
					{"$elemMatch", bson.D{
						{"user_id", userID},
						{"role", bson.D{
							{"$ne", entities.RoleOwner},
						}},
						{"invitation", bson.D{
							{"$eq", invitationState},
						}},
					}},
				}}},
			},
		}
	}
	pipeline = append(pipeline, filter)

	projection := bson.D{
		{"$project", bson.D{
			{"name", 1},
			{"members", bson.D{
				{"$filter", bson.D{
					{"input", "$members"},
					{"as", "member"},
					{"cond", bson.D{
						{"$or", bson.A{
							bson.D{{"$and", bson.A{
								bson.D{{"$eq", bson.A{"$$member.invitation", invitationState}}},
								bson.D{{"$eq", bson.A{"$$member.user_id", userID}}},
							}}},
							bson.D{{"$eq", bson.A{"$$member.role", entities.RoleOwner}}},
						}},
					}},
				}},
			}},
		}},
	}
	pipeline = append(pipeline, projection)
	cursor, err := r.GetAggregateProjects(pipeline, nil)
	if err != nil {
		return nil, err
	}

	var projects []*entities.Project
	err = cursor.All(context.TODO(), &projects)
	if err != nil {
		return nil, err
	}

	return projects, nil

}

// NewRepo creates a new instance of this repository
func NewRepo(collection *mongo.Collection) Repository {
	return &repository{
		Collection: collection,
	}
}

// DeleteProject deletes the project with given projectID
func (r repository) DeleteProject(projectID string) error {
	query := bson.D{{"_id", bson.D{{"$eq", projectID}}}}

	result, err := r.Collection.DeleteOne(context.TODO(), query)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("no project found with the given projectID")
	}

	return nil
}
