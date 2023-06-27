package chaos_experiment

import (
	"fmt"
	"time"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func CreateListExperimentPipeline(projectID string, request model.ListExperimentRequest) mongo.Pipeline {

	var pipeline mongo.Pipeline

	// Match with identifiers
	pipeline = append(pipeline, identifierPipeline(projectID))

	//Match the workflowIDs from the input array
	if len(request.ExperimentIDs) != 0 {
		pipeline = append(pipeline, experimentIdPipeline(request.ExperimentIDs))
	}

	// Filtering out the workflows that are deleted/removed
	pipeline = append(pipeline, activeExperimentPipeline())

	wfSortStage := bson.D{
		{Key: "$sort", Value: bson.D{
			{Key: "updated_at", Value: -1},
		}},
	}
	pipeline = append(pipeline, wfSortStage)

	// Filtering based on multiple parameters
	if request.Filter != nil {
		pipeline = append(pipeline, filterPipeline(request)...)
	}

	// experimentRunDetailsPipeline adds details of latest experiment run to each document
	pipeline = append(pipeline, experimentRunDetailsPipeline())

	if request.Filter != nil && request.Filter.Status != nil {
		pipeline = append(pipeline, filterRunPhasePipeline(request.Filter.Status))
	}

	// fetchInfraDetailsStage adds infra details of corresponding experiment_id to each document
	pipeline = append(pipeline, infraDetailsPipeline())

	if request.Filter != nil {
		pipeline = append(pipeline, filterInfraStatusPipeline(request.Filter.InfraActive, request.Filter.InfraName)...)
	}

	sortStage := sortPipeline(request)
	//Pagination or adding a default limit of 15 if pagination not provided
	paginatedExperiments := paginatePipeline(request, sortStage)

	// Add two stages where we first count the number of filtered workflow and then paginate the results
	pipeline = append(pipeline, facetStagePipeline(paginatedExperiments))

	return pipeline
}

func identifierPipeline(projectID string) bson.D {
	return bson.D{
		{Key: "$match", Value: bson.D{
			{Key: "project_id", Value: projectID},
		}},
	}
}

func experimentIdPipeline(experimentIDs []*string) bson.D {
	return bson.D{
		{Key: "$match", Value: bson.D{
			{Key: "experiment_id", Value: bson.D{
				{Key: "$in", Value: experimentIDs},
			}},
		}},
	}
}

func activeExperimentPipeline() bson.D {
	return bson.D{
		{Key: "$match", Value: bson.D{
			{Key: "is_removed", Value: bson.D{
				{Key: "$eq", Value: false},
			}},
		}},
	}
}

func filterPipeline(request model.ListExperimentRequest) mongo.Pipeline {

	var pipeline mongo.Pipeline

	// Filtering based on workflow name
	if request.Filter.ExperimentName != nil && *request.Filter.ExperimentName != "" {
		matchWfNameStage := bson.D{
			{Key: "$match", Value: bson.D{
				{Key: "name", Value: bson.D{
					{Key: "$regex", Value: request.Filter.ExperimentName},
				}},
			}},
		}
		pipeline = append(pipeline, matchWfNameStage)
	}

	// Filtering based on infraId
	if request.Filter.InfraID != nil && *request.Filter.InfraID != "All" && *request.Filter.InfraID != "" {
		matchInfraStage := bson.D{
			{Key: "$match", Value: bson.D{
				{Key: "infra_id", Value: request.Filter.InfraID},
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
			{Key: "$match", Value: bson.D{
				{Key: "type", Value: workflowType},
			}},
		}
		pipeline = append(pipeline, matchScenarioStage)
	}

	// Filtering based on date range (workflow's last updated time)
	if request.Filter.DateRange != nil {
		endDate := fmt.Sprint(time.Now().UnixMilli())
		if request.Filter.DateRange.EndDate != nil {
			endDate = *request.Filter.DateRange.EndDate
		}

		filterWfDateStage := bson.D{
			{Key: "$match",
				Value: bson.D{{Key: "updated_at", Value: bson.D{
					{Key: "$lte", Value: endDate},
					{Key: "$gte", Value: request.Filter.DateRange.StartDate},
				}}},
			},
		}
		pipeline = append(pipeline, filterWfDateStage)
	}
	return pipeline
}

func experimentRunDetailsPipeline() bson.D {
	return bson.D{
		{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "chaosExperimentRuns"},
			{Key: "let", Value: bson.D{{Key: "expID", Value: "$experiment_id"}}},
			{Key: "pipeline", Value: bson.A{
				bson.D{
					{Key: "$match", Value: bson.D{
						{Key: "$expr", Value: bson.D{
							{Key: "$eq", Value: bson.A{"$experiment_id", "$$expID"}},
						}},
					}},
				},
				bson.D{
					{Key: "$sort", Value: bson.D{
						{Key: "updated_at", Value: -1},
					}},
				},
				bson.D{
					{Key: "$limit", Value: 1},
				},
				bson.D{
					{Key: "$project", Value: bson.D{
						{Key: "_id", Value: 0},
						{Key: "phase", Value: 1},
						{Key: "resiliency_score", Value: 1},
						{Key: "experiment_run_id", Value: 1},
						{Key: "experiment_id", Value: 1},
						{Key: "updated_at", Value: 1},
						{Key: "updated_by", Value: 1},
					}},
				},
			}},
			{Key: "as", Value: "lastExpRunDetails"},
		}},
	}
}

func filterRunPhasePipeline(status *string) bson.D {
	return bson.D{
		{Key: "$match", Value: bson.D{
			{Key: "lastExpRunDetails.phase", Value: status},
		}},
	}
}

func filterInfraStatusPipeline(infraActive *bool, infraName *string) mongo.Pipeline {
	var pipeline mongo.Pipeline

	if infraActive != nil {
		filterInfraStatusStage := bson.D{
			{Key: "$match", Value: bson.D{
				{Key: "infraDetails.is_active", Value: infraActive},
			}},
		}
		pipeline = append(pipeline, filterInfraStatusStage)
	}

	if infraName != nil {
		filterInfraNameStage := bson.D{
			{Key: "$match", Value: bson.D{
				{Key: "infraDetails.infra_name", Value: infraName},
			}},
		}
		pipeline = append(pipeline, filterInfraNameStage)
	}

	return pipeline
}

func infraDetailsPipeline() bson.D {
	return bson.D{
		{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "chaosInfrastructures"},
			{Key: "let", Value: bson.M{"infraID": "$infra_id"}},
			{Key: "pipeline", Value: bson.A{
				bson.D{
					{Key: "$match", Value: bson.D{
						{Key: "$expr", Value: bson.D{
							{Key: "$eq", Value: bson.A{"$infra_id", "$$infraID"}},
						}},
					}},
				},
				bson.D{
					{Key: "$project", Value: bson.D{
						{Key: "token", Value: 0},
						{Key: "infra_ns_exists", Value: 0},
						{Key: "infra_sa_exists", Value: 0},
						{Key: "access_key", Value: 0},
					}},
				},
			},
			},
			{Key: "as", Value: "infraDetails"},
		}}}
}

