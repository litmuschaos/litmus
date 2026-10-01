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
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

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
				Value: "",
			},
			primitive.E{
				Key: "members",
				Value: primitive.D{
					primitive.E{
						Key: "$elemMatch",
						Value: primitive.D{
							primitive.E{
								Key:   "user_id",
								Value: "testUserID",
							},
							primitive.E{
								Key: "role",
								Value: primitive.D{
									primitive.E{
										Key:   "$in",
										Value: []string{"Owner", "Viewer", "Executor"},
									},
								},
							},
							primitive.E{
								Key:   "invitation",
								Value: "Accepted",
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
		primitive.E{Key: "_id", Value: projectID},
		primitive.E{Key: "members", Value: primitive.D{
			primitive.E{Key: "$elemMatch", Value: primitive.D{
				primitive.E{Key: "user_id", Value: uid},
				primitive.E{Key: "role", Value: primitive.D{
					primitive.E{Key: "$in", Value: roles},
				}},
				primitive.E{Key: "invitation", Value: invitation},
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
			roles:              []string{"Owner", "Viewer", "Executor"},
			invitation:         string(entities.PendingInvitation),
			expectedInvitation: entities.AcceptedInvitation,
		},
		{
			name:               "decline_invitation",
			handler:            rest.DeclineInvitation,
			roles:              []string{"Owner", "Viewer", "Executor"},
			invitation:         string(entities.PendingInvitation),
			expectedInvitation: entities.DeclinedInvitation,
		},
		{
			name:               "leave_project",
			handler:            rest.LeaveProject,
			roles:              []string{"Owner", "Viewer", "Executor"},
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
