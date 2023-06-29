package rest_handlers_test

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/stretchr/testify/assert"
)

func TestPlaygroundHandler(t *testing.T) {
	// given
	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	// when
	rest_handlers.PlaygroundHandler()(ctx)
	// then
	assert.Equal(t, 200, w.Code)
	assert.NotEqual(t, -1, strings.Index(w.Body.String(), "GraphQL playground"))
}
