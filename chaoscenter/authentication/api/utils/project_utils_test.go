package utils

import (
	"testing"

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
