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

	probeUtils "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/utils"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_infrastructure"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/gitops"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readconcern"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"

	"github.com/ghodss/yaml"
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"

	"github.com/sirupsen/logrus"
	"github.com/tidwall/gjson"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	types "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaos_experiment_run"
	store "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/data-store"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"

	dbChaosInfra "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_infrastructure"

	"github.com/google/uuid"
)

// ChaosExperimentRunHandler is the handler for chaos experiment
type ChaosExperimentRunHandler struct {
	chaosExperimentRunService  types.Service
	infrastructureService      chaos_infrastructure.Service
	gitOpsService              gitops.Service
	chaosExperimentOperator    *dbChaosExperiment.Operator
	chaosExperimentRunOperator *dbChaosExperimentRun.Operator
	mongodbOperator            mongodb.MongoOperator
}

// NewChaosExperimentRunHandler returns a new instance of ChaosWorkflowHandler
func NewChaosExperimentRunHandler(
	chaosExperimentRunService types.Service,
	infrastructureService chaos_infrastructure.Service,
	gitOpsService gitops.Service,
	chaosExperimentOperator *dbChaosExperiment.Operator,
	chaosExperimentRunOperator *dbChaosExperimentRun.Operator,
	mongodbOperator mongodb.MongoOperator,
) *ChaosExperimentRunHandler {
	return &ChaosExperimentRunHandler{
		chaosExperimentRunService:  chaosExperimentRunService,
		infrastructureService:      infrastructureService,
		gitOpsService:              gitOpsService,
		chaosExperimentOperator:    chaosExperimentOperator,
		chaosExperimentRunOperator: chaosExperimentRunOperator,
		mongodbOperator:            mongodbOperator,
	}
}

// GetExperimentRun returns details of a requested experiment run
func (c *ChaosExperimentRunHandler) GetExperimentRun(ctx context.Context, projectID string, experimentRunID *string, notifyID *string) (*model.ExperimentRun, error) {
	var pipeline mongo.Pipeline

	if experimentRunID == nil && notifyID == nil {
		return nil, errors.New("experimentRunID or notifyID not provided")
	}

	// Matching with identifiers
	if experimentRunID != nil && *experimentRunID != "" {
		matchIdentifiersStage := bson.D{
			{
				"$match", bson.D{
					{"experiment_run_id", experimentRunID},
					{"project_id", bson.D{{"$eq", projectID}}},
					{"is_removed", false},
				},
			},
		}
		pipeline = append(pipeline, matchIdentifiersStage)
	}

	if notifyID != nil && *notifyID != "" {
		matchIdentifiersStage := bson.D{
			{
				"$match", bson.D{
					{"notify_id", bson.D{{"$eq", notifyID}}},
					{"project_id", bson.D{{"$eq", projectID}}},
					{"is_removed", false},
				},
			},
		}
		pipeline = append(pipeline, matchIdentifiersStage)
	}

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
								{"experiment_type", 1},
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
	expRunCursor, err := c.chaosExperimentRunOperator.GetAggregateExperimentRuns(pipeline)
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

		expType := string(wfRun.ExperimentDetails[0].ExperimentType)

		expRunResponse = &model.ExperimentRun{
			ExperimentName:     wfRun.ExperimentDetails[0].ExperimentName,
			ExperimentID:       wfRun.ExperimentID,
			ExperimentRunID:    wfRun.ExperimentRunID,
			ExperimentType:     &expType,
			NotifyID:           wfRun.NotifyID,
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
			RunSequence:        int(wfRun.RunSequence),

			UpdatedBy: &model.UserDetails{
				Username: wfRun.UpdatedBy.Username,
			},
			UpdatedAt: strconv.FormatInt(wfRun.UpdatedAt, 10),
			CreatedAt: strconv.FormatInt(wfRun.CreatedAt, 10),
		}
	}

	return expRunResponse, nil
}

