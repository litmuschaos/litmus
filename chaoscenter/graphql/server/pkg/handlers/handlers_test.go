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

func TestFileHandlerInvalidTokenReturnsAfterError(t *testing.T) {
	mockOp := new(mocks.MongoOperator)

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	ctx.Params = []gin.Param{{Key: "key", Value: "not-a-jwt.yaml"}}
	ctx.Request.Header.Set("Referer", "http://localhost:3000/")

	handlers.FileHandler(mockOp)(ctx)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Contains(t, w.Body.String(), "token contains an invalid number of segments")
	assert.NotContains(t, w.Body.String(), "mongo: no documents in result")
	assert.NotContains(t, w.Body.String(), "unable to parse referer header")
	mockOp.AssertNotCalled(t, "Get", mock.Anything, mock.Anything, mock.Anything)
	mockOp.AssertExpectations(t)
}
