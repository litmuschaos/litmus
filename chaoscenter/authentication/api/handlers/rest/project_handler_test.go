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
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/validations"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestProjectNameLookupsUseLiteralEquality(t *testing.T) {
	const userID = `user.'{"ne":null}`
	const projectID = `project.'{"ne":null}`
	const projectName = `Project's {"$ne": null}`

	tests := []struct {
		name    string
		handler func(services.ApplicationService) gin.HandlerFunc
		filter  primitive.D
	}{
		{
			name:    "create project",
			handler: rest.CreateProject,
			filter: primitive.D{
				{Key: "name", Value: primitive.D{{Key: "$eq", Value: projectName}}},
			},
		},
		{
			name:    "rename project",
			handler: rest.UpdateProjectName,
			filter: primitive.D{
				{Key: "name", Value: primitive.D{{Key: "$eq", Value: projectName}}},
				{Key: "members.user_id", Value: primitive.D{{Key: "$eq", Value: userID}}},
				{Key: "members.role", Value: primitive.D{{Key: "$eq", Value: entities.RoleOwner}}},
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			service := new(mocks.MockedApplicationService)
			service.On("GetUser", userID).Return(&entities.User{ID: userID}, nil).Twice()
			if test.name == "rename project" {
				filter := memberRbacFilter(projectID, userID,
					validations.MutationRbacRules["updateProjectName"], string(entities.AcceptedInvitation))
				service.On("GetProjects", filter).Return([]*entities.Project{{ID: projectID}}, nil).Once()
			}
			service.On("GetProjects", test.filter).Return([]*entities.Project{{Name: projectName}}, nil).Once()

			w := httptest.NewRecorder()
			ctx := GetTestGinContext(w)
			ctx.Set("uid", userID)
			setRequestBody(ctx, entities.ProjectInput{ProjectID: projectID, ProjectName: projectName})

			test.handler(service)(ctx)

			assert.Equal(t, http.StatusBadRequest, w.Code)
			assert.Contains(t, w.Body.String(), "already exists")
			service.AssertExpectations(t)
		})
	}
}

func TestProjectHandlersRejectQueryObjects(t *testing.T) {
	tests := []struct {
		name    string
		handler func(services.ApplicationService) gin.HandlerFunc
		fields  []string
	}{
		{"create project", rest.CreateProject, []string{"projectName"}},
		{"rename project", rest.UpdateProjectName, []string{"projectName", "projectID"}},
		{"add group", rest.AddGroupToProject, []string{"projectID", "group"}},
		{"remove group", rest.RemoveGroupFromProject, []string{"projectID", "group"}},
		{"update group role", rest.UpdateGroupRole, []string{"projectID", "group"}},
	}
	invalidValues := []struct {
		name  string
		value interface{}
	}{
		{"operator object", map[string]interface{}{"$ne": nil}},
		{"array", []string{"team"}},
	}

	for _, test := range tests {
		for _, field := range test.fields {
			for _, invalid := range invalidValues {
				t.Run(test.name+"/"+field+"/"+invalid.name, func(t *testing.T) {
					service := new(mocks.MockedApplicationService)
					w := httptest.NewRecorder()
					ctx := GetTestGinContext(w)
					ctx.Set("uid", "user")
					body := map[string]interface{}{
						"projectName": "project",
						"projectID":   "project-id",
						"group":       "team",
						"role":        "Viewer",
					}
					body[field] = invalid.value
					setRequestBody(ctx, body)

					test.handler(service)(ctx)

					assert.Equal(t, http.StatusBadRequest, w.Code)
					assert.Empty(t, service.Calls)
				})
			}
		}
	}
}

