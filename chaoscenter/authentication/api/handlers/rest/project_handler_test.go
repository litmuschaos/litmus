package rest_test

import (
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
		project := &entities.Project{}

		service.On("FindUserByUsername", "testUser").Return(user, errors.New("failed"))
		service.On("GetProjectsByUserID", "testUID", false).Return([]*entities.Project{project}, errors.New("failed"))

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
		project := &entities.Project{}

		service.On("FindUserByUsername", "testUser1").Return(user, nil)
		service.On("GetProjectsByUserID", "testUID", false).Return([]*entities.Project{project}, nil)

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
		project := &entities.Project{}

		service.On("FindUserByUsername", "testUser").Return(user, nil)
		service.On("GetProjectsByUserID", "testUID", false).Return([]*entities.Project{project}, nil)

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
		projects := []*entities.Project{
			{
				ID:   "testProjectID",
				Name: "Test Project",
			},
		}
		service := new(mocks.MockedApplicationService)
		service.On("GetProjectsByUserID", "testUserID", false).Return(projects, errors.New("Failed"))
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
		service := new(mocks.MockedApplicationService)
		service.On("GetProjectsByUserID", "testUserID", false).Return(projects, nil)
		rest.GetProjectsByUserID(service)(ctx)
		assert.Equal(t, http.StatusOK, w.Code)
	})

}

func TestGetProject(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Run("unauthorized request to Project", func(t *testing.T) {
		projectID := "testUserID"
		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		ctx.Set("uid", projectID)
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
										Value: []string{"Owner", "Viewer", "Editor"},
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
