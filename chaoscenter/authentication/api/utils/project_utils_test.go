package utils

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/types"
)

func TestGetProjectFilters(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name    string
		query   string
		wantErr bool
	}{
		{"no params", "", false},
		{"valid createdByMe", types.CreatedByMe + "=true", false},
		{"valid ascending", types.Ascending + "=false", false},
		{"invalid createdByMe", types.CreatedByMe + "=notabool", true},
		{"invalid ascending", types.Ascending + "=notabool", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, _ := gin.CreateTestContext(httptest.NewRecorder())
			c.Request = httptest.NewRequest(http.MethodGet, "/list_projects?"+tt.query, nil)

			req, err := GetProjectFilters(c)
			if (err != nil) != tt.wantErr {
				t.Fatalf("GetProjectFilters() error = %v, wantErr %v", err, tt.wantErr)
			}
			if !tt.wantErr && req == nil {
				t.Fatal("expected a non-nil request")
			}
		})
	}
}

func TestGetProjectFilters_Pagination(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name      string
		query     string
		wantPage  int
		wantLimit int
	}{
		{"defaults", "", 0, 15},
		{"valid values", types.Page + "=2&" + types.Limit + "=5", 2, 5},
		{"non numeric values use the defaults", types.Page + "=a&" + types.Limit + "=b", 0, 15},
		{"negative page uses the first page", types.Page + "=-1&" + types.Limit + "=5", 0, 5},
		{"zero limit uses the default page size", types.Page + "=1&" + types.Limit + "=0", 1, 15},
		{"negative limit uses the default page size", types.Page + "=1&" + types.Limit + "=-5", 1, 15},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, _ := gin.CreateTestContext(httptest.NewRecorder())
			c.Request = httptest.NewRequest(http.MethodGet, "/list_projects?"+tt.query, nil)

			req, err := GetProjectFilters(c)
			if err != nil {
				t.Fatalf("GetProjectFilters() error = %v", err)
			}
			if req.Pagination.Page != tt.wantPage || req.Pagination.Limit != tt.wantLimit {
				t.Fatalf("pagination = %+v, want page %d and limit %d", *req.Pagination, tt.wantPage, tt.wantLimit)
			}
		})
	}
}
