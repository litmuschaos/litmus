package rest_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson"
)

// helper to set JSON body on a gin test context
func setRequestBody(c *gin.Context, body interface{}) {
	jsonBytes, _ := json.Marshal(body)
	c.Request.Body = http.NoBody
	c.Request.Body = nopCloser(bytes.NewBuffer(jsonBytes))
	c.Request.Header.Set("Content-Type", "application/json")
}

type nopCloserReader struct {
	*bytes.Buffer
}

func (nopCloserReader) Close() error { return nil }

func nopCloser(b *bytes.Buffer) nopCloserReader {
	return nopCloserReader{b}
}

// mockRbacSuccess sets up mocks so that RbacValidator succeeds (user found + project matched)
func mockRbacSuccess(service *mocks.MockedApplicationService, uid string) {
	service.On("GetUser", uid).Return(&entities.User{
		ID:       uid,
		Username: "testuser",
	}, nil)
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{
		{ID: "test-project-id"},
	}, nil)
}

// mockRbacDenied sets up mocks so that RbacValidator denies (user found but no project match)
func mockRbacDenied(service *mocks.MockedApplicationService, uid string) {
	service.On("GetUser", uid).Return(&entities.User{
		ID:       uid,
		Username: "testuser",
	}, nil)
	service.On("GetProjects", mock.AnythingOfType("primitive.D")).Return([]*entities.Project{}, nil)
}

func TestAddGroupToProject(t *testing.T) {
	gin.SetMode(gin.TestMode)

	executorRole := entities.RoleExecutor
	ownerRole := entities.RoleOwner

	t.Run("RBAC denied - non-owner cannot add group", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "user1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{
			ProjectID: "proj1",
			Group:     "dev-team",
			Role:      &executorRole,
		}
		setRequestBody(c, input)

		mockRbacDenied(service, "user1")

		rest.AddGroupToProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrUnauthorized], w.Code)
	})

	t.Run("Invalid role - rejected", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{
			ProjectID: "proj1",
			Group:     "dev-team",
			Role:      nil,
		}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")

		rest.AddGroupToProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrInvalidRole], w.Code)
	})

	t.Run("Empty group name - rejected", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{
			ProjectID: "proj1",
			Group:     "",
			Role:      &executorRole,
		}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")

		rest.AddGroupToProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrInvalidRequest], w.Code)
	})

	t.Run("Duplicate group - rejected", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{
			ProjectID: "proj1",
			Group:     "dev-team",
			Role:      &executorRole,
		}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")
		service.On("GetProjectGroupMembers", "proj1").Return([]*entities.GroupMember{
			{Group: "dev-team", Role: entities.RoleViewer},
		}, nil)

		rest.AddGroupToProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrInvalidRequest], w.Code)
	})

	t.Run("Service error on GetProjectGroupMembers", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{
			ProjectID: "proj1",
			Group:     "dev-team",
			Role:      &executorRole,
		}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")
		service.On("GetProjectGroupMembers", "proj1").Return([]*entities.GroupMember(nil), errors.New("db error"))

		rest.AddGroupToProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrServerError], w.Code)
	})

	t.Run("Service error on AddGroupMember", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{
			ProjectID: "proj1",
			Group:     "dev-team",
			Role:      &executorRole,
		}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")
		service.On("GetProjectGroupMembers", "proj1").Return([]*entities.GroupMember{}, nil)
		service.On("AddGroupMember", "proj1", mock.AnythingOfType("*entities.GroupMember")).Return(errors.New("db error"))

		rest.AddGroupToProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrServerError], w.Code)
	})

	t.Run("Success - group added", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{
			ProjectID:   "proj1",
			Group:       "dev-team",
			DisplayName: "Development Team",
			Role:        &ownerRole,
		}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")
		service.On("GetProjectGroupMembers", "proj1").Return([]*entities.GroupMember{}, nil)
		service.On("AddGroupMember", "proj1", mock.AnythingOfType("*entities.GroupMember")).Return(nil)

		rest.AddGroupToProject(service)(c)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		data := resp["data"].(map[string]interface{})
		assert.Equal(t, "dev-team", data["group"])
		assert.Equal(t, "Development Team", data["displayName"])
		assert.Equal(t, "Owner", data["role"])
	})
}

