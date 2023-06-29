// Package rest_handlers_test contains tests for rest_handlers package.
package rest_handlers_test

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// GetTestGinContext returns a gin context for testing
func GetTestGinContext(w *httptest.ResponseRecorder) *gin.Context {
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = &http.Request{
		Header: make(http.Header),
		URL:    &url.URL{},
	}

	return ctx
}

// TestStatusHandler tests the StatusHandler function
func TestStatusHandler(t *testing.T) {
	// given
	var status rest_handlers.APIStatus

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)

	// when
	rest_handlers.StatusHandler(ctx)

	// then
	err := json.Unmarshal(w.Body.Bytes(), &status)
	assert.NoError(t, err)
	assert.Equal(t, "up", status.Status)
	assert.EqualValues(t, http.StatusOK, w.Code)
}
