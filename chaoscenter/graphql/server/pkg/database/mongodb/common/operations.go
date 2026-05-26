package common

import (
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"go.mongodb.org/mongo-driver/bson"
)

func CreatePaginationStage(pagination *model.Pagination) ([]bson.D, int, int) {
	var stages []bson.D
	skip := 0
	limit := 15

	if pagination != nil {
		page := pagination.Page
		limit = pagination.Limit

		skip = page * limit
	}

	stages = append(stages, bson.D{
		{"$skip", skip},
	})
	stages = append(stages, bson.D{{
		"$limit", limit},
	})

	return stages, skip, limit
}