func sortPipeline(request model.ListExperimentRequest) bson.D {
	var sortStage bson.D

	switch {
	case request.Sort != nil && request.Sort.Field == model.ExperimentSortingFieldTime:
		// Sorting based on LastUpdated time
		if request.Sort.Ascending != nil && *request.Sort.Ascending {
			sortStage = bson.D{
				{Key: "$sort", Value: bson.D{
					{Key: "updated_at", Value: 1},
				}},
			}
		} else {
			sortStage = bson.D{
				{Key: "$sort", Value: bson.D{
					{Key: "updated_at", Value: -1},
				}},
			}
		}

	case request.Sort != nil && request.Sort.Field == model.ExperimentSortingFieldName:
		// Sorting based on ExperimentName
		if request.Sort.Ascending != nil && *request.Sort.Ascending {
			sortStage = bson.D{
				{Key: "$sort", Value: bson.D{
					{Key: "name", Value: 1},
				}},
			}
		} else {
			sortStage = bson.D{
				{Key: "$sort", Value: bson.D{
					{Key: "name", Value: -1},
				}},
			}
		}
	default:
		// Default sorting: sorts it by LastUpdated time in descending order
		sortStage = bson.D{
			{Key: "$sort", Value: bson.D{
				{Key: "created_at", Value: -1},
			}},
		}
	}
	return sortStage
}

func paginatePipeline(request model.ListExperimentRequest, sortStage bson.D) bson.A {
	paginatedExperiments := bson.A{
		sortStage,
	}

	if request.Pagination != nil {
		paginationSkipStage := bson.D{
			{Key: "$skip", Value: request.Pagination.Page * request.Pagination.Limit},
		}
		paginationLimitStage := bson.D{
			{Key: "$limit", Value: request.Pagination.Limit},
		}

		paginatedExperiments = append(paginatedExperiments, paginationSkipStage, paginationLimitStage)
	} else {
		limitStage := bson.D{
			{Key: "$limit", Value: 15},
		}

		paginatedExperiments = append(paginatedExperiments, limitStage)
	}
	return paginatedExperiments
}

func facetStagePipeline(paginatedExperiments bson.A) bson.D {
	return bson.D{
		{Key: "$facet", Value: bson.D{
			{Key: "total_filtered_experiments", Value: bson.A{
				bson.D{{Key: "$count", Value: "count"}},
			}},
			{Key: "scheduled_experiments", Value: paginatedExperiments},
		}},
	}
}

func CalculateAvergaResiliencyScore(lastExperimentRunDetails []chaos_experiment_run.ChaosExperimentRun) float64 {
	count := 0.0
	sum := 0.0
	var avgResScore float64
	for _, v := range lastExperimentRunDetails {
		if v.Phase == "Completed" {
			count++
			sum = sum + *v.ResiliencyScore
		}
	}
	if count != 0 {
		avgResScore = sum / count
	}
	return avgResScore
}
