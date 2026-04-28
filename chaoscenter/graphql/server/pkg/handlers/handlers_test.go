package handlers_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/handlers"
)

// GetTestGinContext creates a gin context with a proper HTTP request context
func GetTestGinContext(w *httptest.ResponseRecorder) *gin.Context {
	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/", nil)
	return ctx
}

func TestReadinessHandler_DatabaseDown(t *testing.T) {
	mockOp := new(mocks.MongoOperator)
	mockOp.On("ListDataBase", mock.Anything, mock.Anything).
		Return([]string{}, errors.New("connection refused"))

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)

	handlers.ReadinessHandler(mockOp)(ctx)

	assert.Equal(t, http.StatusServiceUnavailable, w.Code)
	assert.Contains(t, w.Body.String(), `"database":"down"`)
	mockOp.AssertExpectations(t)
}

func TestReadinessHandler_DatabaseUpWithLitmus(t *testing.T) {
	mockOp := new(mocks.MongoOperator)
	mockOp.On("ListDataBase", mock.Anything, mock.Anything).
		Return([]string{"admin", "litmus", "config"}, nil)

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)

	handlers.ReadinessHandler(mockOp)(ctx)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"database":"up"`)
	mockOp.AssertExpectations(t)
}

func TestReadinessHandler_DatabaseUpWithoutLitmus(t *testing.T) {
	mockOp := new(mocks.MongoOperator)
	mockOp.On("ListDataBase", mock.Anything, mock.Anything).
		Return([]string{"admin", "config"}, nil)

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)

	handlers.ReadinessHandler(mockOp)(ctx)

	assert.Equal(t, http.StatusServiceUnavailable, w.Code)
	assert.Contains(t, w.Body.String(), `"database":"down"`)
	mockOp.AssertExpectations(t)
}
