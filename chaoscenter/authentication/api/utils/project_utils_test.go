package utils

import (
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/types"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func TestCreateFilterStages_SearchesProjectNameLiterally(t *testing.T) {
	search := "project (a.b"

	stages := CreateFilterStages(&entities.ListProjectInputFilter{ProjectName: &search}, "user-1")

	want := []bson.D{{{"$match", bson.D{{"name", bson.D{
		{"$regex", primitive.Regex{Pattern: `project \(a\.b`, Options: "i"}},
	}}}}}}
	if !reflect.DeepEqual(stages, want) {
		t.Fatalf("CreateFilterStages() = %v, want %v", stages, want)
	}
}