func TestGetUserWithProject(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Failed to retrieve user with projects", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		username := "testUser"
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Params = gin.Params{
			{"username", username},
		}
		c.Set("username", username)
		c.Set("role", string(entities.RoleUser))

		user := &entities.User{
			ID:       "testUID",
			Username: "testUser",
			Email:    "test@example.com",
		}
		response := &entities.ListProjectResponse{}

		request := &entities.ListProjectRequest{
			UserID: "testUID",
		}

		service.On("FindUserByUsername", "testUser").Return(user, errors.New("failed"))
		service.On("GetProjectsByUserID", request).Return(response, errors.New("failed"))

		rest.GetUserWithProject(service)(c)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("Successfully retrieve user with projects", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		username := "testUser1"
		f := httptest.NewRecorder()
		c := GetTestGinContext(f)
		c.Params = gin.Params{
			{"username", username},
		}
		c.Set("username", username)
		c.Set("role", string(entities.RoleUser))

		user := &entities.User{
			ID:       "testUID",
			Username: "testUser1",
			Email:    "test@example.com",
		}

		response := &entities.ListProjectResponse{}

		fieldName := entities.ProjectSortingFieldTime

		request := &entities.ListProjectRequest{
			UserID: "testUID",
			Pagination: &entities.Pagination{
				Page:  0,
				Limit: 15,
			},
			Sort: &entities.SortInput{
				Field:     &fieldName,
				Ascending: nil,
			},
			Filter: &entities.ListProjectInputFilter{
				CreatedByMe:     nil,
				InvitedByOthers: nil,
				ProjectName:     nil,
			},
		}

		service.On("FindUserByUsername", "testUser1").Return(user, nil)
		service.On("GetProjectsByUserID", request).Return(response, nil)

		rest.GetUserWithProject(service)(c)

		assert.Equal(t, http.StatusOK, f.Code)
	})

	t.Run("Successfully retrieve user with projects if logged user has admin role", func(t *testing.T) {
		service := new(mocks.MockedApplicationService)
		username := "testUser"
		w := httptest.NewRecorder()
		c := GetTestGinContext(w)
		c.Params = gin.Params{
			{"username", username},
		}
		c.Set("username", "adminusername")
		c.Set("role", string(entities.RoleAdmin))

		user := &entities.User{
			ID:       "testUID",
			Username: "testUser",
			Email:    "test@example.com",
			Role:     entities.RoleAdmin,
		}
		response := &entities.ListProjectResponse{}

		fieldName := entities.ProjectSortingFieldTime

		request := &entities.ListProjectRequest{
			UserID: "testUID",
			Pagination: &entities.Pagination{
				Page:  0,
				Limit: 15,
			},
			Sort: &entities.SortInput{
				Field:     &fieldName,
				Ascending: nil,
			},
			Filter: &entities.ListProjectInputFilter{
				CreatedByMe:     nil,
				InvitedByOthers: nil,
				ProjectName:     nil,
			},
		}

		service.On("FindUserByUsername", "testUser").Return(user, nil)
		service.On("GetProjectsByUserID", request).Return(response, nil)

		rest.GetUserWithProject(service)(c)

		assert.Equal(t, http.StatusOK, w.Code)
	})
}

func TestGetProjectsByUserID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Failed with invalid data", func(t *testing.T) {

		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		ctx.Set("uid", "testUserID")

		response := &entities.ListProjectResponse{}

		fieldName := entities.ProjectSortingFieldTime

		request := &entities.ListProjectRequest{
			UserID: "testUserID",
			Pagination: &entities.Pagination{
				Page:  0,
				Limit: 15,
			},
			Sort: &entities.SortInput{
				Field:     &fieldName,
				Ascending: nil,
			},
			Filter: &entities.ListProjectInputFilter{
				CreatedByMe:     nil,
				InvitedByOthers: nil,
				ProjectName:     nil,
			},
		}

		service := new(mocks.MockedApplicationService)
		service.On("GetProjectsByUserID", request).Return(response, errors.New("Failed"))
		rest.GetProjectsByUserID(service)(ctx)
		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrServerError], w.Code)
	})

	t.Run("Successful retrieve of project", func(t *testing.T) {

		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		ctx.Set("uid", "testUserID")
		projects := []*entities.Project{
			{
				ID:   "testProjectID",
				Name: "Test Project",
			},
		}

		response := &entities.ListProjectResponse{
			Projects: projects,
		}

		fieldName := entities.ProjectSortingFieldTime

		request := &entities.ListProjectRequest{
			UserID: "testUserID",
			Pagination: &entities.Pagination{
				Page:  0,
				Limit: 15,
			},
			Sort: &entities.SortInput{
				Field:     &fieldName,
				Ascending: nil,
			},
			Filter: &entities.ListProjectInputFilter{
				CreatedByMe:     nil,
				InvitedByOthers: nil,
				ProjectName:     nil,
			},
		}

		service := new(mocks.MockedApplicationService)
		service.On("GetProjectsByUserID", request).Return(response, nil)
		rest.GetProjectsByUserID(service)(ctx)
		assert.Equal(t, http.StatusOK, w.Code)
	})

}

func TestGetProject(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Run("unauthorized request to Project", func(t *testing.T) {
		projectID := "testProjectID"
		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		ctx.Set("uid", projectID)
		ctx.Set("role", string(entities.RoleUser))
		service := new(mocks.MockedApplicationService)
		project := &entities.Project{
			ID:   "testProjectID",
			Name: "Test Project",
		}
		user := &entities.User{
			ID:   "testProjectID",
			Name: "Test Project",
		}

		service.On("GetProjectByProjectID", projectID).Return(project, errors.New("Failed"))
		service.On("GetUser", projectID).Return(user, errors.New("Failed"))
		rest.GetProject(service)(ctx)

		assert.Equal(t, utils.ErrorStatusCodes[utils.ErrUnauthorized], w.Code)
	})

	t.Run("Successful to find Project", func(t *testing.T) {
		projectID := "testUserID"
		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		ctx.Set("uid", projectID)
		ctx.Set("role", string(entities.RoleAdmin))
		service := new(mocks.MockedApplicationService)
		project := &entities.Project{
			ID:   "testProjectID",
			Name: "Test Project",
		}
		user := &entities.User{
			ID:   "testUserID",
			Name: "Test User",
		}
		projects := []*entities.Project{
			{
				ID:   "testProjectID",
				Name: "Test Project",
			},
		}
		expectedFilter := primitive.D{
			primitive.E{
				Key:   "_id",
				Value: primitive.D{{Key: "$eq", Value: ""}},
			},
			primitive.E{
				Key: "members",
				Value: primitive.D{
					primitive.E{
						Key: "$elemMatch",
						Value: primitive.D{
							primitive.E{
								Key:   "user_id",
								Value: primitive.D{{Key: "$eq", Value: "testUserID"}},
							},
							primitive.E{
								Key: "role",
								Value: primitive.D{
									primitive.E{
										Key:   "$in",
										Value: []string{"Owner", "Viewer", "Executor", "Editor"},
									},
								},
							},
							primitive.E{
								Key:   "invitation",
								Value: primitive.D{{Key: "$eq", Value: "Accepted"}},
							},
						},
					},
				},
			},
		}

		service.On("GetProjectByProjectID", "").Return(project, nil)
		service.On("GetUser", projectID).Return(user, nil)
		service.On("GetProjects", expectedFilter).Return(projects, nil)
		rest.GetProject(service)(ctx)

		assert.Equal(t, 200, w.Code)
	})

}

