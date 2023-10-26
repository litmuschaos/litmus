package handler

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	dbOperationsEnvironment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/environments"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type EnvironmentHandler interface {
	CreateEnvironment(ctx context.Context, projectID string, input *model.CreateEnvironmentRequest) (*model.Environment, error)
	UpdateEnvironment(ctx context.Context, projectID string, request *model.UpdateEnvironmentRequest) (string, error)
	DeleteEnvironment(ctx context.Context, projectID string, environmentID string) (string, error)
	GetEnvironment(projectID string, environmentID string) (*model.Environment, error)
	ListEnvironments(projectID string, request *model.ListEnvironmentRequest) (*model.ListEnvironmentResponse, error)
}

type EnvironmentService struct {
	EnvironmentOperator *dbOperationsEnvironment.Operator
}

func NewEnvironmentService(EnvironmentOperator *dbOperationsEnvironment.Operator) EnvironmentHandler {
	return &EnvironmentService{
		EnvironmentOperator: EnvironmentOperator,
	}
}

func (e *EnvironmentService) CreateEnvironment(ctx context.Context, projectID string, input *model.CreateEnvironmentRequest) (*model.Environment, error) {

	currentTime := time.Now()
	if input.Tags == nil || len(input.Tags) == 0 {
		input.Tags = []string{}
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return nil, err
	}

	desc := ""
	if input.Description != nil {
		desc = *input.Description
	}
	infraIds := []string{}

	newEnv := environments.Environment{
		EnvironmentID: input.EnvironmentID,
		ResourceDetails: mongodb.ResourceDetails{
			Name:        input.Name,
			Description: desc,
			Tags:        input.Tags,
		},
		ProjectID: projectID,
		Type:      environments.EnvironmentType(input.Type),
		InfraIDs:  infraIds,
		Audit: mongodb.Audit{
			CreatedAt: currentTime.UnixMilli(),
			UpdatedAt: currentTime.UnixMilli(),
			IsRemoved: false,
			CreatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
			UpdatedBy: mongodb.UserDetailResponse{
				Username: username,
			},
		},
	}

	err = e.EnvironmentOperator.InsertEnvironment(context.Background(), newEnv)
	if err != nil {
		return &model.Environment{}, err
	}

	return &model.Environment{
		EnvironmentID: input.EnvironmentID,
		ProjectID:     projectID,
		Name:          input.Name,
		Description:   input.Description,
		Tags:          input.Tags,
		Type:          input.Type,
	}, nil

}

func (e *EnvironmentService) UpdateEnvironment(ctx context.Context, projectID string, request *model.UpdateEnvironmentRequest) (string, error) {

	query := bson.D{
		{"environment_id", request.EnvironmentID},
		{"project_id", projectID},
		{"is_removed", false},
	}

	_, err := e.EnvironmentOperator.GetEnvironments(context.TODO(), query)
	if err != nil {
		return "couldn't update environment", err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return "", err
	}

	updateQuery := bson.D{}
	updateQuery = append(updateQuery, bson.E{
		Key: "$set", Value: bson.D{
			{"updated_at", time.Now().UnixMilli()},
			{"updated_by", mongodb.UserDetailResponse{
				Username: username,
			}},
		},
	})
	if request.Name != nil {
		updateQuery = append(updateQuery, bson.E{
			Key: "$set", Value: bson.D{
				{"name", request.Name},
			},
		})
	}

	if request.Description != nil {
		updateQuery = append(updateQuery, bson.E{
			Key: "$set", Value: bson.D{
				{"description", request.Description},
			},
		})
	}
	if request.Tags != nil {
		updateQuery = append(updateQuery, bson.E{
			Key: "$set", Value: bson.D{
				{"tags", request.Tags},
			},
		})
	}
	if request.Type != nil {
		updateQuery = append(updateQuery, bson.E{
			Key: "$set", Value: bson.D{
				{"type", request.Type},
			},
		})
	}

	err = e.EnvironmentOperator.UpdateEnvironment(context.TODO(), query, updateQuery)
	if err != nil {
		return "couldn't update environment", err
	}
	return "environment updated successfully", nil
}

