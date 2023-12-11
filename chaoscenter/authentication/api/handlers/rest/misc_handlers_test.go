package rest_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/assert"
)

func TestStatus(t *testing.T) {

	t.Run("Success with valid data", func(t *testing.T) {
		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		users := []entities.User{}
		mockService := new(mocks.MockedApplicationService)
		mockService.On("GetUsers").Return(&users, nil)
		rest.Status(mockService)(ctx)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Failed with invalid request", func(t *testing.T) {
		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		users := []entities.User{}
		mockService := new(mocks.MockedApplicationService)
		mockService.On("GetUsers").Return(&users, errors.New("Failed"))
		rest.Status(mockService)(ctx)
		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})

}

func TestReadiness(t *testing.T) {
	t.Run("Success with valid data", func(t *testing.T) {
		mockService := new(mocks.MockedApplicationService)

		mockService.On("ListDataBase").Return([]string{"auth", "otherDB"}, nil)
		mockService.On("ListCollection").Return([]string{"project", "users", "otherCollection"}, nil)

		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		rest.Readiness(mockService)(ctx)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Failed with invalid data", func(t *testing.T) {
		mockService := new(mocks.MockedApplicationService)

		mockService.On("ListDataBase").Return([]string{"auth", "otherDB"}, errors.New("Failed"))
		mockService.On("ListCollection").Return([]string{"project", "users", "otherCollection"}, errors.New("Failed"))

		w := httptest.NewRecorder()
		ctx := GetTestGinContext(w)
		rest.Readiness(mockService)(ctx)
		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})
}
