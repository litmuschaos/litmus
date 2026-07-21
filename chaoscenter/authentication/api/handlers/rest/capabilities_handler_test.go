package rest_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	response "github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestCapabilities(t *testing.T) {

	testcases := []struct {
		Name         string
		OAuthEnabled bool
	}{
		{
			Name:         "OAuth Enabled",
			OAuthEnabled: true,
		},
		{
			Name:         "OAuth Disabled",
			OAuthEnabled: false,
		},
	}

	for _, test := range testcases {
		test := test
		t.Run(test.Name, func(t *testing.T) {
			w := httptest.NewRecorder()
			ctx := GetTestGinContext(w)
			utils.OAuthEnabled = test.OAuthEnabled
			rest.GetCapabilities()(ctx)
			capa := response.CapabilitiesResponse{}
			err := json.Unmarshal(w.Body.Bytes(), &capa)
			assert.Nil(t, err)
			assert.Equal(t, test.OAuthEnabled, capa.Dex.Enabled)
			assert.Equal(t, http.StatusOK, w.Code)
		})
	}
}
