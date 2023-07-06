package handler

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readconcern"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"

	"github.com/ghodss/yaml"
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/tidwall/sjson"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/sirupsen/logrus"
	"github.com/tidwall/gjson"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	types "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"

	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"

	"github.com/google/uuid"
)

// ChaosExperimentHandler is the handler for chaos experiment
type ChaosExperimentHandler struct {
	chaosExperimentService  types.Service
	infrastructureService   chaos_infrastructure.Service
	gitOpsService           gitops.Service
	chaosExperimentOperator *dbChaosExperiment.Operator
	mongodbOperator         mongodb.MongoOperator
}

// NewChaosExperimentHandler returns a new instance of ChaosWorkflowHandler
func NewChaosExperimentHandler(
	chaosExperimentService types.Service,
	infrastructureService chaos_infrastructure.Service,
	gitOpsService gitops.Service,
	chaosExperimentOperator *dbChaosExperiment.Operator,
	mongodbOperator mongodb.MongoOperator,
) *ChaosExperimentHandler {
	return &ChaosExperimentHandler{
		chaosExperimentService:  chaosExperimentService,
		infrastructureService:   infrastructureService,
		gitOpsService:           gitOpsService,
		chaosExperimentOperator: chaosExperimentOperator,
		mongodbOperator:         mongodbOperator,
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

	newRequest, wfType, err := c.chaosExperimentService.ProcessExperiment(&chaosWfReq, projectID, revID)
	if err != nil {
		return "", err
	}
	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	// Updating the existing experiment
	if wfDetails.ExperimentID == request.ID {
		logrus.WithFields(logFields).Info("request received to update k8s chaos experiment")

		err = c.chaosExperimentService.ProcessExperimentUpdate(newRequest, username, wfType, revID, false, projectID, nil)
		if err != nil {
			return "", err
		}

		return "experiment updated successfully", nil
	}

	// Saving chaos experiment in the DB
	logrus.WithFields(logFields).Info("request received to save k8s chaos experiment")

	err = c.chaosExperimentService.ProcessExperimentCreation(context.TODO(), newRequest, username, projectID, wfType, revID, nil)
	if err != nil {
		return "", err
	}

	return "experiment saved successfully", nil
}

func (c *ChaosExperimentHandler) CreateChaosExperiment(ctx context.Context, request *model.ChaosExperimentRequest, projectID string, r *store.StateData) (*model.ChaosExperimentResponse, error) {

	var revID = uuid.New().String()

	// Check if the workflow_name exists under same project
	wfDetails, err := c.chaosExperimentOperator.GetExperiments(bson.D{
		{"name", request.ExperimentName},
		{"project_id", projectID},
		{"tags", request.Tags},
		{"is_removed", false},
	})
	if err != nil {
		return nil, err
	}

	if wfDetails != nil || len(wfDetails) > 0 {
		return nil, errors.New("experiment name already exists in this project")
	}

	newRequest, wfType, err := c.chaosExperimentService.ProcessExperiment(request, projectID, revID)
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
		workflowRun, err := dbChaosExperimentRun.GetExperimentRun(query)
		if err != nil {
			return false, err
		}

		workflowRun.IsRemoved = true

		err = c.chaosExperimentService.ProcessExperimentRunDelete(ctx, query, workflowRunID, workflowRun, workflow, uid, r)
		if err != nil {
			return false, err
		}
	}

	return true, nil
}

