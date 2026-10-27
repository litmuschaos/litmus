package project

import (
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"
)

func TestGroupRepositoryLiteralQueries(t *testing.T) {
	const projectID = `project.'{"ne":null}`
	const groupName = `team.'{"ne":null}`
	role := entities.RoleViewer
	member := &entities.GroupMember{
		Group:       groupName,
		DisplayName: "Team's {display.name}",
		Role:        role,
		AssignedAt:  1234,
	}
	filter := bson.D{{Key: "_id", Value: bson.D{{Key: "$eq", Value: projectID}}}}

	tests := []struct {
		name         string
		invoke       func(Repository) error
		update       bson.D
		arrayFilters bson.A
	}{
		{
			name: "list groups",
			invoke: func(repo Repository) error {
				_, err := repo.GetProjectGroupMembers(projectID)
				return err
			},
		},
		{
			name: "add group",
			invoke: func(repo Repository) error {
				return repo.AddGroupMember(projectID, member)
			},
			update: bson.D{{Key: "$push", Value: bson.D{{Key: "groups", Value: member}}}},
		},
		{
			name: "remove group",
			invoke: func(repo Repository) error {
				return repo.RemoveGroupMember(projectID, groupName)
			},
			update: bson.D{{Key: "$pull", Value: bson.D{{Key: "groups", Value: bson.D{
				{Key: "group", Value: bson.D{{Key: "$eq", Value: groupName}}},
			}}}}},
		},
		{
			name: "update group role",
			invoke: func(repo Repository) error {
				return repo.UpdateGroupMemberRole(projectID, groupName, &role)
			},
			update: bson.D{{Key: "$set", Value: bson.D{{Key: "groups.$[elem].role", Value: role}}}},
			arrayFilters: bson.A{
				bson.D{{Key: "elem.group", Value: bson.D{{Key: "$eq", Value: groupName}}}},
			},
		},
	}

	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	for _, test := range tests {
		mt.Run(test.name, func(mt *mtest.T) {
			if test.update == nil {
				mt.AddMockResponses(mtest.CreateCursorResponse(0,
					mt.DB.Name()+"."+mt.Coll.Name(), mtest.FirstBatch,
					bson.D{{Key: "groups", Value: bson.A{member}}}))
			} else {
				mt.AddMockResponses(mtest.CreateSuccessResponse(
					bson.E{Key: "n", Value: 1}, bson.E{Key: "nModified", Value: 1}))
			}

			require.NoError(mt, test.invoke(NewRepo(mt.Coll)))
			event := mt.GetStartedEvent()
			require.NotNil(mt, event)
			if test.update == nil {
				require.Equal(mt, "find", event.CommandName)
				requireDocumentEqual(mt.T, filter, event.Command.Lookup("filter").Document())
				return
			}

			require.Equal(mt, "update", event.CommandName)
			update := event.Command.Lookup("updates").Array().Index(0).Value().Document()
			requireDocumentEqual(mt.T, filter, update.Lookup("q").Document())
			requireDocumentEqual(mt.T, test.update, update.Lookup("u").Document())
			if test.arrayFilters != nil {
				arrayFilter := update.Lookup("arrayFilters").Array().Index(0).Value().Document()
				requireDocumentEqual(mt.T, test.arrayFilters[0].(bson.D), arrayFilter)
			}
		})
	}
}

func TestGroupRepositoryRejectsOperatorInput(t *testing.T) {
	role := entities.RoleViewer
	tests := []struct {
		name   string
		invoke func(Repository) error
	}{
		{"list with unsafe project", func(repo Repository) error {
			_, err := repo.GetProjectGroupMembers("$ne")
			return err
		}},
		{"add with unsafe project", func(repo Repository) error {
			return repo.AddGroupMember("$ne", &entities.GroupMember{Group: "team", Role: role})
		}},
		{"add with unsafe group", func(repo Repository) error {
			return repo.AddGroupMember("project", &entities.GroupMember{Group: "$ne", Role: role})
		}},
		{"remove with unsafe project", func(repo Repository) error {
			return repo.RemoveGroupMember("$ne", "team")
		}},
		{"remove with unsafe group", func(repo Repository) error {
			return repo.RemoveGroupMember("project", "$ne")
		}},
		{"update with unsafe project", func(repo Repository) error {
			return repo.UpdateGroupMemberRole("$ne", "team", &role)
		}},
		{"update with unsafe group", func(repo Repository) error {
			return repo.UpdateGroupMemberRole("project", "$ne", &role)
		}},
	}

	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	for _, test := range tests {
		mt.Run(test.name, func(mt *mtest.T) {
			require.Error(mt, test.invoke(NewRepo(mt.Coll)))
			require.Nil(mt, mt.GetStartedEvent())
		})
	}
}

func requireDocumentEqual(t *testing.T, expected bson.D, actual bson.Raw) {
	t.Helper()
	encoded, err := bson.Marshal(expected)
	require.NoError(t, err)
	require.Equal(t, bson.Raw(encoded), actual)
}
