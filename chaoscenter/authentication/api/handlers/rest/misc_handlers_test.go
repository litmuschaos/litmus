package rest_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/assert"
)

func TestStatus(t *testing.T) {
	mockService := new(mocks.MockedApplicationService)
	users := []entities.User{}
	mockService.On("GetUsers").Return(&users, nil)

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	rest.Status(mockService)(ctx)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestReadiness(t *testing.T) {
	mockService := new(mocks.MockedApplicationService)

	mockService.On("ListDataBase").Return([]string{"auth", "otherDB"}, nil)
	mockService.On("ListCollection").Return([]string{"project", "users", "otherCollection"}, nil)

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	rest.Readiness(mockService)(ctx)
	assert.Equal(t, http.StatusOK, w.Code)
}
