package utils

import (
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
)

func GetProjectFilters(c *gin.Context) *entities.ListProjectRequest {
	uID := c.MustGet("uid").(string)

	var request entities.ListProjectRequest

	if uID != "" {
		request.UserID = uID
	}

	// Initialize request.Filter and request.Sort if they are nil
	if request.Filter == nil {
		request.Filter = &entities.ListProjectInputFilter{}
	}
	if request.Sort == nil {
		request.Sort = &entities.SortInput{}
	}

	// filters
	createdByMeStr := c.Query(entities.CreatedByMe)
	if createdByMeStr != "" {
		createdByMe, err := strconv.ParseBool(createdByMeStr)
		if err != nil {
			log.Fatal(err)
			return nil
		}
		request.Filter.CreatedByMe = &createdByMe
	}

	projectNameStr := c.Query(entities.ProjectName)

	if projectNameStr != "" {
		request.Filter.ProjectName = &projectNameStr
	}

	// sorts
	var sortField entities.ProjectSortingField
	sortFieldStr := c.Query(entities.SortField)

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

	ascendingStr := c.Query(entities.Ascending)
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
	pageStr := c.Query(entities.Page)
	limitStr := c.Query(entities.Limit)

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
