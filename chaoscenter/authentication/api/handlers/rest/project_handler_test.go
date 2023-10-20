package rest_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/assert"
)

func TestGetUserWithProject(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := new(mocks.MockedApplicationService)

	tests := []struct {
		name         string
		username     string
		given        func()
		expectedCode int
	}{
		{
			name:     "Successfully retrieve user with projects",
			username: "testUser",
			given: func() {
				user := &entities.User{
					ID:       "testUID",
					Username: "testUser",
					Email:    "test@example.com",
				}
				project := &entities.Project{}

				service.On("FindUserByUsername", "testUser").Return(user, nil)
				service.On("GetProjectsByUserID", "testUID", false).Return([]*entities.Project{project}, nil)
			},
			expectedCode: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Params = gin.Params{
				{"username", tt.username},
			}
			c.Set("username", tt.username)

			tt.given()

			rest.GetUserWithProject(service)(c)

			assert.Equal(t, tt.expectedCode, w.Code)
		})
	}
}

func TestGetProjectsByUserID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := new(mocks.MockedApplicationService)

	tests := []struct {
		name         string
		uid          string
		given        func()
		expectedCode int
	}{
		{
			name: "Successfully retrieve projects by user ID",
			uid:  "testUserID",
			given: func() {
				projects := []*entities.Project{
					{
						ID:   "testProjectID",
						Name: "Test Project",
					},
				}
				service.On("GetProjectsByUserID", "testUserID", false).Return(projects, nil)
			},
			expectedCode: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			ctx := GetTestGinContext(w)
			ctx.Set("uid", "testUserID")
			tt.given()
			rest.GetProjectsByUserID(service)(ctx)
			assert.Equal(t, tt.expectedCode, w.Code)
		})
	}
}
