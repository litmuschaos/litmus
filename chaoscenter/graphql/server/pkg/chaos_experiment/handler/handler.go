package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"time"

	probeUtils "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/utils"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment/ops"
	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"

	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/tidwall/sjson"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	types "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment"
	chaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"

	"github.com/google/uuid"
)

// ChaosExperimentHandler is the handler for chaos experiment
type ChaosExperimentHandler struct {
	chaosExperimentService     ops.Service
	chaosExperimentRunService  chaosExperimentRun.Service
	infrastructureService      chaos_infrastructure.Service
	gitOpsService              gitops.Service
	chaosExperimentOperator    *dbChaosExperiment.Operator
	chaosExperimentRunOperator *dbChaosExperimentRun.Operator
	mongodbOperator            mongodb.MongoOperator
}

// NewChaosExperimentHandler returns a new instance of ChaosWorkflowHandler
func NewChaosExperimentHandler(
	chaosExperimentService ops.Service,
	chaosExperimentRunService chaosExperimentRun.Service,
	infrastructureService chaos_infrastructure.Service,
	gitOpsService gitops.Service,
	chaosExperimentOperator *dbChaosExperiment.Operator,
	chaosExperimentRunOperator *dbChaosExperimentRun.Operator,
	mongodbOperator mongodb.MongoOperator,
) *ChaosExperimentHandler {
	return &ChaosExperimentHandler{
		chaosExperimentService:     chaosExperimentService,
		chaosExperimentRunService:  chaosExperimentRunService,
		infrastructureService:      infrastructureService,
		gitOpsService:              gitOpsService,
		chaosExperimentOperator:    chaosExperimentOperator,
		chaosExperimentRunOperator: chaosExperimentRunOperator,
		mongodbOperator:            mongodbOperator,
	}
}

func (c *ChaosExperimentHandler) SaveChaosExperiment(ctx context.Context, request model.SaveChaosExperimentRequest, projectID string, r *store.StateData) (string, error) {

	var revID = uuid.New().String()

	logFields := logrus.Fields{
		"experimentId": request.ID,
	}

	// Check if the workflow_name exists under same project
	wfDetails, err := c.chaosExperimentOperator.GetExperiment(ctx, bson.D{
		{"experiment_id", request.ID},
		{"tags", request.Tags},
		{"is_removed", false},
	})
	if err != nil && err != mongo.ErrNoDocuments {
		return "", err
	}

	// typecasting request into chaosExperimentRequest
	chaosWfReq := model.ChaosExperimentRequest{
		ExperimentID:          &request.ID,
		ExperimentManifest:    request.Manifest,
		ExperimentType:        request.Type,
		ExperimentName:        request.Name,
		ExperimentDescription: request.Description,
		InfraID:               request.InfraID,
		Tags:                  request.Tags,
	}

	newRequest, wfType, err := c.chaosExperimentService.ProcessExperiment(ctx, &chaosWfReq, projectID, revID)
	if err != nil {
		return "", err
	}
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return "", err
	}

	// Updating the existing experiment
	if wfDetails.ExperimentID == request.ID {
		logrus.WithFields(logFields).Info("request received to update k8s chaos experiment")
		if wfDetails.Name != request.Name {
			err = c.validateDuplicateExperimentName(ctx, projectID, request.Name)
			if err != nil {
				return "", err
			}
		}

		// Gitops Update
		err = c.gitOpsService.UpsertExperimentToGit(ctx, projectID, newRequest)
		if err != nil {
			logrus.WithFields(logFields).Errorf("failed to push the experiment manifest to Git., err: %v", err)
			return "", err
		}

		err = c.chaosExperimentService.ProcessExperimentUpdate(newRequest, username, wfType, revID, false, projectID, nil)
		if err != nil {
			return "", err
		}

		return "experiment updated successfully", nil
	}
	err = c.validateDuplicateExperimentName(ctx, projectID, request.Name)
	if err != nil {
		return "", err
	}

	// Saving chaos experiment in the DB
	logrus.WithFields(logFields).Info("request received to save k8s chaos experiment")

	// Gitops Update
	err = c.gitOpsService.UpsertExperimentToGit(ctx, projectID, newRequest)
	if err != nil {
		logrus.WithFields(logFields).Errorf("failed to push the experiment manifest to Git, err: %v", err)
		return "", err
	}

	err = c.chaosExperimentService.ProcessExperimentCreation(ctx, newRequest, username, projectID, wfType, revID, nil)
	if err != nil {
		return "", err
	}

	return "experiment saved successfully", nil
}