func (c *ChaosExperimentHandler) UpdateChaosExperiment(ctx context.Context, request *model.ChaosExperimentRequest, projectID string, r *store.StateData) (*model.ChaosExperimentResponse, error) {
	var (
		revID = uuid.New().String()
	)

	newRequest, wfType, err := c.chaosExperimentService.ProcessExperiment(request, projectID, revID)
	if err != nil {
		return nil, err
	}
	tkn := ctx.Value(authorization.AuthKey).(string)
	uid, err := authorization.GetUsername(tkn)
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

// GetExperimentRun returns details of a requested experiment run
func (c *ChaosExperimentHandler) GetExperimentRun(ctx context.Context, projectID string, experimentRunID string) (*model.ExperimentRun, error) {
	var pipeline mongo.Pipeline

	// Matching with identifiers
	matchIdentifiersStage := bson.D{
		{
			"$match", bson.D{
				{"experiment_run_id", experimentRunID},
				{"project_id", projectID},
				{"is_removed", false},
			},
		},
	}
	pipeline = append(pipeline, matchIdentifiersStage)

	// Adds details of experiment
	addExperimentDetails := bson.D{
		{"$lookup",
			bson.D{
				{"from", "chaosExperiments"},
				{"let", bson.D{{"experimentID", "$experiment_id"}, {"revID", "$revision_id"}}},
				{
					"pipeline", bson.A{
						bson.D{{"$match", bson.D{{"$expr", bson.D{{"$eq", bson.A{"$experiment_id", "$$experimentID"}}}}}}},
						bson.D{
							{"$project", bson.D{
								{"name", 1},
								{"is_custom_experiment", 1},
								{"revision", bson.D{{
									"$filter", bson.D{
										{"input", "$revision"},
										{"as", "revs"},
										{"cond", bson.D{{
											"$eq", bson.A{"$$revs.revision_id", "$$revID"},
										}}},
									},
								}}},
							}},
						},
					},
				},
				{"as", "experiment"},
			},
		},
	}
	pipeline = append(pipeline, addExperimentDetails)

	// fetchKubernetesInfraDetailsStage adds kubernetes infra details of corresponding experiment_id to each document
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
	expRunCursor, err := dbChaosExperimentRun.GetAggregateExperimentRuns(pipeline)
	if err != nil {
		return nil, errors.New("DB aggregate stage error: " + err.Error())
	}

	var (
		expRunResponse *model.ExperimentRun
		expRunDetails  []dbChaosExperiment.FlattenedExperimentRun
	)

	if err = expRunCursor.All(context.Background(), &expRunDetails); err != nil {
		return nil, errors.New("error decoding experiment run cursor: " + err.Error())
	}
	if len(expRunDetails) == 0 {
		return nil, errors.New("no matching experiment run")
	}
	if len(expRunDetails[0].KubernetesInfraDetails) == 0 {
		return nil, errors.New("no matching infra found for given experiment run")
	}

	for _, wfRun := range expRunDetails {
		var (
			weightages          []*model.Weightages
			workflowRunManifest string
		)

		if len(wfRun.ExperimentDetails[0].Revision) > 0 {
			revision := wfRun.ExperimentDetails[0].Revision[0]
			for _, v := range revision.Weightages {
				weightages = append(weightages, &model.Weightages{
					FaultName: v.FaultName,
					Weightage: v.Weightage,
				})
			}
			workflowRunManifest = revision.ExperimentManifest
		}
		var chaosInfrastructure *model.Infra

		if len(wfRun.KubernetesInfraDetails) > 0 {
			infra := wfRun.KubernetesInfraDetails[0]
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
			}
		}

		expRunResponse = &model.ExperimentRun{
			ExperimentName:     wfRun.ExperimentDetails[0].ExperimentName,
			ExperimentID:       wfRun.ExperimentID,
			ExperimentRunID:    wfRun.ExperimentRunID,
			Weightages:         weightages,
			ExperimentManifest: workflowRunManifest,
			ProjectID:          wfRun.ProjectID,
			Infra:              chaosInfrastructure,
			Phase:              model.ExperimentRunStatus(wfRun.Phase),
			ResiliencyScore:    wfRun.ResiliencyScore,
			FaultsPassed:       wfRun.FaultsPassed,
			FaultsFailed:       wfRun.FaultsFailed,
			FaultsAwaited:      wfRun.FaultsAwaited,
			FaultsStopped:      wfRun.FaultsStopped,
			FaultsNa:           wfRun.FaultsNA,
			TotalFaults:        wfRun.TotalFaults,
			ExecutionData:      wfRun.ExecutionData,
			IsRemoved:          &wfRun.IsRemoved,
			UpdatedBy: &model.UserDetails{
				Username: wfRun.UpdatedBy,
			},
			UpdatedAt: strconv.FormatInt(wfRun.UpdatedAt, 10),
			CreatedAt: strconv.FormatInt(wfRun.CreatedAt, 10),
		}
	}

	return expRunResponse, nil
}

