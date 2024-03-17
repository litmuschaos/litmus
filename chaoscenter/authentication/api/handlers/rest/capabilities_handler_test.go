package rest_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestCapabilities(t *testing.T) {

	testcases := []struct {
		Name       string
		DexEnabled bool
	}{
		{
			Name:       "Dex Enabled",
			DexEnabled: true,
		},
		{
			Name:       "Dex Disabled",
			DexEnabled: false,
		},
	}

	for _, test := range testcases {
		test := test
		t.Run(test.Name, func(t *testing.T) {
			w := httptest.NewRecorder()
			ctx := GetTestGinContext(w)
			utils.DexEnabled = test.DexEnabled

			rest.GetCapabilities()(ctx)
			capa := rest.Capabilities{}
			err := json.Unmarshal(w.Body.Bytes(), &capa)

			assert.Nil(t, err)
			assert.Equal(t, test.DexEnabled, capa.Dex.Enabled)
			assert.Equal(t, http.StatusOK, w.Code)
		})
	}
}