// ListExperimentRun returns all the workflow runs for matching identifiers from the DB
func (c *ChaosExperimentRunHandler) ListExperimentRun(projectID string, request model.ListExperimentRunRequest) (*model.ListExperimentRunResponse, error) {
	var pipeline mongo.Pipeline

	// Matching with identifiers
	matchIdentifiersStage := bson.D{
		{
			"$match", bson.D{{
				"$and", bson.A{
					bson.D{
						{"project_id", bson.D{{"$eq", projectID}}},
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
	workflowsCursor, err := c.chaosExperimentRunOperator.GetAggregateExperimentRuns(pipeline)
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
				Username: workflow.UpdatedBy.Username,
			},
			UpdatedAt:   strconv.FormatInt(workflow.UpdatedAt, 10),
			CreatedAt:   strconv.FormatInt(workflow.CreatedAt, 10),
			RunSequence: int(workflow.RunSequence),
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

// RunChaosWorkFlow sends workflow run request(single run workflow only) to chaos_infra on workflow re-run request
func (c *ChaosExperimentRunHandler) RunChaosWorkFlow(ctx context.Context, projectID string, workflow dbChaosExperiment.ChaosExperimentRequest, r *store.StateData) (*model.RunChaosExperimentResponse, error) {
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

	var probes []dbChaosExperimentRun.Probes
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

					var annotationArray []string
					for _, key := range annotation {
						var manifestAnnotation []dbChaosExperiment.ProbeAnnotations
						err := json.Unmarshal([]byte(key), &manifestAnnotation)
						if err != nil {
							return nil, errors.New("failed to unmarshal experiment annotation object")
						}
						for _, annotationKey := range manifestAnnotation {
							annotationArray = append(annotationArray, annotationKey.Name)
						}
					}
					probes = append(probes, dbChaosExperimentRun.Probes{
						artifact[0].Name,
						annotationArray,
					})

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

					if len(meta.Spec.Experiments[0].Spec.Probe) != 0 {
						meta.Spec.Experiments[0].Spec.Probe = utils.TransformProbe(meta.Spec.Experiments[0].Spec.Probe)
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
		Phase:        string(model.ExperimentRunStatusQueued),
		ExperimentID: workflow.ExperimentID,
	}

	parsedData, err := json.Marshal(executionData)
	if err != nil {
		logrus.Error("Failed to parse execution data")
		return nil, err
	}

	var (
		wc      = writeconcern.New(writeconcern.WMajority())
		rc      = readconcern.Snapshot()
		txnOpts = options.Transaction().SetWriteConcern(wc).SetReadConcern(rc)
	)

	tkn := ctx.Value(authorization.AuthKey).(string)
	username, err := authorization.GetUsername(tkn)
	if err != nil {
		return nil, err
	}

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
				Phase:       executionData.Phase,
				Completed:   false,
				ProjectID:   projectID,
				NotifyID:    &notifyID,
				RunSequence: workflow.TotalExperimentRuns + 1,
				Audit: mongodb.Audit{
					IsRemoved: false,
					CreatedAt: currentTime,
					CreatedBy: mongodb.UserDetailResponse{
						Username: username,
					},
					UpdatedAt: currentTime,
					UpdatedBy: mongodb.UserDetailResponse{
						Username: username,
					},
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

		err = c.chaosExperimentRunOperator.CreateExperimentRun(sessionContext, dbChaosExperimentRun.ChaosExperimentRun{
			InfraID:      workflow.InfraID,
			ExperimentID: workflow.ExperimentID,
			Phase:        string(model.ExperimentRunStatusQueued),
			RevisionID:   workflow.Revision[0].RevisionID,
			ProjectID:    projectID,
			Audit: mongodb.Audit{
				IsRemoved: false,
				CreatedAt: currentTime,
				CreatedBy: mongodb.UserDetailResponse{
					Username: username,
				},
				UpdatedAt: currentTime,
				UpdatedBy: mongodb.UserDetailResponse{
					Username: username,
				},
			},
			NotifyID:        &notifyID,
			Completed:       false,
			ResiliencyScore: &resScore,
			ExecutionData:   string(parsedData),
			RunSequence:     workflow.TotalExperimentRuns + 1,
			Probes:          probes,
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

	// Convert updated manifest to string
	manifestString, err := json.Marshal(workflowManifest)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal experiment manifest, err: %v", err)
	}

	// Generate Probe in the manifest
	workflowManifest, err = probeUtils.GenerateExperimentManifestWithProbes(string(manifestString), projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate probes in workflow manifest, err: %v", err)
	}

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

func (c *ChaosExperimentRunHandler) RunCronExperiment(ctx context.Context, projectID string, workflow dbChaosExperiment.ChaosExperimentRequest, r *store.StateData) error {
	var (
		cronExperimentManifest v1alpha1.CronWorkflow
	)

	if len(workflow.Revision) == 0 {
		return errors.New("no revisions found")
	}
	sort.Slice(workflow.Revision, func(i, j int) bool {
		return workflow.Revision[i].UpdatedAt > workflow.Revision[j].UpdatedAt
	})

	cronExperimentManifest, err := probeUtils.GenerateCronExperimentManifestWithProbes(workflow.Revision[0].ExperimentManifest, workflow.ProjectID)
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
					if len(meta.Spec.Experiments[0].Spec.Probe) != 0 {
						meta.Spec.Experiments[0].Spec.Probe = utils.TransformProbe(meta.Spec.Experiments[0].Spec.Probe)
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
	if err != nil {
		return err
	}

	if r != nil {
		chaos_infrastructure.SendExperimentToSubscriber(projectID, &model.ChaosExperimentRequest{
			ExperimentID:       &workflow.ExperimentID,
			ExperimentManifest: string(manifest),
			InfraID:            workflow.InfraID,
		}, &username, nil, "create", r)
	}

	return nil
}

func (c *ChaosExperimentRunHandler) GetExperimentRunStats(ctx context.Context, projectID string) (*model.GetExperimentRunStatsResponse, error) {
	var pipeline mongo.Pipeline
	// Match with identifiers
	matchIdentifierStage := bson.D{
		{"$match", bson.D{
			{"project_id", bson.D{{"$eq", projectID}}},
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
	experimentRunCursor, err := c.chaosExperimentRunOperator.GetAggregateExperimentRuns(pipeline)
	if err != nil {
		return nil, err
	}

	var res []dbChaosExperiment.AggregatedExperimentRunStats

	if err = experimentRunCursor.All(context.Background(), &res); err != nil {
		return nil, err
	}

	resMap := map[model.ExperimentRunStatus]int{
		model.ExperimentRunStatusCompleted:  0,
		model.ExperimentRunStatusStopped:    0,
		model.ExperimentRunStatusRunning:    0,
		model.ExperimentRunStatusTerminated: 0,
		model.ExperimentRunStatusError:      0,
	}

	totalExperimentRuns := 0
	for _, phase := range res {
		resMap[model.ExperimentRunStatus(phase.Id)] = phase.Count
		totalExperimentRuns = totalExperimentRuns + phase.Count
	}

	return &model.GetExperimentRunStatsResponse{
		TotalExperimentRuns:           totalExperimentRuns,
		TotalCompletedExperimentRuns:  resMap[model.ExperimentRunStatusCompleted],
		TotalTerminatedExperimentRuns: resMap[model.ExperimentRunStatusTerminated],
		TotalRunningExperimentRuns:    resMap[model.ExperimentRunStatusRunning],
		TotalStoppedExperimentRuns:    resMap[model.ExperimentRunStatusStopped],
		TotalErroredExperimentRuns:    resMap[model.ExperimentRunStatusError],
	}, nil
}

func (c *ChaosExperimentRunHandler) ChaosExperimentRunEvent(event model.ExperimentRunRequest) (string, error) {
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

	expType := experiment.ExperimentType
	probes, err := probeUtils.ParseProbesFromManifestForRuns(&expType, experiment.Revision[len(experiment.Revision)-1].ExperimentManifest)
	if err != nil {
		return "", fmt.Errorf("unable to parse probes %v", err.Error())
	}

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
		workflowRunMetrics, err = c.chaosExperimentRunService.ProcessCompletedExperimentRun(executionData, event.ExperimentID, event.ExperimentRunID)
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

		experimentRunCount, err := c.chaosExperimentRunOperator.CountExperimentRuns(sessionContext, query)
		if err != nil {
			return err
		}
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
				RunSequence:     experiment.TotalExperimentRuns + 1,
				Audit: mongodb.Audit{
					IsRemoved: false,
					CreatedAt: time.Now().UnixMilli(),
					UpdatedAt: time.Now().UnixMilli(),
					UpdatedBy: mongodb.UserDetailResponse{
						Username: string(updatedBy),
					},
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
				logrus.WithError(err).Error("Failed to update experiment collection")
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
			updatedByModel := mongodb.UserDetailResponse{
				Username: string(updatedBy),
			}
			update := bson.D{
				{
					"$set", bson.D{
						{"recent_experiment_run_details.$.phase", executionData.Phase},
						{"recent_experiment_run_details.$.completed", event.Completed},
						{"recent_experiment_run_details.$.experiment_run_id", event.ExperimentRunID},
						{"recent_experiment_run_details.$.probes", probes},
						{"recent_experiment_run_details.$.resiliency_score", workflowRunMetrics.ResiliencyScore},
						{"recent_experiment_run_details.$.updated_at", currentTime.UnixMilli()},
						{"recent_experiment_run_details.$.updated_by", updatedByModel},
					},
				},
			}

			err = c.chaosExperimentOperator.UpdateChaosExperiment(sessionContext, filter, update)
			if err != nil {
				logrus.WithError(err).Error("Failed to update experiment collection")
				return err
			}
		}

		count, err := c.chaosExperimentRunOperator.UpdateExperimentRun(sessionContext, dbChaosExperimentRun.ChaosExperimentRun{
			InfraID:         event.InfraID.InfraID,
			ProjectID:       experiment.ProjectID,
			ExperimentRunID: event.ExperimentRunID,
			ExperimentID:    event.ExperimentID,
			NotifyID:        event.NotifyID,
			Phase:           executionData.Phase,
			ResiliencyScore: &workflowRunMetrics.ResiliencyScore,
			FaultsPassed:    &workflowRunMetrics.ExperimentsPassed,
			FaultsFailed:    &workflowRunMetrics.ExperimentsFailed,
			FaultsAwaited:   &workflowRunMetrics.ExperimentsAwaited,
			FaultsStopped:   &workflowRunMetrics.ExperimentsStopped,
			FaultsNA:        &workflowRunMetrics.ExperimentsNA,
			TotalFaults:     &workflowRunMetrics.TotalExperiments,
			ExecutionData:   string(exeData),
			RevisionID:      event.RevisionID,
			Completed:       event.Completed,
			Probes:          probes,
			RunSequence:     experiment.TotalExperimentRuns + 1,
			Audit: mongodb.Audit{
				IsRemoved: isRemoved,
				UpdatedAt: currentTime.UnixMilli(),
				UpdatedBy: mongodb.UserDetailResponse{
					Username: string(updatedBy),
				},
				CreatedBy: mongodb.UserDetailResponse{
					Username: string(updatedBy),
				},
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