// ListExperimentRun returns all the workflow runs for matching identifiers from the DB
func (c *ChaosExperimentHandler) ListExperimentRun(projectID string, request model.ListExperimentRunRequest) (*model.ListExperimentRunResponse, error) {
	var pipeline mongo.Pipeline

	// Matching with identifiers
	matchIdentifiersStage := bson.D{
		{
			"$match", bson.D{{
				"$and", bson.A{
					bson.D{
						{"project_id", projectID},
					},
				},
			}},
		},
	}
	pipeline = append(pipeline, matchIdentifiersStage)

	// Match the workflowRunIds from the input array
	if request.ExperimentRunIDs != nil && len(request.ExperimentRunIDs) != 0 {
		matchWfRunIdStage := bson.D{
			{"$match", bson.D{
				{"experiment_run_id", bson.D{
					{"$in", request.ExperimentRunIDs},
				}},
			}},
		}

		pipeline = append(pipeline, matchWfRunIdStage)
	}

	// Match the workflowIds from the input array
	if request.ExperimentIDs != nil && len(request.ExperimentIDs) != 0 {
		matchWfIdStage := bson.D{
			{"$match", bson.D{
				{"experiment_id", bson.D{
					{"$in", request.ExperimentIDs},
				}},
			}},
		}

		pipeline = append(pipeline, matchWfIdStage)
	}

	// Filtering out the workflows that are deleted/removed
	matchExpIsRemovedStage := bson.D{
		{"$match", bson.D{
			{"is_removed", bson.D{
				{"$eq", false},
			}},
		}},
	}
	pipeline = append(pipeline, matchExpIsRemovedStage)

	addExperimentDetails := bson.D{
		{
			"$lookup",
			bson.D{
				{"from", "chaosExperiments"},
				{"let", bson.D{{"experimentID", "$experiment_id"}, {"revID", "$revision_id"}}},
				{
					"pipeline", bson.A{
						bson.D{{"$match", bson.D{{"$expr", bson.D{{"$eq", bson.A{"$experiment_id", "$$experimentID"}}}}}}},
						bson.D{
							{"$project", bson.D{
								{"name", 1},
								{"experiment_type", 1},
								{"is_custom_experiment", 1},
								{"revision", bson.D{{
									"$filter", bson.D{
										{"input", "$revision"},
										{"as", "revs"},
										{"cond", bson.D{{
											"$eq", bson.A{"$$revs.revision_id", "$$revID"},
										}}},
									},
								}}},
							}},
						},
					},
				},
				{"as", "experiment"},
			},
		},
	}
	pipeline = append(pipeline, addExperimentDetails)

	// Filtering based on multiple parameters
	if request.Filter != nil {

		// Filtering based on workflow name
		if request.Filter.ExperimentName != nil && *request.Filter.ExperimentName != "" {
			matchWfNameStage := bson.D{
				{"$match", bson.D{
					{"experiment.name", bson.D{
						{"$regex", request.Filter.ExperimentName},
					}},
				}},
			}
			pipeline = append(pipeline, matchWfNameStage)
		}

		// Filtering based on workflow run ID
		if request.Filter.ExperimentRunID != nil && *request.Filter.ExperimentRunID != "" {
			matchWfRunIDStage := bson.D{
				{"$match", bson.D{
					{"experiment_run_id", bson.D{
						{"$regex", request.Filter.ExperimentRunID},
					}},
				}},
			}
			pipeline = append(pipeline, matchWfRunIDStage)
		}

		// Filtering based on workflow run status array
		if len(request.Filter.ExperimentRunStatus) > 0 {
			matchWfRunStatusStage := bson.D{
				{"$match", bson.D{
					{"phase", bson.D{
						{"$in", request.Filter.ExperimentRunStatus},
					}},
				}},
			}
			pipeline = append(pipeline, matchWfRunStatusStage)
		}

		// Filtering based on infraID
		if request.Filter.InfraID != nil && *request.Filter.InfraID != "All" && *request.Filter.InfraID != "" {
			matchInfraStage := bson.D{
				{"$match", bson.D{
					{"infra_id", request.Filter.InfraID},
				}},
			}
			pipeline = append(pipeline, matchInfraStage)
		}

		// Filtering based on phase
		if request.Filter.ExperimentStatus != nil && *request.Filter.ExperimentStatus != "All" && *request.Filter.ExperimentStatus != "" {
			filterWfRunPhaseStage := bson.D{
				{"$match", bson.D{
					{"phase", string(*request.Filter.ExperimentStatus)},
				}},
			}
			pipeline = append(pipeline, filterWfRunPhaseStage)
		}

		// Filtering based on date range
		if request.Filter.DateRange != nil {
			endDate := strconv.FormatInt(time.Now().UnixMilli(), 10)
			if request.Filter.DateRange.EndDate != nil {
				endDate = *request.Filter.DateRange.EndDate
			}
			filterWfRunDateStage := bson.D{
				{
					"$match",
					bson.D{{"updated_at", bson.D{
						{"$lte", endDate},
						{"$gte", request.Filter.DateRange.StartDate},
					}}},
				},
			}
			pipeline = append(pipeline, filterWfRunDateStage)
		}
	}

	var sortStage bson.D

	switch {
	case request.Sort != nil && request.Sort.Field == model.ExperimentSortingFieldTime:
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
	case request.Sort != nil && request.Sort.Field == model.ExperimentSortingFieldName:
		// Sorting based on ExperimentName time
		if request.Sort.Ascending != nil && *request.Sort.Ascending {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"experiment.name", 1},
				}},
			}
		} else {
			sortStage = bson.D{
				{"$sort", bson.D{
					{"experiment.name", -1},
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
			{"total_filtered_experiment_runs", bson.A{
				bson.D{{"$count", "count"}},
			}},
			{"flattened_experiment_runs", paginatedExperiments},
		}},
	}
	pipeline = append(pipeline, facetStage)

	// Call aggregation on pipeline
	workflowsCursor, err := dbChaosExperimentRun.GetAggregateExperimentRuns(pipeline)
	if err != nil {
		return nil, errors.New("DB aggregate stage error: " + err.Error())
	}

	var (
		result    []*model.ExperimentRun
		workflows []dbChaosExperiment.AggregatedExperimentRuns
	)

	if err = workflowsCursor.All(context.Background(), &workflows); err != nil || len(workflows) == 0 {
		return &model.ListExperimentRunResponse{
			TotalNoOfExperimentRuns: 0,
			ExperimentRuns:          result,
		}, errors.New("error decoding experiment runs cursor: " + err.Error())
	}
	if len(workflows) == 0 {
		return &model.ListExperimentRunResponse{
			TotalNoOfExperimentRuns: 0,
			ExperimentRuns:          result,
		}, nil
	}

	for _, workflow := range workflows[0].FlattenedExperimentRuns {
		var (
			weightages          []*model.Weightages
			workflowRunManifest string
			workflowType        string
			workflowName        string
		)

		if len(workflow.ExperimentDetails) > 0 {
			workflowType = string(workflow.ExperimentDetails[0].ExperimentType)
			workflowName = workflow.ExperimentDetails[0].ExperimentName
			if len(workflow.ExperimentDetails[0].Revision) > 0 {
				revision := workflow.ExperimentDetails[0].Revision[0]
				for _, v := range revision.Weightages {
					weightages = append(weightages, &model.Weightages{
						FaultName: v.FaultName,
						Weightage: v.Weightage,
					})
				}
				workflowRunManifest = revision.ExperimentManifest
			}
		}
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

		newExperimentRun := model.ExperimentRun{
			ExperimentName:     workflowName,
			ExperimentType:     &workflowType,
			ExperimentID:       workflow.ExperimentID,
			ExperimentRunID:    workflow.ExperimentRunID,
			Weightages:         weightages,
			ExperimentManifest: workflowRunManifest,
			ProjectID:          workflow.ProjectID,
			Infra:              chaosInfrastructure,
			Phase:              model.ExperimentRunStatus(workflow.Phase),
			ResiliencyScore:    workflow.ResiliencyScore,
			FaultsPassed:       workflow.FaultsPassed,
			FaultsFailed:       workflow.FaultsFailed,
			FaultsAwaited:      workflow.FaultsAwaited,
			FaultsStopped:      workflow.FaultsStopped,
			FaultsNa:           workflow.FaultsNA,
			TotalFaults:        workflow.TotalFaults,
			ExecutionData:      workflow.ExecutionData,
			IsRemoved:          &workflow.IsRemoved,
			UpdatedBy: &model.UserDetails{
				Username: workflow.UpdatedBy,
			},
			UpdatedAt: strconv.FormatInt(workflow.UpdatedAt, 10),
			CreatedAt: strconv.FormatInt(workflow.CreatedAt, 10),
		}
		result = append(result, &newExperimentRun)
	}

	totalFilteredExperimentRunsCounter := 0
	if len(workflows) > 0 && len(workflows[0].TotalFilteredExperimentRuns) > 0 {
		totalFilteredExperimentRunsCounter = workflows[0].TotalFilteredExperimentRuns[0].Count
	}

	output := model.ListExperimentRunResponse{
		TotalNoOfExperimentRuns: totalFilteredExperimentRunsCounter,
		ExperimentRuns:          result,
	}

	return &output, nil
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
					UserID: v.UpdatedBy,
				},
				CreatedBy: &model.UserDetails{
					UserID: v.CreatedBy,
				},
				UpdatedAt: strconv.FormatInt(v.UpdatedAt, 10),
				CreatedAt: strconv.FormatInt(v.CreatedAt, 10),
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
				Username: exp.UpdatedBy,
			},
			CreatedBy: &model.UserDetails{
				Username: exp.UpdatedBy,
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
						Username: v.UpdatedBy,
					},
					CreatedBy: &model.UserDetails{
						Username: v.UpdatedBy,
					},
					UpdatedAt: strconv.FormatInt(v.UpdatedAt, 10),
					CreatedAt: strconv.FormatInt(v.CreatedAt, 10),
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
				Username: workflow.UpdatedBy,
			},
			CreatedBy: &model.UserDetails{
				Username: workflow.UpdatedBy,
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

// RunChaosWorkFlow sends workflow run request(single run workflow only) to chaos_infra on workflow re-run request
func (c *ChaosExperimentHandler) RunChaosWorkFlow(ctx context.Context, projectID string, workflow dbChaosExperiment.ChaosExperimentRequest, r *store.StateData) (*model.RunChaosExperimentResponse, error) {
	var notifyID string
	infra, err := dbChaosInfra.NewInfrastructureOperator(c.mongodbOperator).GetInfra(workflow.InfraID)
	if err != nil {
		return nil, err
	}
	if !infra.IsActive {
		return nil, errors.New("experiment re-run failed due to inactive infra")
	}

	var (
		workflowManifest v1alpha1.Workflow
	)

	currentTime := time.Now().UnixMilli()

	if len(workflow.Revision) == 0 {
		return nil, errors.New("no revisions found")
	}

	sort.Slice(workflow.Revision, func(i, j int) bool {
		return workflow.Revision[i].UpdatedAt > workflow.Revision[j].UpdatedAt
	})

	resKind := gjson.Get(workflow.Revision[0].ExperimentManifest, "kind").String()
	if strings.ToLower(resKind) == "cronworkflow" {
		return &model.RunChaosExperimentResponse{NotifyID: notifyID}, c.RunCronExperiment(ctx, projectID, workflow, r)
	}
	notifyID = uuid.New().String()

	err = json.Unmarshal([]byte(workflow.Revision[0].ExperimentManifest), &workflowManifest)
	if err != nil {
		return nil, errors.New("failed to unmarshal workflow manifest")
	}

	var resScore float64 = 0

	if _, found := workflowManifest.Labels["infra_id"]; !found {
		return nil, errors.New("failed to rerun the chaos experiment due to invalid metadata/labels. Check the troubleshooting guide or contact support")
	}
	workflowManifest.Labels["notify_id"] = notifyID
	workflowManifest.Name = workflowManifest.Name + "-" + strconv.FormatInt(currentTime, 10)

	for i, template := range workflowManifest.Spec.Templates {
		artifact := template.Inputs.Artifacts
		if len(artifact) > 0 {
			if artifact[0].Raw == nil {
				continue
			}
			var data = artifact[0].Raw.Data
			if len(data) > 0 {

				var (
					meta       chaosTypes.ChaosEngine
					annotation = make(map[string]string)
				)
				err := yaml.Unmarshal([]byte(data), &meta)
				if err != nil {
					return nil, errors.New("failed to unmarshal chaosengine")
				}
				if strings.ToLower(meta.Kind) == "chaosengine" {
					if meta.Annotations != nil {
						annotation = meta.Annotations
					}
					meta.Annotations = annotation

					if meta.Labels == nil {
						meta.Labels = map[string]string{
							"infra_id":        workflow.InfraID,
							"step_pod_name":   "{{pod.name}}",
							"workflow_run_id": "{{workflow.uid}}",
						}
					} else {
						meta.Labels["infra_id"] = workflow.InfraID
						meta.Labels["step_pod_name"] = "{{pod.name}}"
						meta.Labels["workflow_run_id"] = "{{workflow.uid}}"
					}

					res, err := yaml.Marshal(&meta)
					if err != nil {
						return nil, errors.New("failed to marshal chaosengine")
					}
					workflowManifest.Spec.Templates[i].Inputs.Artifacts[0].Raw.Data = string(res)
				}
			}
		}
	}

	// Updating updated_at field
	filter := bson.D{
		{"experiment_id", workflow.ExperimentID},
	}
	update := bson.D{
		{
			"$set", bson.D{
				{"updated_at", currentTime},
			},
		},
	}
	err = c.chaosExperimentOperator.UpdateChaosExperiment(context.Background(), filter, update)
	if err != nil {
		logrus.Error("Failed to update updated_at")
		return nil, err
	}

	executionData := types.ExecutionData{
		Name:         workflowManifest.Name,
		Phase:        "Queued",
		ExperimentID: workflow.ExperimentID,
	}

	parsedData, err := json.Marshal(executionData)
	if err != nil {
		logrus.Error("Failed to parse execution data")
		return nil, err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	var (
		wc      = writeconcern.New(writeconcern.WMajority())
		rc      = readconcern.Snapshot()
		txnOpts = options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)
	)

	session, err := mongodb.MgoClient.StartSession()
	if err != nil {
		logrus.Errorf("failed to start mongo session %v", err)
		return nil, err
	}

	err = mongo.WithSession(context.Background(), session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(txnOpts); err != nil {
			logrus.Errorf("failed to start mongo session transaction %v", err)
			return err
		}

		expRunDetail := []dbChaosExperiment.ExperimentRunDetail{
			{
				Phase:     executionData.Phase,
				Completed: false,
				ProjectID: projectID,
				NotifyID:  &notifyID,
				Audit: mongodb.Audit{
					IsRemoved: false,
					CreatedAt: currentTime,
					CreatedBy: username,
					UpdatedAt: currentTime,
					UpdatedBy: username,
				},
			},
		}

		filter = bson.D{
			{"experiment_id", workflow.ExperimentID},
		}
		update = bson.D{
			{
				"$set", bson.D{
					{"updated_at", currentTime},
					{"total_experiment_runs", workflow.TotalExperimentRuns + 1},
				},
			},
			{
				"$push", bson.D{
					{"recent_experiment_run_details", bson.D{
						{"$each", expRunDetail},
						{"$position", 0},
						{"$slice", 10},
					}},
				},
			},
		}

		err = c.chaosExperimentOperator.UpdateChaosExperiment(sessionContext, filter, update)
		if err != nil {
			logrus.Error("Failed to update experiment collection")
		}

		err = dbChaosExperimentRun.CreateExperimentRun(sessionContext, dbChaosExperimentRun.ChaosExperimentRun{
			InfraID:      workflow.InfraID,
			ExperimentID: workflow.ExperimentID,
			Phase:        "Queued",
			RevisionID:   workflow.Revision[0].RevisionID,
			ProjectID:    projectID,
			Audit: mongodb.Audit{
				IsRemoved: false,
				CreatedAt: currentTime,
				CreatedBy: username,
				UpdatedAt: currentTime,
				UpdatedBy: username,
			},
			NotifyID:        &notifyID,
			Completed:       false,
			ResiliencyScore: &resScore,
			ExecutionData:   string(parsedData),
		})
		if err != nil {
			logrus.Error("Failed to create run operation in db")
			return err
		}

		if err = session.CommitTransaction(sessionContext); err != nil {
			logrus.Errorf("failed to commit session transaction %v", err)
			return err
		}
		return nil
	})

	if err != nil {
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			logrus.Errorf("failed to abort session transaction %v", err)
			return nil, abortErr
		}
		return nil, err
	}

	session.EndSession(ctx)

	manifest, err := yaml.Marshal(workflowManifest)
	if err != nil {
		return nil, err
	}
	if r != nil {
		chaos_infrastructure.SendExperimentToSubscriber(projectID, &model.ChaosExperimentRequest{
			ExperimentID:       &workflow.ExperimentID,
			ExperimentManifest: string(manifest),
			InfraID:            workflow.InfraID,
		}, &username, nil, "create", r)
	}
	return &model.RunChaosExperimentResponse{
		NotifyID: notifyID,
	}, nil
}