func (c *ChaosExperimentHandler) CreateChaosExperiment(ctx context.Context, request *model.ChaosExperimentRequest, projectID string, r *store.StateData) (*model.ChaosExperimentResponse, error) {

	var revID = uuid.New().String()

	// Check if the experiment_name exists under same project
	err := c.validateDuplicateExperimentName(ctx, projectID, request.ExperimentName)
	if err != nil {
		return nil, err
	}

	newRequest, wfType, err := c.chaosExperimentService.ProcessExperiment(ctx, request, projectID, revID)
	if err != nil {
		return nil, err
	}

	// Gitops Update
	err = c.gitOpsService.UpsertExperimentToGit(ctx, projectID, newRequest)
	if err != nil {
		return nil, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	uid, err := authorization.GetUsername(tkn)
	err = c.chaosExperimentService.ProcessExperimentCreation(context.TODO(), newRequest, uid, projectID, wfType, revID, r)
	if err != nil {
		return nil, err
	}

	return &model.ChaosExperimentResponse{
		ExperimentID:          *newRequest.ExperimentID,
		CronSyntax:            newRequest.CronSyntax,
		ExperimentName:        newRequest.ExperimentName,
		ExperimentDescription: newRequest.ExperimentDescription,
		IsCustomExperiment:    newRequest.IsCustomExperiment,
	}, nil
}

func (c *ChaosExperimentHandler) DeleteChaosExperiment(ctx context.Context, projectID string, workflowID string, workflowRunID *string, r *store.StateData) (bool, error) {
	query := bson.D{
		{"experiment_id", workflowID},
		{"project_id", projectID},
	}

	// get infra details
	// set a flag based on infra active/inactive
	workflow, err := c.chaosExperimentOperator.GetExperiment(context.TODO(), query)
	if err != nil {
		return false, err
	}

	if workflow.IsRemoved {
		return false, errors.New("chaos experiment already deleted: " + workflowID)
	}
	tkn := ctx.Value(authorization.AuthKey).(string)
	uid, err := authorization.GetUsername(tkn)

	// If workflowRunID is nil, delete the experiment and all its corresponding runs
	if workflowRunID == nil {
		if workflow.CronSyntax != "" {

			err = c.DisableCronExperiment(uid, workflow, projectID, r)
			if err != nil {
				return false, err
			}
		}
		wf := model.ChaosExperimentRequest{
			ExperimentID:   &workflow.ExperimentID,
			ExperimentName: workflow.Name,
		}

		err = c.gitOpsService.DeleteExperimentFromGit(ctx, projectID, &wf)
		if err != nil {
			logrus.Errorf("error deleting experiment manifest from git, err: %v", err)
			return false, err
		}
		// Delete experiment
		err = c.chaosExperimentService.ProcessExperimentDelete(query, workflow, uid, r)
		if err != nil {
			return false, err
		}

	} else if workflowRunID != nil && *workflowRunID != "" {
		query := bson.D{
			{"experiment_id", workflowID},
			{"experiment_run_id", workflowRunID},
		}
		workflowRun, err := c.chaosExperimentRunOperator.GetExperimentRun(query)
		if err != nil {
			return false, err
		}

		workflowRun.IsRemoved = true

		wf := model.ChaosExperimentRequest{
			ExperimentID:   &workflow.ExperimentID,
			ExperimentName: workflow.Name,
		}

		err = c.gitOpsService.DeleteExperimentFromGit(ctx, projectID, &wf)
		if err != nil {
			logrus.Errorf("Failed to delete experiment manifest from git, err: %v", err)
			return false, err
		}

		err = c.chaosExperimentRunService.ProcessExperimentRunDelete(ctx, query, workflowRunID, workflowRun, workflow, uid, r)
		if err != nil {
			return false, err
		}
	}

	return true, nil
}

func (c *ChaosExperimentHandler) UpdateChaosExperiment(ctx context.Context, request model.ChaosExperimentRequest, projectID string, r *store.StateData) (*model.ChaosExperimentResponse, error) {
	var (
		revID = uuid.New().String()
	)

	// Check if the experiment_name exists under same project
	err := c.validateDuplicateExperimentName(ctx, projectID, request.ExperimentName)
	if err != nil {
		return nil, err
	}

	newRequest, wfType, err := c.chaosExperimentService.ProcessExperiment(ctx, &request, projectID, revID)
	if err != nil {
		return nil, err
	}
	tkn := ctx.Value(authorization.AuthKey).(string)
	uid, err := authorization.GetUsername(tkn)

	err = c.gitOpsService.UpsertExperimentToGit(ctx, projectID, newRequest)
	if err != nil {
		logrus.Errorf("failed to push experiment manifest to git, err: %v", err)
		return nil, err
	}

	err = c.chaosExperimentService.ProcessExperimentUpdate(newRequest, uid, wfType, revID, false, projectID, r)
	if err != nil {
		return nil, err
	}

	return &model.ChaosExperimentResponse{
		ExperimentID:          *newRequest.ExperimentID,
		CronSyntax:            newRequest.CronSyntax,
		ExperimentName:        newRequest.ExperimentName,
		ExperimentDescription: newRequest.ExperimentDescription,
		IsCustomExperiment:    newRequest.IsCustomExperiment,
	}, nil
}

// GetExperiment returns details of the requested experiment
func (c *ChaosExperimentHandler) GetExperiment(ctx context.Context, projectID string, experimentID string) (*model.GetExperimentResponse, error) {
	var pipeline mongo.Pipeline

	// Match with identifiers
	pipeline = mongo.Pipeline{
		bson.D{
			{"$match", bson.D{
				{"experiment_id", experimentID},
				{"project_id", projectID},
				{"is_removed", false},
			}},
		},
	}

	// fetchRunDetailsStage calculates avg resiliency score for completed runs
	fetchRunDetailsStage := bson.D{
		{"$lookup", bson.D{
			{"from", "chaosExperimentRuns"},
			{"let", bson.D{{"expID", "$experiment_id"}}},
			{"pipeline", bson.A{
				bson.D{
					{"$match", bson.D{
						{"$expr", bson.D{
							{"$and", bson.A{
								bson.D{
									{"$eq", bson.A{"$experiment_id", "$$expID"}},
								},
								bson.D{
									{"$eq", bson.A{"$completed", true}},
								},
							}},
						}},
					}},
				},
				bson.D{
					{"$group", bson.D{
						{"_id", nil},
						{"avg", bson.D{
							{"$avg", "$resiliency_score"},
						}},
					}},
				},
			}},
			{"as", "avg_resiliency_score"},
		}},
	}
	pipeline = append(pipeline, fetchRunDetailsStage)

	// fetchKubernetesInfraDetailsStage adds infra details of corresponding experiment_id to each document
	fetchKubernetesInfraDetailsStage := bson.D{
		{"$lookup", bson.D{
			{"from", "chaosInfrastructures"},
			{"let", bson.M{"infraID": "$infra_id"}},
			{
				"pipeline", bson.A{
					bson.D{
						{"$match", bson.D{
							{"$expr", bson.D{
								{"$eq", bson.A{"$infra_id", "$$infraID"}},
							}},
						}},
					},
					bson.D{
						{"$project", bson.D{
							{"token", 0},
							{"infra_ns_exists", 0},
							{"infra_sa_exists", 0},
							{"access_key", 0},
						}},
					},
				},
			},
			{"as", "kubernetesInfraDetails"},
		}},
	}
	pipeline = append(pipeline, fetchKubernetesInfraDetailsStage)

	// Call aggregation on pipeline
	expCursor, err := c.chaosExperimentOperator.GetAggregateExperiments(pipeline)
	if err != nil {
		return nil, errors.New("DB aggregate stage error: " + err.Error())
	}

	var (
		expResponse *model.GetExperimentResponse
		expDetails  []dbChaosExperiment.GetExperimentDetails
	)

	if err = expCursor.All(context.Background(), &expDetails); err != nil {
		return nil, errors.New("error decoding experiment cursor: " + err.Error())
	}

	if len(expDetails) == 0 {
		return nil, errors.New("no matching experiments")
	}

	exp := expDetails[0]
	if len(exp.KubernetesInfraDetails) == 0 {
		return nil, errors.New("no matching infra found for given expDetails")
	}

	var chaosInfrastructure *model.Infra

	if len(exp.KubernetesInfraDetails) > 0 {
		infra := exp.KubernetesInfraDetails[0]
		infraType := model.InfrastructureType(infra.InfraType)
		chaosInfrastructure = &model.Infra{
			InfraID:        infra.InfraID,
			Name:           infra.Name,
			EnvironmentID:  infra.EnvironmentID,
			Description:    &infra.Description,
			PlatformName:   infra.PlatformName,
			IsActive:       infra.IsActive,
			UpdatedAt:      strconv.FormatInt(infra.UpdatedAt, 10),
			CreatedAt:      strconv.FormatInt(infra.CreatedAt, 10),
			InfraNamespace: infra.InfraNamespace,
			ServiceAccount: infra.ServiceAccount,
			InfraScope:     infra.InfraScope,
			StartTime:      infra.StartTime,
			Version:        infra.Version,
			Tags:           infra.Tags,
			InfraType:      &infraType,
		}
	}

	var weightages []*model.Weightages
	if exp.Revision[0].Weightages != nil {
		// TODO: Once we make the new chaos terminology change in APIs, then we can use the copier instead of for loop
		for _, v := range exp.Revision[len(exp.Revision)-1].Weightages {
			weightages = append(weightages, &model.Weightages{
				FaultName: v.FaultName,
				Weightage: v.Weightage,
			})
		}
	}

	var recentExpRuns []*model.RecentExperimentRun
	if len(exp.RecentExperimentRunDetails) > 0 {
		for _, v := range exp.RecentExperimentRunDetails {
			recentExpRuns = append(recentExpRuns, &model.RecentExperimentRun{
				ExperimentRunID: v.ExperimentRunID,
				Phase:           v.Phase,
				ResiliencyScore: v.ResiliencyScore,
				UpdatedBy: &model.UserDetails{
					Username: v.UpdatedBy.Username,
					UserID:   v.UpdatedBy.UserID,
				},
				CreatedBy: &model.UserDetails{
					Username: v.CreatedBy.Username,
					UserID:   v.CreatedBy.UserID,
				},
				UpdatedAt:   strconv.FormatInt(v.UpdatedAt, 10),
				CreatedAt:   strconv.FormatInt(v.CreatedAt, 10),
				RunSequence: v.RunSequence,
			})
		}
	}

	var avg float64
	// Truncating score to 2 decimal places
	if len(exp.AvgResiliencyScore) > 0 {
		avg = utils.Truncate(*exp.AvgResiliencyScore[0].Avg)
	}
	expResponse = &model.GetExperimentResponse{
		ExperimentDetails: &model.Experiment{
			ExperimentID:       exp.ExperimentID,
			Name:               exp.Name,
			Tags:               exp.Tags,
			CronSyntax:         exp.CronSyntax,
			Description:        exp.Description,
			Weightages:         weightages,
			IsCustomExperiment: exp.IsCustomExperiment,
			UpdatedAt:          strconv.FormatInt(exp.UpdatedAt, 10),
			CreatedAt:          strconv.FormatInt(exp.CreatedAt, 10),
			ExperimentManifest: exp.Revision[len(exp.Revision)-1].ExperimentManifest,
			ProjectID:          exp.ProjectID,
			IsRemoved:          exp.IsRemoved,
			Infra:              chaosInfrastructure,
			UpdatedBy: &model.UserDetails{
				Username: exp.UpdatedBy.Username,
			},
			CreatedBy: &model.UserDetails{
				Username: exp.UpdatedBy.Username,
			},
			RecentExperimentRunDetails: recentExpRuns,
		},
		AverageResiliencyScore: &avg,
	}

	return expResponse, nil

}

// ListExperiment returns all the workflows for matching identifiers from the DB
func (c *ChaosExperimentHandler) ListExperiment(projectID string, request model.ListExperimentRequest) (*model.ListExperimentResponse, error) {
	var pipeline mongo.Pipeline

	// Match the workflowIDs from the input array
	if len(request.ExperimentIDs) != 0 {
		pipeline = mongo.Pipeline{
			bson.D{
				{"$match", bson.D{
					{"experiment_id", bson.D{
						{"$in", request.ExperimentIDs},
					}},
				}},
			},
		}
	}

	// Match with identifiers
	matchIdStage := bson.D{
		{"$match", bson.D{
			{"project_id", projectID},
		}},
	}

	pipeline = append(pipeline, matchIdStage)
	//// Filtering out the workflows that are deleted/removed
	matchWfIsRemovedStage := bson.D{
		{"$match", bson.D{
			{"is_removed", bson.D{
				{"$eq", false},
			}},
		}},
	}
	pipeline = append(pipeline, matchWfIsRemovedStage)

	wfSortStage := bson.D{
		{"$sort", bson.D{
			{"updated_at", -1},
		}},
	}
	pipeline = append(pipeline, wfSortStage)

	// Filtering based on multiple parameters
	if request.Filter != nil {

		// Filtering based on workflow name
		if request.Filter.ExperimentName != nil && *request.Filter.ExperimentName != "" {
			matchWfNameStage := bson.D{
				{"$match", bson.D{
					{"name", bson.D{
						{"$regex", request.Filter.ExperimentName},
					}},
				}},
			}
			pipeline = append(pipeline, matchWfNameStage)
		}

		// Filtering based on infraId
		if request.Filter.InfraID != nil && *request.Filter.InfraID != "All" && *request.Filter.InfraID != "" {
			matchInfraStage := bson.D{
				{"$match", bson.D{
					{"infra_id", request.Filter.InfraID},
				}},
			}
			pipeline = append(pipeline, matchInfraStage)
		}

		// Filtering based on experiment type
		if request.Filter.ScheduleType != nil && *request.Filter.ScheduleType != model.ScheduleTypeAll {
			workflowType := ""
			if *request.Filter.ScheduleType == model.ScheduleTypeNonCron {
				workflowType = string(dbChaosExperiment.NonCronExperiment)
			} else if *request.Filter.ScheduleType == model.ScheduleTypeCron {
				workflowType = string(dbChaosExperiment.CronExperiment)
			}
			matchScenarioStage := bson.D{
				{"$match", bson.D{
					{"experiment_type", workflowType},
				}},
			}
			pipeline = append(pipeline, matchScenarioStage)
		}

		// Filtering based on infra types
		if len(request.Filter.InfraTypes) != 0 {
			matchInfraTypeStage := bson.D{
				{"$match", bson.D{
					{"infra_type", bson.D{
						{"$in", request.Filter.InfraTypes},
					}},
				}},
			}
			pipeline = append(pipeline, matchInfraTypeStage)
		}

		// Filtering based on date range (workflow's last updated time)
		if request.Filter.DateRange != nil {
			endDate := strconv.FormatInt(time.Now().UnixMilli(), 10)
			if request.Filter.DateRange.EndDate != nil {
				endDate = *request.Filter.DateRange.EndDate
			}

			filterWfDateStage := bson.D{
				{
					"$match",
					bson.D{{"updated_at", bson.D{
						{"$lte", endDate},
						{"$gte", request.Filter.DateRange.StartDate},
					}}},
				},
			}
			pipeline = append(pipeline, filterWfDateStage)
		}
	}

	// fetchKubernetesInfraDetailsStage adds infra details of corresponding experiment_id to each document
	fetchKubernetesInfraDetailsStage := bson.D{
		{"$lookup", bson.D{
			{"from", "chaosInfrastructures"},
			{"let", bson.M{"infraID": "$infra_id"}},
			{
				"pipeline", bson.A{
					bson.D{
						{"$match", bson.D{
							{"$expr", bson.D{
								{"$eq", bson.A{"$infra_id", "$$infraID"}},
							}},
						}},
					},
					bson.D{
						{"$project", bson.D{
							{"token", 0},
							{"infra_ns_exists", 0},
							{"infra_sa_exists", 0},
							{"access_key", 0},
						}},
					},
				},
			},
			{"as", "kubernetesInfraDetails"},
		}},
	}

	pipeline = append(pipeline, fetchKubernetesInfraDetailsStage)

	if request.Filter != nil && request.Filter.InfraActive != nil {
		filterInfraStatusStage := bson.D{
			{"$match", bson.D{
				{"$expr", bson.D{
					{"$cond", bson.D{
						{"if", bson.D{
							{"$gte", bson.A{
								bson.D{
									{"$size", "$kubernetesInfraDetails"},
								},
								1,
							}},
						}},
						{"then", bson.D{
							{"$in", bson.A{request.Filter.InfraActive, "$kubernetesInfraDetails.is_active"}},
						}},
						{"else", bson.A{}},
					}},
				}},
			}},
		}

		pipeline = append(pipeline, filterInfraStatusStage)

	}

	var sortStage bson.D

	switch {
	case request.Sort != nil && request.Sort.Field == model.ExperimentSortingFieldTime:
		// Sorting based on LastUpdated time
		if request.Sort.Ascending != nil && *request.Sort.Ascending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"updated_at", 1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"updated_at", -1},
				}},
			}
		}

	case request.Sort != nil && request.Sort.Field == model.ExperimentSortingFieldName:
		// Sorting based on ExperimentName
		if request.Sort.Ascending != nil && *request.Sort.Ascending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"name", -1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"name", 1},
				}},
			}
		}
	default:
		// Default sorting: sorts it by created_at time in descending order
		sortStage = bson.D{
			{"$sort", bson.D{
				{"updated_at", -1},
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
			{"total_filtered_experiments", bson.A{
				bson.D{{"$count", "count"}},
			}},
			{"scheduled_experiments", paginatedExperiments},
		}},
	}
	pipeline = append(pipeline, facetStage)

	// Call aggregation on pipeline
	workflowsCursor, err := c.chaosExperimentOperator.GetAggregateExperiments(pipeline)
	if err != nil {
		return nil, errors.New("DB aggregate stage error: " + err.Error())
	}

	var (
		result    []*model.Experiment
		workflows []dbChaosExperiment.AggregatedExperiments
	)

	if err = workflowsCursor.All(context.Background(), &workflows); err != nil || len(workflows) == 0 {
		return &model.ListExperimentResponse{
			TotalNoOfExperiments: 0,
			Experiments:          result,
		}, errors.New("error decoding experiments cursor: " + err.Error())
	}

	if len(workflows) == 0 {
		return &model.ListExperimentResponse{
			TotalNoOfExperiments: 0,
			Experiments:          result,
		}, nil
	}

	for _, workflow := range workflows[0].ScheduledExperiments {
		var chaosInfrastructure *model.Infra

		if len(workflow.KubernetesInfraDetails) > 0 {
			infra := workflow.KubernetesInfraDetails[0]
			infraType := model.InfrastructureType(infra.InfraType)
			chaosInfrastructure = &model.Infra{
				InfraID:        infra.InfraID,
				Name:           infra.Name,
				EnvironmentID:  infra.EnvironmentID,
				Description:    &infra.Description,
				PlatformName:   infra.PlatformName,
				IsActive:       infra.IsActive,
				UpdatedAt:      strconv.FormatInt(infra.UpdatedAt, 10),
				CreatedAt:      strconv.FormatInt(infra.CreatedAt, 10),
				InfraNamespace: infra.InfraNamespace,
				ServiceAccount: infra.ServiceAccount,
				InfraScope:     infra.InfraScope,
				StartTime:      infra.StartTime,
				Version:        infra.Version,
				Tags:           infra.Tags,
				InfraType:      &infraType,
			}
		}

		var weightages []*model.Weightages
		if workflow.Revision[0].Weightages != nil {
			// TODO: Once we make the new chaos terminology change in APIs, then we can use the copier instead of for loop
			for _, v := range workflow.Revision[len(workflow.Revision)-1].Weightages {
				weightages = append(weightages, &model.Weightages{
					FaultName: v.FaultName,
					Weightage: v.Weightage,
				})
			}
		}

		var recentExpRuns []*model.RecentExperimentRun
		if len(workflow.RecentExperimentRunDetails) > 0 {
			for _, v := range workflow.RecentExperimentRunDetails {
				recentExpRuns = append(recentExpRuns, &model.RecentExperimentRun{
					ExperimentRunID: v.ExperimentRunID,
					Phase:           v.Phase,
					ResiliencyScore: v.ResiliencyScore,
					UpdatedBy: &model.UserDetails{
						Username: v.UpdatedBy.Username,
					},
					CreatedBy: &model.UserDetails{
						Username: v.UpdatedBy.Username,
					},
					UpdatedAt:   strconv.FormatInt(v.UpdatedAt, 10),
					CreatedAt:   strconv.FormatInt(v.CreatedAt, 10),
					RunSequence: v.RunSequence,
				})
			}
		}

		newChaosExperiments := model.Experiment{
			ExperimentID:       workflow.ExperimentID,
			Name:               workflow.Name,
			Tags:               workflow.Tags,
			CronSyntax:         workflow.CronSyntax,
			Description:        workflow.Description,
			Weightages:         weightages,
			IsCustomExperiment: workflow.IsCustomExperiment,
			UpdatedAt:          strconv.FormatInt(workflow.UpdatedAt, 10),
			CreatedAt:          strconv.FormatInt(workflow.CreatedAt, 10),
			ExperimentType:     (*string)(&workflow.ExperimentType),
			ExperimentManifest: workflow.Revision[len(workflow.Revision)-1].ExperimentManifest,
			IsRemoved:          workflow.IsRemoved,
			Infra:              chaosInfrastructure,
			UpdatedBy: &model.UserDetails{
				Username: workflow.UpdatedBy.Username,
			},
			CreatedBy: &model.UserDetails{
				Username: workflow.UpdatedBy.Username,
			},
			RecentExperimentRunDetails: recentExpRuns,
		}
		result = append(result, &newChaosExperiments)

	}

	totalFilteredExperimentsCounter := 0
	if len(workflows) > 0 && len(workflows[0].TotalFilteredExperiments) > 0 {
		totalFilteredExperimentsCounter = workflows[0].TotalFilteredExperiments[0].Count
	}

	output := model.ListExperimentResponse{
		TotalNoOfExperiments: totalFilteredExperimentsCounter,
		Experiments:          result,
	}
	return &output, nil
}

