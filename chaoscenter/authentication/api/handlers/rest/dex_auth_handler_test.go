package rest_test

import (
	"net/http/httptest"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/stretchr/testify/assert"
)

func TestOAuthLogin(t *testing.T) {
	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)

	rest.OAuthLogin()(ctx)

	assert.Equal(t, 500, w.Code)
}