func (c *ChaosExperimentHandler) RunCronExperiment(ctx context.Context, projectID string, workflow dbChaosExperiment.ChaosExperimentRequest, r *store.StateData) error {
	var (
		cronExperimentManifest v1alpha1.CronWorkflow
	)

	if len(workflow.Revision) == 0 {
		return errors.New("no revisions found")
	}
	sort.Slice(workflow.Revision, func(i, j int) bool {
		return workflow.Revision[i].UpdatedAt > workflow.Revision[j].UpdatedAt
	})

	err := json.Unmarshal([]byte(workflow.Revision[0].ExperimentManifest), &cronExperimentManifest)
	if err != nil {
		return errors.New("failed to unmarshal experiment manifest")
	}

	for i, template := range cronExperimentManifest.Spec.WorkflowSpec.Templates {
		artifact := template.Inputs.Artifacts
		if len(artifact) > 0 {
			if artifact[0].Raw == nil {
				continue
			}
			var data = artifact[0].Raw.Data
			if len(data) > 0 {
				var meta chaosTypes.ChaosEngine
				annotation := make(map[string]string)
				err := yaml.Unmarshal([]byte(data), &meta)
				if err != nil {
					return errors.New("failed to unmarshal chaosengine")
				}
				if strings.ToLower(meta.Kind) == "chaosengine" {
					if meta.Annotations != nil {
						annotation = meta.Annotations
					}
					meta.Annotations = annotation

					if meta.Labels == nil {
						meta.Labels = map[string]string{
							"infra_id":        workflow.InfraID,
							"step_pod_name":   "{{pod.name}}",
							"workflow_run_id": "{{workflow.uid}}",
						}
					} else {
						meta.Labels["infra_id"] = workflow.InfraID
						meta.Labels["step_pod_name"] = "{{pod.name}}"
						meta.Labels["workflow_run_id"] = "{{workflow.uid}}"
					}
					res, err := yaml.Marshal(&meta)
					if err != nil {
						return errors.New("failed to marshal chaosengine")
					}
					cronExperimentManifest.Spec.WorkflowSpec.Templates[i].Inputs.Artifacts[0].Raw.Data = string(res)
				}
			}
		}
	}

	manifest, err := yaml.Marshal(cronExperimentManifest)
	if err != nil {
		return err
	}

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)

	if r != nil {
		chaos_infrastructure.SendExperimentToSubscriber(projectID, &model.ChaosExperimentRequest{
			ExperimentID:       &workflow.ExperimentID,
			ExperimentManifest: string(manifest),
			InfraID:            workflow.InfraID,
		}, &username, nil, "create", r)
	}

	return nil
}