// getWfRunDetails returns details of the latest workflow run of passed workflows.
func (c *ChaosExperimentHandler) getWfRunDetails(workflowIDs []string) (map[string]*types.LastRunDetails, error) {
	var pipeline mongo.Pipeline

	// Match the workflowID
	matchWfIdStage := bson.D{
		{
			"$match",
			bson.D{{
				"$and", bson.A{
					bson.D{{
						"experiment_id", bson.D{{"$in", workflowIDs}},
					}},
					bson.D{{
						"is_removed", false,
					}},
				},
			}},
		},
	}

	pipeline = append(pipeline, matchWfIdStage)

	projectStage := bson.D{
		{"$project", bson.D{
			{"experiment_id", 1},
			{"experiment_run_id", 1},
			{"updated_at", 1},
			{"phase", 1},
			{"resiliency_score", 1},
		}},
	}
	pipeline = append(pipeline, projectStage)

	// Flatten out the workflow runs
	sortStage := bson.D{
		{"$sort", bson.D{{"updated_at", -1}}},
	}
	pipeline = append(pipeline, sortStage)

	var workflowRunPipeline mongo.Pipeline
	// Get details of the latest wf run
	wfRunDetails := bson.D{
		{"$group", bson.D{
			{"_id", "$experiment_id"},

			// Fetch the latest workflowRun details
			{"experiment_run_details", bson.D{
				{
					"$first", "$$ROOT",
				},
			}},
		}},
	}
	workflowRunPipeline = append(workflowRunPipeline, wfRunDetails)

	var resScorePipeline mongo.Pipeline
	// Filtering out running workflow runs to calculate average resiliency score
	filterRunningWfRuns := bson.D{
		{
			"$match",
			bson.D{{
				"$and", bson.A{
					bson.D{{
						"experiment_id", bson.D{{"$in", workflowIDs}},
					}},
					bson.D{{"phase", bson.D{
						{"$ne", "Running"},
					}}},
				},
			}},
		},
	}
	resScorePipeline = append(resScorePipeline, filterRunningWfRuns)
	//// Calculating average resiliency score
	avgResiliencyScore := bson.D{
		{"$group", bson.D{
			{"_id", "$experiment_id"},

			// Count all workflowRuns in a workflow
			{"total_experiment_runs", bson.D{
				{"$sum", 1},
			}},

			// Calculate average
			{"avg_resiliency_score", bson.D{
				{"$avg", "$resiliency_score"},
			}},
		}},
	}
	resScorePipeline = append(resScorePipeline, avgResiliencyScore)

	// Add two stages where we first calculate the avg resiliency score of filtered workflow runs and then fetch details of the latest workflow run
	facetStage := bson.D{
		{"$facet", bson.D{
			{"avg_resiliency_score", resScorePipeline},
			{"latest_experiment_run", workflowRunPipeline},
		}},
	}
	pipeline = append(pipeline, facetStage)
	// Call aggregation on pipeline
	workflowsRunDetailCursor, err := c.chaosExperimentRunOperator.GetAggregateExperimentRuns(pipeline)
	if err != nil {
		return nil, err
	}

	var workflowRunDetails []types.ExperimentDetails
	if err = workflowsRunDetailCursor.All(context.Background(), &workflowRunDetails); err != nil || len(workflowRunDetails) == 0 {
		return nil, err
	}

	// Creating map with workflow run ID as key, and its details as value
	lastRunDetails := make(map[string]*types.LastRunDetails)
	for _, wfRun := range workflowRunDetails[0].LatestExperimentRun {
		lastRunDetails[wfRun.ID] = &types.LastRunDetails{
			ID:                  wfRun.ID,
			AvgResScore:         0,
			PercentageChange:    0,
			LatestExperimentRun: wfRun.ExperimentRunDetails,
		}
	}

	/*
		****Calculating percentage change****
			avgRes = sumRes / totalWfRuns
			sumRes = totalWfRuns * avgRes
			prevSumRes = sumRes - prevRes
			prevAvgRes = prevSumRes / (totalWfRuns-1)
			diffRes = avgRes - prevAvgRes
	*/

	for _, wfRun := range workflowRunDetails {
		for i, resScore := range wfRun.AverageResScore {
			lastRunDetails[resScore.ID].AvgResScore = utils.Truncate(resScore.Avg)
			if resScore.TotalExperimentRuns < 2 {
				lastRunDetails[resScore.ID].AvgResScore = utils.Truncate(resScore.Avg)
				continue
			}
			sumRes := float64(resScore.TotalExperimentRuns) * resScore.Avg
			prevSumRes := sumRes - *wfRun.LatestExperimentRun[i].ExperimentRunDetails.ResiliencyScore
			prevAvgRes := prevSumRes / float64(resScore.TotalExperimentRuns-1)
			lastRunDetails[resScore.ID].PercentageChange = utils.Truncate(resScore.Avg - prevAvgRes)
		}
	}
	return lastRunDetails, nil
}