func (e *EnvironmentService) DeleteEnvironment(ctx context.Context, projectID string, environmentID string) (string, error) {
	currTime := time.Now().UnixMilli()
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return "", err
	}
	query := bson.D{
		{"environment_id", environmentID},
		{"project_id", projectID},
		{"is_removed", false},
	}

	_, err = e.EnvironmentOperator.GetEnvironment(query)
	if err != nil {
		return "couldn't fetch environment details", err
	}

	update := bson.D{
		{"$set", bson.D{
			{"is_removed", true},
			{"updated_at", currTime},
			{"updated_by", mongodb.UserDetailResponse{
				Username: username,
			}},
		}},
	}
	err = e.EnvironmentOperator.UpdateEnvironment(context.TODO(), query, update)
	if err != nil {
		return "couldn't delete environment", err
	}
	return "successfully deleted environment", nil
}

func (e *EnvironmentService) GetEnvironment(projectID string, environmentID string) (*model.Environment, error) {
	query := bson.D{
		{"environment_id", environmentID},
		{"project_id", projectID},
		{"is_removed", false},
	}

	env, err := e.EnvironmentOperator.GetEnvironment(query)
	if err != nil {
		return &model.Environment{}, err
	}

	return &model.Environment{
		EnvironmentID: env.EnvironmentID,
		ProjectID:     env.ProjectID,
		Name:          env.Name,
		Description:   &env.Description,
		Tags:          env.Tags,
		Type:          model.EnvironmentType(env.Type),
		CreatedAt:     strconv.FormatInt(env.CreatedAt, 10),
		UpdatedAt:     strconv.FormatInt(env.UpdatedAt, 10),
		CreatedBy:     &model.UserDetails{Username: env.CreatedBy.Username},
		UpdatedBy:     &model.UserDetails{Username: env.UpdatedBy.Username},
		InfraIDs:      env.InfraIDs,
		IsRemoved:     &env.IsRemoved,
	}, nil

}

