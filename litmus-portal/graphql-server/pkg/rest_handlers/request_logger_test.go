package rest_handlers_test

import (
	"net/http/httptest"
	"testing"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/stretchr/testify/assert"
)

func TestLoggingMiddleware(t *testing.T) {
	// given
	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	// when
	rest_handlers.LoggingMiddleware()(ctx)
	// then
	assert.Equal(t, 200, w.Code)
}