// getWfRunDetails returns details of the latest workflow run of passed workflows.
func getWfRunDetails(workflowIDs []string) (map[string]*types.LastRunDetails, error) {
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
	workflowsRunDetailCursor, err := dbChaosExperimentRun.GetAggregateExperimentRuns(pipeline)
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

func (c *ChaosExperimentHandler) GetExperimentRunStats(ctx context.Context, projectID string) (*model.GetExperimentRunStatsResponse, error) {
	var pipeline mongo.Pipeline
	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", projectID},
		}},
	}

	pipeline = append(pipeline, matchIdentifierStage)

	// Group and counts total experiment runs by phase
	groupByPhaseStage := bson.D{
		{
			"$group", bson.D{
				{"_id", "$phase"},
				{"count", bson.D{
					{"$sum", 1},
				}},
			},
		},
	}
	pipeline = append(pipeline, groupByPhaseStage)
	// Call aggregation on pipeline
	experimentRunCursor, err := dbChaosExperimentRun.GetAggregateExperimentRuns(pipeline)
	if err != nil {
		return nil, err
	}

	var res []dbChaosExperiment.AggregatedExperimentRunStats

	if err = experimentRunCursor.All(context.Background(), &res); err != nil || len(res) == 0 {
		return nil, err
	}

	resMap := map[string]int{
		"Completed":  0,
		"Stopped":    0,
		"Running":    0,
		"Terminated": 0,
		"Error":      0,
	}

	totalExperimentRuns := 0
	for _, phase := range res {
		resMap[phase.Id] = phase.Count
		totalExperimentRuns = totalExperimentRuns + phase.Count
	}

	return &model.GetExperimentRunStatsResponse{
		TotalExperimentRuns:           totalExperimentRuns,
		TotalCompletedExperimentRuns:  resMap["Completed"],
		TotalTerminatedExperimentRuns: resMap["Terminated"],
		TotalRunningExperimentRuns:    resMap["Running"],
		TotalStoppedExperimentRuns:    resMap["Stopped"],
		TotalErroredExperimentRuns:    resMap["Error"],
	}, nil
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