func (c *ChaosExperimentHandler) DisableCronExperiment(username string, experiment dbChaosExperiment.ChaosExperimentRequest, projectID string, r *store.StateData) error {
	if len(experiment.Revision) < 1 {
		return fmt.Errorf("revision array is empty")
	}
	workflowManifest, err := sjson.Set(experiment.Revision[len(experiment.Revision)-1].ExperimentManifest, "spec.suspend", true)
	if err != nil {
		return err
	}

	var (
		revisionID string
		weightages []*model.WeightagesInput
	)

	if len(experiment.Revision) > 0 && experiment.Revision[len(experiment.Revision)-1].Weightages != nil {
		// TODO: Once we make the new chaos terminology change in APIs, then we can use the copier instead of for loop
		for _, v := range experiment.Revision[len(experiment.Revision)-1].Weightages {
			weightages = append(weightages, &model.WeightagesInput{
				FaultName: v.FaultName,
				Weightage: v.Weightage,
			})
		}
		revisionID = experiment.Revision[len(experiment.Revision)-1].RevisionID
	}

	err = c.chaosExperimentService.ProcessExperimentUpdate(&model.ChaosExperimentRequest{
		ExperimentID:          &experiment.ExperimentID,
		ExperimentManifest:    workflowManifest,
		ExperimentName:        experiment.Name,
		ExperimentDescription: experiment.Description,
		InfraID:               experiment.InfraID,
		IsCustomExperiment:    experiment.IsCustomExperiment,
		CronSyntax:            experiment.CronSyntax,
		Weightages:            weightages,
	}, username, &experiment.ExperimentType, revisionID, true, projectID, r)
	if err != nil {
		return err
	}
	return nil
}

