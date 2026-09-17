package utils

import (
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/types"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetProjectFilters(c *gin.Context) *entities.ListProjectRequest {
	var request entities.ListProjectRequest

	uID, exists := c.Get("uid")
	if exists {
		request.UserID = uID.(string)
	}

	// Initialize request.Filter and request.Sort if they are nil
	if request.Filter == nil {
		request.Filter = &entities.ListProjectInputFilter{}
	}
	if request.Sort == nil {
		request.Sort = &entities.SortInput{}
	}

	// filters
	createdByMeStr := c.Query(types.CreatedByMe)
	if createdByMeStr != "" {
		createdByMe, err := strconv.ParseBool(createdByMeStr)
		if err != nil {
			log.Fatal(err)
			return nil
		}
		request.Filter.CreatedByMe = &createdByMe
	}

	projectNameStr := c.Query(types.ProjectName)

	if projectNameStr != "" {
		request.Filter.ProjectName = &projectNameStr
	}

	// sorts
	var sortField entities.ProjectSortingField
	sortFieldStr := c.Query(types.SortField)

	// Convert the string value to the appropriate type
	switch sortFieldStr {
	case "name":
		sortField = entities.ProjectSortingFieldName
	case "time":
		sortField = entities.ProjectSortingFieldTime
	default:
		sortField = entities.ProjectSortingFieldTime
	}

	// Now assign the converted value to the sort field
	request.Sort.Field = &sortField

	ascendingStr := c.Query(types.Ascending)
	if ascendingStr != "" {
		ascending, err := strconv.ParseBool(ascendingStr)
		if err != nil {
			log.Fatal(err)
			return nil
		}
		request.Sort.Ascending = &ascending
	}

	// pagination
	// Extract page and limit from query parameters
	pageStr := c.Query(types.Page)
	limitStr := c.Query(types.Limit)

	// Convert strings to integers
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		// Handle error if conversion fails
		// For example, set a default value or return an error response
		page = 0 // Setting a default value of 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		// Handle error if conversion fails
		// For example, set a default value or return an error response
		limit = 15 // Setting a default value of 15
	}

	pagination := entities.Pagination{
		Page:  page,
		Limit: limit,
	}

	request.Pagination = &pagination

	return &request
}

func CreateMatchStage(userID string) bson.D {
	return bson.D{
		{"$match", bson.D{
			{"is_removed", false},
			{"members", bson.D{
				{"$elemMatch", bson.D{
					{"user_id", userID},
					{"invitation", bson.D{
						{"$nin", bson.A{
							string(entities.PendingInvitation),
							string(entities.DeclinedInvitation),
							string(entities.ExitedProject),
						}},
					}},
				}},
			}},
		}},
	}
}

func CreateFilterStages(filter *entities.ListProjectInputFilter, userID string) []bson.D {
	var stages []bson.D

	if filter == nil {
		return stages
	}

	if filter.CreatedByMe != nil {
		if *filter.CreatedByMe {
			stages = append(stages, bson.D{
				{"$match", bson.D{
					{"created_by.user_id", bson.M{"$eq": userID}},
				}},
			})
		} else {
			stages = append(stages, bson.D{
				{"$match", bson.D{
					{"created_by.user_id", bson.M{"$ne": userID}},
				}},
			})
		}
	}

	if filter.ProjectName != nil {
		stages = append(stages, bson.D{
			{"$match", bson.D{
				{"name", bson.D{
					{"$regex", primitive.Regex{Pattern: *filter.ProjectName, Options: "i"}},
				}},
			}},
		})
	}

	return stages
}

func CreateSortStage(sort *entities.SortInput) bson.D {
	if sort == nil || sort.Field == nil {
		return bson.D{}
	}

	var sortField string
	switch *sort.Field {
	case entities.ProjectSortingFieldTime:
		sortField = "updated_at"
	case entities.ProjectSortingFieldName:
		sortField = "name"
	default:
		sortField = "updated_at"
	}

	sortDirection := -1
	if sort.Ascending != nil && *sort.Ascending {
		sortDirection = 1
	}

	return bson.D{
		{"$sort", bson.D{
			{sortField, sortDirection},
		}},
	}
}

func CreatePaginationStage(pagination *entities.Pagination) ([]bson.D, int, int) {
	var stages []bson.D
	skip := 0
	limit := 10

	if pagination != nil {
		page := pagination.Page
		limit = pagination.Limit

		// upper limit of 50 to prevent exceeding max limit 16mb
		if limit > 50 {
			limit = 50
		}
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