func TestRemoveGroupFromProject(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("RBAC denied", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "user1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: "dev-team"}
		setRequestBody(c, input)
		mockRbacDenied(service, "user1")

		rest.RemoveGroupFromProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrUnauthorized], w.Code)
	})

	t.Run("Empty group name", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: ""}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")

		rest.RemoveGroupFromProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrInvalidRequest], w.Code)
	})

	t.Run("Service error", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: "dev-team"}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")
		service.On("RemoveGroupMember", "proj1", "dev-team").Return(errors.New("db error"))

		rest.RemoveGroupFromProject(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrServerError], w.Code)
	})

	t.Run("Success", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: "dev-team"}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")
		service.On("RemoveGroupMember", "proj1", "dev-team").Return(nil)

		rest.RemoveGroupFromProject(service)(c)
		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestUpdateGroupRole(t *testing.T) {
	gin.SetMode(gin.TestMode)

	executorRole := entities.RoleExecutor

	t.Run("RBAC denied", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "user1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: "dev-team", Role: &executorRole}
		setRequestBody(c, input)
		mockRbacDenied(service, "user1")

		rest.UpdateGroupRole(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrUnauthorized], w.Code)
	})

	t.Run("Invalid role - nil", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: "dev-team", Role: nil}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")

		rest.UpdateGroupRole(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrInvalidRole], w.Code)
	})

	t.Run("Empty group name", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: "", Role: &executorRole}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")

		rest.UpdateGroupRole(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrInvalidRequest], w.Code)
	})

	t.Run("Service error", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: "dev-team", Role: &executorRole}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")
		service.On("UpdateGroupMemberRole", "proj1", "dev-team", &executorRole).Return(errors.New("db error"))

		rest.UpdateGroupRole(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrServerError], w.Code)
	})

	t.Run("Success", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))

		input := entities.GroupMemberInput{ProjectID: "proj1", Group: "dev-team", Role: &executorRole}
		setRequestBody(c, input)
		mockRbacSuccess(service, "owner1")
		service.On("UpdateGroupMemberRole", "proj1", "dev-team", &executorRole).Return(nil)

		rest.UpdateGroupRole(service)(c)
		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestGetProjectGroups(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Non-member non-admin denied", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "user1")
		c.Set("role", string(entities.RoleUser))
		c.Params = gin.Params{{"project_id", "proj1"}}

		mockRbacDenied(service, "user1")

		rest.GetProjectGroups(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrUnauthorized], w.Code)
	})

	t.Run("Admin bypasses RBAC", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "admin1")
		c.Set("role", string(entities.RoleAdmin))
		c.Params = gin.Params{{"project_id", "proj1"}}

		service.On("GetProjectGroupMembers", "proj1").Return([]*entities.GroupMember{
			{Group: "dev-team", Role: entities.RoleExecutor},
		}, nil)

		rest.GetProjectGroups(service)(c)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Service error", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))
		c.Params = gin.Params{{"project_id", "proj1"}}

		mockRbacSuccess(service, "owner1")
		service.On("GetProjectGroupMembers", "proj1").Return([]*entities.GroupMember(nil), errors.New("db error"))

		rest.GetProjectGroups(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrServerError], w.Code)
	})

	t.Run("Success - returns groups list", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "owner1")
		c.Set("role", string(entities.RoleUser))
		c.Params = gin.Params{{"project_id", "proj1"}}

		groups := []*entities.GroupMember{
			{Group: "dev-team", DisplayName: "Developers", Role: entities.RoleExecutor, AssignedAt: 1000},
			{Group: "qa-team", Role: entities.RoleViewer, AssignedAt: 2000},
		}
		mockRbacSuccess(service, "owner1")
		service.On("GetProjectGroupMembers", "proj1").Return(groups, nil)

		rest.GetProjectGroups(service)(c)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		data := resp["data"].([]interface{})
		assert.Len(t, data, 2)
	})
}

func TestGetUserGroups(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Service error on GetUser", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "user1")

		service.On("GetUser", "user1").Return(&entities.User{}, errors.New("db error"))

		rest.GetUserGroups(service)(c)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrServerError], w.Code)
	})

	t.Run("Success - user has groups", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "user1")

		service.On("GetUser", "user1").Return(&entities.User{
			ID:         "user1",
			OIDCGroups: []string{"group-a", "group-b"},
		}, nil)

		rest.GetUserGroups(service)(c)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		groups := resp["groups"].([]interface{})
		assert.Len(t, groups, 2)
		assert.Equal(t, "group-a", groups[0])
	})

	t.Run("Success - user has nil groups returns empty array", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Set("uid", "user1")

		service.On("GetUser", "user1").Return(&entities.User{
			ID:         "user1",
			OIDCGroups: nil,
		}, nil)

		rest.GetUserGroups(service)(c)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		groups := resp["groups"].([]interface{})
		assert.Len(t, groups, 0)
	})
}

// Ensure unused import is referenced
var _ = bson.D{}