func (c *ChaosExperimentHandler) GetExperimentStats(ctx context.Context, projectID string) (*model.GetExperimentStatsResponse, error) {
	var pipeline mongo.Pipeline
	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", projectID},
			{"is_removed", false},
		}},
	}
	// Project experiment ID
	projectstage := bson.D{
		{"$project", bson.D{
			{"experiment_id", 1},
		}},
	}

	// fetchRunDetailsStage fetches experiment runs and calculates their avg resiliency score which have completed
	fetchRunDetailsStage := bson.D{
		{"$lookup", bson.D{
			{"from", "chaosExperimentRuns"},
			{"let", bson.D{{"expID", "$experiment_id"}}},
			{"pipeline", bson.A{
				bson.D{
					{"$match", bson.D{
						{"$expr", bson.D{
							{"$and", bson.A{
								bson.D{
									{"$eq", bson.A{"$experiment_id", "$$expID"}},
								},
								bson.D{
									{"$eq", bson.A{"$completed", true}},
								},
							}},
						}},
					}},
				},
				bson.D{
					{"$group", bson.D{
						{"_id", nil},
						{"avg", bson.D{
							{"$avg", "$resiliency_score"},
						}},
					}},
				},
			}},
			{"as", "avg_resiliency_score"},
		}},
	}

	unwindStage := bson.D{
		{"$unwind", bson.D{
			{"path", "$avg_resiliency_score"},
		}},
	}

	// This stage buckets the number of experiments by avg resiliency score in the ranges of 0-39, 40-79, 80-100
	bucketByResScoreStage := bson.D{
		{"$bucket", bson.D{
			{"groupBy", "$avg_resiliency_score.avg"},
			{"boundaries", bson.A{0, 40, 80, 101}},
			{"default", 101},
			{"output", bson.D{
				{"count", bson.D{
					{"$sum", 1},
				}},
			}},
		}},
	}

	// Groups to count total number of experiments
	groupByTotalCount := bson.D{
		{
			"$group", bson.D{
				{"_id", nil},
				{"count", bson.D{
					{"$sum", 1},
				}},
			},
		},
	}

	facetStage := bson.D{
		{"$facet", bson.D{
			{"total_experiments", bson.A{
				matchIdentifierStage,
				groupByTotalCount,
				bson.D{
					{"$project", bson.D{
						{"_id", 0},
					}},
				},
			}},
			{"categorized_by_resiliency_score", bson.A{
				matchIdentifierStage,
				projectstage,
				fetchRunDetailsStage,
				unwindStage,
				bucketByResScoreStage,
			}},
		}},
	}
	pipeline = append(pipeline, facetStage)

	// Call aggregation on pipeline
	experimentCursor, err := c.chaosExperimentOperator.GetAggregateExperiments(pipeline)
	if err != nil {
		return nil, errors.New("DB aggregate stage: " + err.Error())
	}

	var res []dbChaosExperiment.AggregatedExperimentStats

	if err = experimentCursor.All(context.Background(), &res); err != nil || len(res) == 0 {
		return nil, errors.New("error decoding experiment details cursor: " + err.Error())
	}

	result := &model.GetExperimentStatsResponse{
		TotalExperiments:                     0,
		TotalExpCategorizedByResiliencyScore: nil,
	}

	if len(res[0].TotalExperiments) > 0 {
		result.TotalExperiments = res[0].TotalExperiments[0].Count
	}

	if len(res[0].TotalFilteredExperiments) > 0 {
		var resArr []*model.ResilienceScoreCategory
		for _, v := range res[0].TotalFilteredExperiments {
			data := model.ResilienceScoreCategory{
				Count: v.Count,
				ID:    v.Id,
			}
			resArr = append(resArr, &data)
		}
		result.TotalExpCategorizedByResiliencyScore = resArr
	}

	return result, nil
}

