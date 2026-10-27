package utils

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/types"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestCreateFilterStages(t *testing.T) {
	t.Run("returns empty stages for nil filter", func(t *testing.T) {
		stages := CreateFilterStages(nil, "user-1")

		require.Empty(t, stages)
	})

	t.Run("quotes project name regex meta characters", func(t *testing.T) {
		projectName := `project.*(prod)|test`
		stages := CreateFilterStages(&entities.ListProjectInputFilter{ProjectName: &projectName}, "user-1")

		require.Len(t, stages, 1)

		matchStage := stages[0].Map()["$match"]
		matchDoc, ok := matchStage.(bson.D)
		require.True(t, ok)

		nameFilter := matchDoc.Map()["name"]
		nameDoc, ok := nameFilter.(bson.D)
		require.True(t, ok)

		regexFilter := nameDoc.Map()["$regex"]
		regex, ok := regexFilter.(primitive.Regex)
		require.True(t, ok)
		require.Equal(t, `project\.\*\(prod\)\|test`, regex.Pattern)
		require.Equal(t, "i", regex.Options)
	})

	t.Run("keeps created by me and project name filters together", func(t *testing.T) {
		createdByMe := true
		projectName := "Team Alpha"
		stages := CreateFilterStages(&entities.ListProjectInputFilter{
			CreatedByMe: &createdByMe,
			ProjectName: &projectName,
		}, "user-1")

		require.Len(t, stages, 2)

		createdByMatch := stages[0].Map()["$match"]
		createdByDoc, ok := createdByMatch.(bson.D)
		require.True(t, ok)
		require.Equal(t, bson.M{"$eq": "user-1"}, createdByDoc.Map()["created_by.user_id"])

		projectNameMatch := stages[1].Map()["$match"]
		projectNameDoc, ok := projectNameMatch.(bson.D)
		require.True(t, ok)

		nameFilter := projectNameDoc.Map()["name"]
		nameDoc, ok := nameFilter.(bson.D)
		require.True(t, ok)

		regexFilter := nameDoc.Map()["$regex"]
		regex, ok := regexFilter.(primitive.Regex)
		require.True(t, ok)
		require.Equal(t, "Team Alpha", regex.Pattern)
		require.Equal(t, "i", regex.Options)
	})
}

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
			c.Set("groups", []string{"oidc-team"})

			req, err := GetProjectFilters(c)
			if (err != nil) != tt.wantErr {
				t.Fatalf("GetProjectFilters() error = %v, wantErr %v", err, tt.wantErr)
			}
			if !tt.wantErr && req == nil {
				t.Fatal("expected a non-nil request")
			}
			if !tt.wantErr {
				require.Equal(t, []string{"oidc-team"}, req.Groups)
			}
		})
	}
}