func (c *ChaosExperimentHandler) ChaosExperimentRunEvent(event model.ExperimentRunRequest) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	experiment, err := c.chaosExperimentOperator.GetExperiment(ctx, bson.D{
		{"experiment_id", event.ExperimentID},
		{"is_removed", false},
	})
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return fmt.Sprintf("no experiment found with experimentID: %s, experiment run discarded: %s", event.ExperimentID, event.ExperimentRunID), nil
		}
		return "", err
	}

	logFields := logrus.Fields{
		"projectID":       experiment.ProjectID,
		"experimentID":    experiment.ExperimentID,
		"experimentRunID": event.ExperimentRunID,
		"infraID":         experiment.InfraID,
	}

	logrus.WithFields(logFields).Info("new workflow event received")

	var (
		executionData types.ExecutionData
		exeData       []byte
	)

	// Parse and store execution data
	if event.ExecutionData != "" {
		exeData, err = base64.StdEncoding.DecodeString(event.ExecutionData)
		if err != nil {
			logrus.WithFields(logFields).Warn("Failed to decode execution data: ", err)

			//Required for backward compatibility of subscribers
			//which are not sending execution data in base64 encoded format
			//remove it once all subscribers are updated
			exeData = []byte(event.ExperimentID)
		}
		err = json.Unmarshal(exeData, &executionData)
		if err != nil {
			return "", err
		}
	}

	var workflowRunMetrics types.ExperimentRunMetrics
	// Resiliency Score will be calculated only if workflow execution is completed
	if event.Completed {
		workflowRunMetrics, err = c.chaosExperimentService.ProcessCompletedExperimentRun(executionData, event.ExperimentID, event.ExperimentRunID)
		if err != nil {
			logrus.WithFields(logFields).Errorf("failed to process completed workflow run %v", err)
			return "", err
		}

	}

	//TODO check for mongo transaction
	var (
		wc      = writeconcern.New(writeconcern.WMajority())
		rc      = readconcern.Snapshot()
		txnOpts = options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)
	)

	session, err := mongodb.MgoClient.StartSession()
	if err != nil {
		logrus.WithFields(logFields).Errorf("failed to start mongo session %v", err)
		return "", err
	}
	//
	var (
		isRemoved   = false
		currentTime = time.Now()
	)

	err = mongo.WithSession(ctx, session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(txnOpts); err != nil {
			logrus.WithFields(logFields).Errorf("failed to start mongo session transaction %v", err)
			return err
		}

		query := bson.D{
			{"experiment_id", event.ExperimentID},
			{"experiment_run_id", event.ExperimentRunID},
		}

		if event.NotifyID != nil {
			query = bson.D{
				{"experiment_id", event.ExperimentID},
				{"notify_id", event.NotifyID},
			}
		}

		experimentRunCount, err := dbChaosExperimentRun.CountExperimentRuns(sessionContext, query)
		if err != nil {
			return err
		}
		fmt.Println("event", event.UpdatedBy)
		updatedBy, err := base64.RawURLEncoding.DecodeString(event.UpdatedBy)
		if err != nil {
			logrus.Fatalf("Failed to parse updated by field %v", err)
		}
		expRunDetail := []dbChaosExperiment.ExperimentRunDetail{
			{
				Phase:           executionData.Phase,
				ResiliencyScore: &workflowRunMetrics.ResiliencyScore,
				ExperimentRunID: event.ExperimentRunID,
				Completed:       false,
				Audit: mongodb.Audit{
					IsRemoved: false,
					CreatedAt: time.Now().UnixMilli(),
					UpdatedAt: time.Now().UnixMilli(),
					UpdatedBy: string(updatedBy),
				},
			},
		}
		if experimentRunCount == 0 {
			filter := bson.D{
				{"experiment_id", event.ExperimentID},
			}
			update := bson.D{
				{
					"$set", bson.D{
						{"updated_at", time.Now().UnixMilli()},
						{"total_experiment_runs", experiment.TotalExperimentRuns + 1},
					},
				},
				{
					"$push", bson.D{
						{"recent_experiment_run_details", bson.D{
							{"$each", expRunDetail},
							{"$position", 0},
							{"$slice", 10},
						}},
					},
				},
			}

			err = c.chaosExperimentOperator.UpdateChaosExperiment(sessionContext, filter, update)
			if err != nil {
				logrus.Error("Failed to update experiment collection")
				return err
			}
		} else if experimentRunCount > 0 {
			filter := bson.D{
				{"experiment_id", event.ExperimentID},
				{"recent_experiment_run_details.experiment_run_id", event.ExperimentRunID},
				{"recent_experiment_run_details.completed", false},
			}
			if event.NotifyID != nil {
				filter = bson.D{
					{"experiment_id", event.ExperimentID},
					{"recent_experiment_run_details.completed", false},
					{"recent_experiment_run_details.notify_id", event.NotifyID},
				}
			}

			update := bson.D{
				{
					"$set", bson.D{
						{"recent_experiment_run_details.$.phase", executionData.Phase},
						{"recent_experiment_run_details.$.completed", event.Completed},
						{"recent_experiment_run_details.$.experiment_run_id", event.ExperimentRunID},
						{"recent_experiment_run_details.$.resiliency_score", workflowRunMetrics.ResiliencyScore},
						{"recent_experiment_run_details.$.updated_at", currentTime.UnixMilli()},
						{"recent_experiment_run_details.$.updated_by", string(updatedBy)},
					},
				},
			}

			err = c.chaosExperimentOperator.UpdateChaosExperiment(sessionContext, filter, update)
			if err != nil {
				logrus.Error("Failed to update experiment collection")
				return err
			}
		}

		count, err := dbChaosExperimentRun.UpdateExperimentRun(sessionContext, dbChaosExperimentRun.ChaosExperimentRun{
			InfraID:         event.InfraID.InfraID,
			ProjectID:       experiment.ProjectID,
			ExperimentRunID: event.ExperimentRunID,
			ExperimentID:    event.ExperimentID,
			NotifyID:        event.NotifyID,
			Phase:           executionData.Phase,
			ResiliencyScore: &workflowRunMetrics.ResiliencyScore,
			FaultsPassed:    &workflowRunMetrics.FaultsPassed,
			FaultsFailed:    &workflowRunMetrics.FaultsFailed,
			FaultsAwaited:   &workflowRunMetrics.FaultsAwaited,
			FaultsStopped:   &workflowRunMetrics.FaultsStopped,
			FaultsNA:        &workflowRunMetrics.FaultsNA,
			TotalFaults:     &workflowRunMetrics.TotalExperiments,
			ExecutionData:   string(exeData),
			RevisionID:      event.RevisionID,
			Completed:       event.Completed,
			Audit: mongodb.Audit{
				IsRemoved: isRemoved,
				UpdatedAt: currentTime.UnixMilli(),
				UpdatedBy: string(updatedBy),
				CreatedBy: string(updatedBy),
			},
		})
		if err != nil {
			logrus.WithFields(logFields).Errorf("failed to update workflow run %v", err)
			return err
		}

		if count == 0 {
			err := fmt.Sprintf("experiment run has been discarded due the duplicate event, workflowId: %s, workflowRunId: %s", event.ExperimentID, event.ExperimentRunID)
			return errors.New(err)
		}

		if err = session.CommitTransaction(sessionContext); err != nil {
			logrus.WithFields(logFields).Errorf("failed to commit session transaction %v", err)
			return err
		}
		return nil
	})

	if err != nil {
		if abortErr := session.AbortTransaction(ctx); abortErr != nil {
			logrus.WithFields(logFields).Errorf("failed to abort session transaction %v", err)
			return "", abortErr
		}
		return "", err
	}

	session.EndSession(ctx)

	return fmt.Sprintf("Experiment run received for for ExperimentID: %s, ExperimentRunID: %s", event.ExperimentID, event.ExperimentRunID), nil
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