// GetLogs query is used to fetch the logs from the cluster
func (c *ChaosExperimentHandler) GetLogs(reqID string, pod model.PodLogRequest, r store.StateData) {
	data, err := json.Marshal(pod)
	if err != nil {
		logrus.Print("ERROR WHILE MARSHALLING POD DETAILS")
	}
	reqType := "logs"
	externalData := string(data)
	payload := model.InfraActionResponse{
		//ProjectID: reqID,
		Action: &model.ActionPayload{
			RequestID:    reqID,
			RequestType:  reqType,
			ExternalData: &externalData,
		},
	}
	if clusterChan, ok := r.ConnectedInfra[pod.InfraID]; ok {
		clusterChan <- &payload
	} else if reqChan, ok := r.ExperimentLog[reqID]; ok {
		resp := model.PodLogResponse{
			PodName:         pod.PodName,
			ExperimentRunID: pod.ExperimentRunID,
			PodType:         pod.PodType,
			Log:             "INFRA ERROR : INFRA NOT CONNECTED",
		}
		reqChan <- &resp
		close(reqChan)
	}
}

func (c *ChaosExperimentHandler) GetKubeObjData(reqID string, kubeObject model.KubeObjectRequest, r store.StateData) {
	reqType := kubeObject.ObjectType
	data, err := json.Marshal(kubeObject)
	if err != nil {
		logrus.Print("ERROR WHILE MARSHALLING POD DETAILS")
	}
	externalData := string(data)
	payload := model.InfraActionResponse{
		Action: &model.ActionPayload{
			RequestID:    reqID,
			RequestType:  reqType,
			ExternalData: &externalData,
		},
	}
	if clusterChan, ok := r.ConnectedInfra[kubeObject.InfraID]; ok {
		clusterChan <- &payload
	} else if reqChan, ok := r.KubeObjectData[reqID]; ok {
		resp := model.KubeObjectResponse{
			InfraID: kubeObject.InfraID,
			KubeObj: []*model.KubeObject{},
		}
		reqChan <- &resp
		close(reqChan)
	}
}