func memberRbacFilter(projectID, uid string, roles []string, invitation string) primitive.D {
	return primitive.D{
		primitive.E{Key: "_id", Value: primitive.D{{Key: "$eq", Value: projectID}}},
		primitive.E{Key: "members", Value: primitive.D{
			primitive.E{Key: "$elemMatch", Value: primitive.D{
				primitive.E{Key: "user_id", Value: primitive.D{{Key: "$eq", Value: uid}}},
				primitive.E{Key: "role", Value: primitive.D{
					primitive.E{Key: "$in", Value: roles},
				}},
				primitive.E{Key: "invitation", Value: primitive.D{{Key: "$eq", Value: invitation}}},
			}},
		}},
	}
}

func TestInvitationHandlersActOnTheCaller(t *testing.T) {
	gin.SetMode(gin.TestMode)

	const (
		projectID = "testProjectID"
		callerUID = "callerUID"
		victimUID = "ownerUID"
	)

	tests := []struct {
		name               string
		handler            func(services.ApplicationService) gin.HandlerFunc
		roles              []string
		invitation         string
		expectedInvitation entities.Invitation
	}{
		{
			name:               "accept_invitation",
			handler:            rest.AcceptInvitation,
			roles:              []string{"Owner", "Viewer", "Executor", "Editor"},
			invitation:         string(entities.PendingInvitation),
			expectedInvitation: entities.AcceptedInvitation,
		},
		{
			name:               "decline_invitation",
			handler:            rest.DeclineInvitation,
			roles:              []string{"Owner", "Viewer", "Executor", "Editor"},
			invitation:         string(entities.PendingInvitation),
			expectedInvitation: entities.DeclinedInvitation,
		},
		{
			name:               "leave_project",
			handler:            rest.LeaveProject,
			roles:              []string{"Owner", "Viewer", "Executor", "Editor"},
			invitation:         string(entities.AcceptedInvitation),
			expectedInvitation: entities.ExitedProject,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			service := new(mocks.MockedApplicationService)
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request, _ = http.NewRequest(http.MethodPost, "/",
				strings.NewReader(`{"projectID":"`+projectID+`","userID":"`+victimUID+`"}`))
			c.Request.Header.Set("Content-Type", "application/json")
			c.Set("uid", callerUID)

			service.On("GetUser", callerUID).Return(&entities.User{ID: callerUID}, nil)
			service.On("GetProjects", memberRbacFilter(projectID, callerUID, tt.roles, tt.invitation)).
				Return([]*entities.Project{{ID: projectID}}, nil)
			service.On("UpdateInvite", mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil)

			tt.handler(service)(c)

			assert.Equal(t, http.StatusOK, w.Code)
			service.AssertCalled(t, "UpdateInvite", projectID, callerUID, tt.expectedInvitation,
				(*entities.MemberRole)(nil))
			service.AssertNotCalled(t, "UpdateInvite", projectID, victimUID, tt.expectedInvitation,
				(*entities.MemberRole)(nil))
		})
	}
}

func TestGetProjectStats(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("non admin caller is denied without reading project stats", func(t *testing.T) {
		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		ctx.Set("role", string(entities.RoleUser))

		service := new(mocks.MockedApplicationService)
		service.On("GetProjectStats").Return([]*entities.ProjectStats{
			{Name: "other-tenant-project", ProjectID: "other-tenant-project-id"},
		}, nil)

		rest.GetProjectStats(service)(ctx)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		assert.NotContains(t, w.Body.String(), "other-tenant-project")
		service.AssertNotCalled(t, "GetProjectStats")
	})

	t.Run("admin caller receives project stats", func(t *testing.T) {
		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		ctx.Set("role", string(entities.RoleAdmin))

		service := new(mocks.MockedApplicationService)
		service.On("GetProjectStats").Return([]*entities.ProjectStats{
			{Name: "test-project", ProjectID: "test-project-id"},
		}, nil)

		rest.GetProjectStats(service)(ctx)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "test-project")
		service.AssertExpectations(t)
	})
}
