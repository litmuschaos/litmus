package usage

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/jinzhu/copier"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/graph/model"
	dbOperationsProject "github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/project"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

//GetUsage returns the portals usage overview
func GetUsage(ctx context.Context, query model.UsageQuery) (*model.UsageData, error) {
	data, err := usageHelper(ctx, query)
	if err != nil {
		return nil, err
	}
	var Projects []*model.ProjectData
	var Total model.TotalCount
	err = copier.Copy(&Projects, &data.Projects)
	if err != nil {
		return nil, errors.New("failed to copy project data : " + err.Error())
	}
	if len(data.TotalCount) != 1 {
		return nil, errors.New("failed to get total count")
	}
	err = copier.Copy(&Total, &data.TotalCount[0])
	if err != nil {
		return nil, errors.New("failed to copy total count data : " + err.Error())
	}
	if len(data.Pagination) != 1 {
		return nil, errors.New("failed to get total entries for pagination")
	}
	return &model.UsageData{
		Projects:     Projects,
		TotalCount:   &Total,
		TotalEntries: data.Pagination[0].TotalEntries,
	}, nil
}

func usageHelper(ctx context.Context, query model.UsageQuery) (AggregateData, error) {
	pagination := bson.A{}
	project := bson.A{}
	startTime, err := strconv.Atoi(query.DateRange.StartDate)
	if err != nil {
		return AggregateData{}, errors.New("invalid start time")
	}
	endTime := int(time.Now().Unix())
	if query.DateRange.EndDate != nil {
		endTime, err = strconv.Atoi(*query.DateRange.EndDate)
		if err != nil {
			return AggregateData{}, errors.New("invalid end time")
		}
	}
	if query.SearchProject != nil {
		regex := bson.M{"$match": bson.M{"name": bson.M{"$regex": *query.SearchProject}}}
		pagination = append(pagination, regex)
		project = append(project, regex)
	}
	if query.Sort != nil {
		order := 1
		if query.Sort.Descending {
			order = -1
		}
		orderField := ""
		switch query.Sort.Field {
		case model.UsageSortProject:
			orderField = "name"
		case model.UsageSortOwner:
			orderField = "members.owner.username"
		case model.UsageSortAgents:
			orderField = "agents.total"
		case model.UsageSortSchedules:
			orderField = "workflows.schedules"
		case model.UsageSortWorkflowRuns:
			orderField = "workflows.runs"
		case model.UsageSortExperimentRuns:
			orderField = "workflows.expRuns"
		case model.UsageSortTeamMembers:
			orderField = "members.total"
		default:
			return AggregateData{}, errors.New("invalid sort field")
		}
		project = append(project, bson.M{"$sort": bson.M{orderField: order}})
	}
	if query.Pagination != nil {
		project = append(project, bson.M{"$skip": query.Pagination.Page * query.Pagination.Limit}, bson.M{"$limit": query.Pagination.Limit})
	}
	project = append(project, bson.M{"$project": bson.M{"_id": 0}})
	pagination = append(pagination, bson.M{"$count": "totalEntries"})
	pipeline := mongo.Pipeline{
		bson.D{
			{"$lookup", bson.M{
				"from":         "cluster-collection",
				"localField":   "_id",
				"foreignField": "project_id",
				"as":           "cluster",
			}},
		},
		bson.D{
			{"$lookup", bson.M{
				"from":         "workflow-collection",
				"localField":   "_id",
				"foreignField": "project_id",
				"as":           "wfData",
			}}},
		bson.D{{"$addFields", bson.M{
			"workflows": bson.M{
				"schedules": bson.M{
					"$size": bson.M{
						"$filter": bson.M{
							"input": "$wfData",
							"as":    "wfData",
							"cond": bson.M{"$and": bson.A{
								bson.M{
									"$gte": bson.A{bson.M{"$toInt": "$$wfData.created_at"}, startTime},
								},
								bson.M{
									"$lte": bson.A{bson.M{"$toInt": "$$wfData.created_at"}, endTime},
								},
							},
							},
						}}},
			},
			"wfData": bson.M{
				"$reduce": bson.M{
					"input":        "$wfData",
					"initialValue": bson.A{},
					"in":           bson.M{"$concatArrays": bson.A{"$$value", "$$this.workflow_runs"}},
				},
			},
		}}},
		bson.D{{"$addFields", bson.M{
			"wfData": bson.M{
				"$filter": bson.M{
					"input": "$wfData",
					"as":    "runs",
					"cond": bson.M{"$and": bson.A{
						bson.M{
							"$gte": bson.A{bson.M{"$toInt": "$$runs.last_updated"}, startTime},
						},
						bson.M{
							"$lte": bson.A{bson.M{"$toInt": "$$runs.last_updated"}, endTime},
						},
					},
					},
				}}}}},
		bson.D{{"$addFields", bson.M{
			"memberStat": bson.M{
				"owner": bson.M{
					"$mergeObjects": bson.M{
						"$map": bson.M{
							"input": bson.M{"$filter": bson.M{
								"input": "$members",
								"as":    "members",
								"cond": bson.M{
									"$eq": bson.A{"$$members.role", "Owner"},
								}}},
							"as": "owner",
							"in": bson.M{
								"user_id":  "$$owner.user_id",
								"username": "$$owner.username",
								"name":     "$$owner.name",
							}}}},
				"total": bson.M{"$size": "$members"},
			},
			"agents": bson.M{"ns": bson.M{
				"$size": bson.M{
					"$filter": bson.M{
						"input": "$cluster",
						"as":    "cluster",
						"cond":  bson.M{"$eq": bson.A{"$$cluster.agent_scope", "namespace"}},
					}}},
				"cluster": bson.M{
					"$size": bson.M{
						"$filter": bson.M{
							"input": "$cluster",
							"as":    "cluster",
							"cond":  bson.M{"$eq": bson.A{"$$cluster.agent_scope", "cluster"}},
						}}},
				"total": bson.M{
					"$size": "$cluster",
				},
			},
			"workflows": bson.M{
				"schedules": "$workflows.schedules",
				"runs": bson.M{
					"$size": "$wfData",
				},
				"expRuns": bson.M{"$sum": "$wfData.total_experiments"},
			}}}},
		bson.D{{"$project", bson.M{
			"project_id": "$_id",
			"name":       1,
			"workflows":  1,
			"members":    "$memberStat",
			"agents":     1,
		}}},
		bson.D{{
			"$facet", bson.M{
				"projects":   project,
				"pagination": pagination,
				"totalCount": bson.A{
					bson.M{"$group": bson.M{"_id": 0,
						"projects":  bson.M{"$sum": 1},
						"users":     bson.M{"$sum": 1},
						"ns":        bson.M{"$sum": "$agents.ns"},
						"cluster":   bson.M{"$sum": "$agents.cluster"},
						"total":     bson.M{"$sum": "$agents.total"},
						"schedules": bson.M{"$sum": "$workflows.schedules"},
						"runs":      bson.M{"$sum": "$workflows.runs"},
						"expRuns":   bson.M{"$sum": "$workflows.expRuns"},
					}},
					bson.M{"$project": bson.M{"projects": 1, "users": 1,
						"agents": bson.M{
							"ns":      "$ns",
							"cluster": "$cluster",
							"total":   "$total",
						},
						"workflows": bson.M{
							"schedules": "$schedules",
							"runs":      "$runs",
							"expRuns":   "$expRuns",
						}, "_id": 0}}}}}},
	}
	cursor, err := dbOperationsProject.GetAggregateProjects(ctx, pipeline)
	if err != nil {
		return AggregateData{}, err
	}
	data := []AggregateData{}
	err = cursor.All(ctx, &data)
	if err != nil {
		return AggregateData{}, err
	}
	if len(data) != 1 {
		return AggregateData{}, fmt.Errorf("could not fetch data properly, len of returned data!=1 : len=%v", len(data))
	}
	return data[0], nil
}