func (c *ChaosExperimentHandler) GetDBExperiment(query bson.D) (dbChaosExperiment.ChaosExperimentRequest, error) {
	experiment, err := c.chaosExperimentOperator.GetExperiment(context.Background(), query)
	if err != nil {
		return dbChaosExperiment.ChaosExperimentRequest{}, err
	}
	return experiment, nil
}

func (c *ChaosExperimentHandler) GetProbesInExperimentRun(ctx context.Context, projectID string, experimentRunID string, faultName string) ([]*model.GetProbesInExperimentRunResponse, error) {
	var (
		probeDetails        []*model.GetProbesInExperimentRunResponse
		probeStatusMap      = make(map[string]model.ProbeVerdict)
		probeDescriptionMap = make(map[string]*string)
		probeModeMap        = make(map[string]model.Mode)
	)

	wfRun, err := c.chaosExperimentRunOperator.GetExperimentRun(bson.D{
		{"project_id", projectID},
		{"is_removed", false},
		{"experiment_run_id", experimentRunID},
	})
	if err != nil {
		return nil, err
	}

	for _, _probe := range wfRun.Probes {
		if _probe.FaultName == faultName {
			for _, probeName := range _probe.ProbeNames {
				var executionData types.ExecutionData
				probeStatusMap[probeName] = model.ProbeVerdictNa
				probeModeMap[probeName] = model.ModeSot
				description := "Either probe is not executed or not evaluated"
				probeDescriptionMap[probeName] = &description

				if err = json.Unmarshal([]byte(wfRun.ExecutionData), &executionData); err != nil {
					return nil, errors.New("failed to unmarshal workflow manifest")
				}

				if len(executionData.Nodes) > 0 {
					for _, nodeData := range executionData.Nodes {
						if nodeData.Name == faultName {
							if nodeData.Type == "ChaosEngine" && nodeData.ChaosExp == nil {
								probeStatusMap[probeName] = model.ProbeVerdictNa
							} else if nodeData.Type == "ChaosEngine" && nodeData.ChaosExp != nil {
								probeStatusMap[probeName] = model.ProbeVerdictNa
								if nodeData.ChaosExp.ChaosResult != nil {
									probeStatusMap[probeName] = model.ProbeVerdictAwaited
									probeStatuses := nodeData.ChaosExp.ChaosResult.Status.ProbeStatuses

									for _, probeStatus := range probeStatuses {
										if probeStatus.Name == probeName {
											probeModeMap[probeName] = model.Mode(probeStatus.Mode)

											description := probeStatus.Status.Description
											probeDescriptionMap[probeStatus.Name] = &description

											switch probeStatus.Status.Verdict {
											case chaosTypes.ProbeVerdictPassed:
												probeStatusMap[probeName] = model.ProbeVerdictPassed
												break
											case chaosTypes.ProbeVerdictFailed:
												probeStatusMap[probeName] = model.ProbeVerdictFailed
												break
											case chaosTypes.ProbeVerdictAwaited:
												probeStatusMap[probeName] = model.ProbeVerdictAwaited
												break
											default:
												probeStatusMap[probeName] = model.ProbeVerdictNa
												break
											}
										}
									}
								}
							}
						}
					}
				}
			}

			for _, probeName := range _probe.ProbeNames {
				singleProbe, err := dbSchemaProbe.GetProbeByName(ctx, probeName, projectID)
				if err != nil {
					return nil, err
				}

				probeDetails = append(probeDetails, &model.GetProbesInExperimentRunResponse{
					Probe: singleProbe.GetOutputProbe(),
					Mode:  probeModeMap[probeName],
					Status: &model.Status{
						Verdict:     probeStatusMap[probeName],
						Description: probeDescriptionMap[probeName],
					},
				})
			}

		}
	}

	return probeDetails, nil
}