func (e *EnvironmentService) ListEnvironments(projectID string, request *model.ListEnvironmentRequest) (*model.ListEnvironmentResponse, error) {
	var pipeline mongo.Pipeline

	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", projectID},
			{"is_removed", false},
		}},
	}
	pipeline = append(pipeline, matchIdentifierStage)
	if request != nil {
		// Match with environment IDs
		if request.EnvironmentIDs != nil && len(request.EnvironmentIDs) != 0 {
			matchEnvStage := bson.D{
				{"$match", bson.D{
					{"environment_id", bson.D{
						{"$in", request.EnvironmentIDs},
					}},
				}},
			}
			pipeline = append(pipeline, matchEnvStage)
		}
	}

	// Filtering based on given parameters
	if request.Filter != nil {
		// Filtering based on chaos_infra name
		if request.Filter.Name != nil && *request.Filter.Name != "" {
			matchInfraNameStage := bson.D{
				{"$match", bson.D{
					{"name", bson.M{
						"$regex": request.Filter.Name, "$options": "mix",
					}},
				}},
			}
			pipeline = append(pipeline, matchInfraNameStage)
		}

		// Filtering based on description
		if request.Filter.Description != nil && *request.Filter.Description != "" {
			matchDescriptionStage := bson.D{
				{"$match", bson.D{
					{"description", bson.M{
						"$regex": request.Filter.Description, "$options": "mix",
					}},
				}},
			}
			pipeline = append(pipeline, matchDescriptionStage)
		}

		// Filtering based on description
		if request.Filter.Type != nil && *request.Filter.Type != "" {
			matchTypeStage := bson.D{
				{"$match", bson.D{
					{"type", request.Filter.Type},
				}},
			}
			pipeline = append(pipeline, matchTypeStage)
		}

		// Filtering based on tags
		if request.Filter.Tags != nil && len(request.Filter.Tags) > 0 {
			matchInfraTagsStage := bson.D{
				{"$match", bson.D{
					{"tags", bson.D{
						{"$all", request.Filter.Tags},
					}},
				}},
			}
			pipeline = append(pipeline, matchInfraTagsStage)
		}

	}

	var sortStage bson.D

	switch {
	case request.Sort != nil && request.Sort.Field == model.EnvironmentSortingFieldTime:
		// Sorting based on created time
		if request.Sort.Ascending != nil && *request.Sort.Ascending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"created_at", 1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"created_at", -1},
				}},
			}
		}
	case request.Sort != nil && request.Sort.Field == model.EnvironmentSortingFieldName:
		// Sorting based on ExperimentName time
		if request.Sort.Ascending != nil && *request.Sort.Ascending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"name", 1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"name", -1},
				}},
			}
		}
	default:
		// Default sorting: sorts it by created_at time in descending order
		sortStage = bson.D{
			{"$sort", bson.D{
				{"created_at", -1},
			}},
		}
	}

	// Pagination or adding a default limit of 15 if pagination not provided
	paginatedExperiments := bson.A{
		sortStage,
	}

	if request.Pagination != nil {
		paginationSkipStage := bson.D{
			{"$skip", request.Pagination.Page * request.Pagination.Limit},
		}
		paginationLimitStage := bson.D{
			{"$limit", request.Pagination.Limit},
		}

		paginatedExperiments = append(paginatedExperiments, paginationSkipStage, paginationLimitStage)
	} else {
		limitStage := bson.D{
			{"$limit", 15},
		}

		paginatedExperiments = append(paginatedExperiments, limitStage)
	}

	// Add two stages where we first count the number of filtered workflow and then paginate the results
	facetStage := bson.D{
		{"$facet", bson.D{
			{"total_filtered_environments", bson.A{
				bson.D{{"$count", "count"}},
			}},
			{"environments", paginatedExperiments},
		}},
	}
	pipeline = append(pipeline, facetStage)

	cursor, err := e.EnvironmentOperator.GetAggregateEnvironments(pipeline)
	if err != nil {
		return nil, err
	}

	var (
		envs                   []*model.Environment
		aggregatedEnvironments []environments.AggregatedEnvironments
	)

	if err = cursor.All(context.Background(), &aggregatedEnvironments); err != nil || len(aggregatedEnvironments) == 0 {
		return &model.ListEnvironmentResponse{
			TotalNoOfEnvironments: 0,
			Environments:          envs,
		}, errors.New("error decoding environment cursor: " + err.Error())
	}
	if len(aggregatedEnvironments) == 0 {
		return &model.ListEnvironmentResponse{
			TotalNoOfEnvironments: 0,
			Environments:          envs,
		}, nil
	}

	for _, env := range aggregatedEnvironments[0].Environments {
		envs = append(envs, &model.Environment{
			EnvironmentID: env.EnvironmentID,
			ProjectID:     env.ProjectID,
			Name:          env.Name,
			Description:   &env.Description,
			Tags:          env.Tags,
			Type:          model.EnvironmentType(env.Type),
			CreatedAt:     strconv.FormatInt(env.CreatedAt, 10),
			UpdatedAt:     strconv.FormatInt(env.UpdatedAt, 10),
			CreatedBy:     &model.UserDetails{Username: env.CreatedBy.Username},
			UpdatedBy:     &model.UserDetails{Username: env.UpdatedBy.Username},
			InfraIDs:      env.InfraIDs,
			IsRemoved:     &env.IsRemoved,
		})
	}

	totalFilteredEnvironmentsCounter := 0
	if len(envs) > 0 && len(aggregatedEnvironments[0].TotalFilteredEnvironments) > 0 {
		totalFilteredEnvironmentsCounter = aggregatedEnvironments[0].TotalFilteredEnvironments[0].Count
	}

	output := model.ListEnvironmentResponse{
		TotalNoOfEnvironments: totalFilteredEnvironmentsCounter,
		Environments:          envs,
	}

	return &output, nil
}
