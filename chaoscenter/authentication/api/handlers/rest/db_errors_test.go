package rest_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/authConfig"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

var errDB = errors.New("db unavailable")

// runHandler serves a request authenticated as testUser and returns the recorded response.
func runHandler(handler gin.HandlerFunc, target, body string) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, target, strings.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("uid", "testUserID")
	c.Set("username", "testUser")
	c.Set("role", string(entities.RoleUser))
	handler(c)
	return w
}

func assertServerError(t *testing.T, w *httptest.ResponseRecorder) {
	t.Helper()
	assert.Equal(t, utils.ErrorStatusCodes[utils.ErrServerError], w.Code)
	assert.Contains(t, w.Body.String(), utils.ErrServerError.Error())
}

func TestGetProjectsByUserID_ReportsLookupFailure(t *testing.T) {
	service := new(mocks.MockedApplicationService)
	service.On("GetProjectsByUserID", mock.Anything).Return((*entities.ListProjectResponse)(nil), errDB)

	assertServerError(t, runHandler(rest.GetProjectsByUserID(service), "/list_projects", ""))
}

func TestCreateProject_ReportsDuplicateNameLookupFailure(t *testing.T) {
	service := new(mocks.MockedApplicationService)
	service.On("GetUser", "testUserID").Return(&entities.User{ID: "testUserID"}, nil)
	service.On("GetProjects", mock.Anything).Return(([]*entities.Project)(nil), errDB)

	assertServerError(t, runHandler(rest.CreateProject(service), "/create_project", `{"projectName":"demo"}`))
	service.AssertNotCalled(t, "CreateProject", mock.Anything)
}

func TestUpdateProjectName_ReportsDuplicateNameLookupFailure(t *testing.T) {
	service := new(mocks.MockedApplicationService)
	service.On("GetUser", "testUserID").Return(&entities.User{ID: "testUserID"}, nil)
	// The first lookup is the RBAC check, the second one looks for a duplicate name.
	service.On("GetProjects", mock.Anything).Return([]*entities.Project{{ID: "testProjectID"}}, nil).Once()
	service.On("GetProjects", mock.Anything).Return(([]*entities.Project)(nil), errDB).Once()

	assertServerError(t, runHandler(rest.UpdateProjectName(service), "/update_project_name", `{"projectID":"testProjectID","projectName":"demo"}`))
	service.AssertNotCalled(t, "UpdateProjectName", mock.Anything, mock.Anything)
}

func TestInviteUsers_ReportsMemberLookupFailure(t *testing.T) {
	service := new(mocks.MockedApplicationService)
	service.On("GetUser", "testUserID").Return(&entities.User{ID: "testUserID"}, nil)
	service.On("GetProjects", mock.Anything).Return([]*entities.Project{{ID: "testProjectID"}}, nil)
	service.On("GetProjectMembers", "testProjectID", "all").Return(([]*entities.Member)(nil), errDB)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/invite_users/testProjectID", nil)
	c.Params = gin.Params{{Key: "project_id", Value: "testProjectID"}}
	c.Set("uid", "testUserID")
	rest.InviteUsers(service)(c)

	assertServerError(t, w)
	service.AssertNotCalled(t, "InviteUsers", mock.Anything)
}

func TestLoginUser_ReportsDefaultProjectFailures(t *testing.T) {
	user := &entities.User{ID: "testUserID", Username: "testUser", Password: "hashedPassword"}

	newService := func() *mocks.MockedApplicationService {
		service := new(mocks.MockedApplicationService)
		service.On("FindUserByUsername", "testUser").Return(user, nil)
		service.On("CheckPasswordHash", "hashedPassword", "testPassword").Return(nil)
		service.On("GetConfig", "salt").Return(&authConfig.AuthConfig{}, nil)
		service.On("GetSignedJWT", user, mock.Anything).Return("someJWTToken", nil)
		return service
	}
	const body = `{"username":"testUser","password":"testPassword"}`

	t.Run("owner project lookup fails without creating another project", func(t *testing.T) {
		service := newService()
		service.On("GetOwnerProjectIDs", mock.Anything, "testUserID").Return(([]*entities.Project)(nil), errDB)

		assertServerError(t, runHandler(rest.LoginUser(service), "/login", body))
		service.AssertNotCalled(t, "CreateProject", mock.Anything)
	})

	t.Run("default project creation fails", func(t *testing.T) {
		service := newService()
		service.On("GetOwnerProjectIDs", mock.Anything, "testUserID").Return([]*entities.Project{}, nil)
		service.On("CreateProject", mock.Anything).Return(errDB)

		assertServerError(t, runHandler(rest.LoginUser(service), "/login", body))
	})
}

func TestUpdatePassword_ReportsDefaultProjectFailures(t *testing.T) {
	newService := func() *mocks.MockedApplicationService {
		service := new(mocks.MockedApplicationService)
		service.On("FindUserByUsername", "testUser").Return(&entities.User{ID: "testUserID", Username: "testUser"}, nil)
		service.On("UpdatePassword", mock.Anything, true).Return(nil)
		return service
	}
	const body = `{"oldPassword":"oldPass@123","newPassword":"newPass@123"}`

	t.Run("owner project lookup fails without creating another project", func(t *testing.T) {
		service := newService()
		service.On("GetOwnerProjectIDs", mock.Anything, "testUserID").Return(([]*entities.Project)(nil), errDB)

		assertServerError(t, runHandler(rest.UpdatePassword(service), "/update/password", body))
		service.AssertNotCalled(t, "CreateProject", mock.Anything)
	})

	t.Run("default project creation fails", func(t *testing.T) {
		service := newService()
		service.On("GetOwnerProjectIDs", mock.Anything, "testUserID").Return([]*entities.Project{}, nil)
		service.On("CreateProject", mock.Anything).Return(errDB)

		assertServerError(t, runHandler(rest.UpdatePassword(service), "/update/password", body))
	})
}