// validateDuplicateExperimentName validates if the name of experiment is duplicate
func (c *ChaosExperimentHandler) validateDuplicateExperimentName(ctx context.Context, projectID, name string) error {
	filterQuery := bson.D{
		{"project_id", projectID},
		{"name", name},
		{"is_removed", false},
	}
	experimentCount, err := c.chaosExperimentOperator.CountChaosExperiments(ctx, filterQuery)
	if err != nil {
		return err
	}
	if experimentCount > 0 {
		return errors.New("experiment name should be unique, duplicate experiment found with name: " + name)
	}

	return nil
}

func (c *ChaosExperimentHandler) UpdateCronExperimentState(ctx context.Context, workflowID string, disable bool, projectID string, r *store.StateData) (bool, error) {
	var (
		cronWorkflowManifest v1alpha1.CronWorkflow
	)

	//Fetching the experiment details
	query := bson.D{
		{"project_id", projectID},
		{"experiment_id", workflowID},
		{"is_removed", false},
	}
	experiment, err := c.chaosExperimentOperator.GetExperiment(ctx, query)
	if err != nil {
		return false, fmt.Errorf("could not get experiment run, error: %v", err)
	}

	//Fetching infra details to check infra upgrade status and infra active status
	infra, err := dbChaosInfra.NewInfrastructureOperator(c.mongodbOperator).GetInfra(experiment.InfraID)
	if err != nil {
		return false, fmt.Errorf("failed to get infra for infraID: %s, error: %v", experiment.InfraID, err)
	}

	if !infra.IsActive {
		return false, fmt.Errorf("cron experiement updation failed due to inactive infra, err: %v", err)
	}

	//Validate if revisions are available
	if len(experiment.Revision) == 0 {
		return false, fmt.Errorf("no revisions found")
	}
	sort.Slice(experiment.Revision, func(i, j int) bool {
		return experiment.Revision[i].UpdatedAt > experiment.Revision[j].UpdatedAt
	})

	//Parsing the manifest to cron experiment structure
	if err := json.Unmarshal([]byte(experiment.Revision[0].ExperimentManifest), &cronWorkflowManifest); err != nil {
		return false, fmt.Errorf("failed to unmarshal experiment manifest, error: %s", err.Error())
	}

	//state of the cron experiment state
	cronWorkflowManifest.Spec.Suspend = disable

	updatedManifest, err := json.Marshal(cronWorkflowManifest)
	if err != nil {
		return false, fmt.Errorf("failed to marshal workflow manifest, error: %v", err)
	}

	//Update the revision in database
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	err = c.chaosExperimentService.ProcessExperimentUpdate(&model.ChaosExperimentRequest{
		ExperimentID:       &workflowID,
		ExperimentManifest: string(updatedManifest),
		ExperimentName:     experiment.Name,
	}, username, &experiment.ExperimentType, experiment.Revision[0].RevisionID, true, experiment.ProjectID, nil)

	if err != nil {
		return false, err
	}

	//Update the runtime values in cron experiment manifest
	cronWorkflowManifest, _, err = c.chaosExperimentService.UpdateRuntimeCronWorkflowConfiguration(cronWorkflowManifest, experiment)
	if err != nil {
		return false, err
	}

	updatedManifest, err = json.Marshal(cronWorkflowManifest)
	if err != nil {
		return false, errors.New("failed to marshal workflow manifest")
	}

	cronWorkflowManifest, err = probeUtils.GenerateCronExperimentManifestWithProbes(string(updatedManifest), experiment.ProjectID)
	if err != nil {
		return false, fmt.Errorf("failed to unmarshal experiment manifest, error: %v", err)
	}

	updatedManifest, err = json.Marshal(cronWorkflowManifest)
	if err != nil {
		return false, errors.New("failed to marshal workflow manifest")
	}

	if r != nil {
		chaos_infrastructure.SendExperimentToSubscriber(projectID, &model.ChaosExperimentRequest{
			ExperimentID:       &workflowID,
			ExperimentManifest: string(updatedManifest),
			ExperimentName:     experiment.Name,
			InfraID:            experiment.InfraID,
		}, &username, nil, "update", r)
	}

	return true, err
}
func (c *ChaosExperimentHandler) StopExperimentRuns(ctx context.Context, projectID string, experimentID string, experimentRunID *string, r *store.StateData) (bool, error) {

	var experimentRunsID []string

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	query := bson.D{
		{"experiment_id", experimentID},
		{"project_id", projectID},
		{"is_removed", false},
	}
	experiment, err := c.chaosExperimentOperator.GetExperiment(context.TODO(), query)
	if err != nil {
		return false, err
	}

	// if experimentID is provided & no expRunID is present (stop all the corresponding experiment runs)
	if experimentRunID == nil {

		// Fetching all the experiment runs in the experiment
		expRuns, err := dbChaosExperimentRun.NewChaosExperimentRunOperator(c.mongodbOperator).GetExperimentRuns(bson.D{
			{"experiment_id", experimentID},
			{"is_removed", false},
		})
		if err != nil {
			return false, err
		}

		for _, runs := range expRuns {
			if (runs.Phase == string(model.ExperimentRunStatusRunning) || runs.Phase == string(model.ExperimentRunStatusTimeout)) && !runs.Completed {
				experimentRunsID = append(experimentRunsID, runs.ExperimentRunID)
			}
		}

		// Check if experiment run count is 0 and if it's not a cron experiment
		if len(experimentRunsID) == 0 && experiment.CronSyntax == "" {
			return false, fmt.Errorf("no running or timeout experiments found")
		}
	} else if experimentRunID != nil && *experimentRunID != "" {
		experimentRunsID = []string{*experimentRunID}
	}

	for _, runID := range experimentRunsID {
		err = c.chaosExperimentRunService.ProcessExperimentRunStop(ctx, query, &runID, experiment, username, projectID, r)
		if err != nil {
			return false, err
		}
	}

	return true, nil
}
