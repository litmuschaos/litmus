package rest_handlers_test

import (
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/stretchr/testify/assert"
)

func TestWorkflowHelperImageVersionHandler(t *testing.T) {
	// given
	utils.Config.WorkflowHelperImageVersion = uuid.NewString()
	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)

	// when
	rest_handlers.WorkflowHelperImageVersionHandler(ctx)

	// then
	var version rest_handlers.WorkflowHelperImageVersion
	err := json.Unmarshal(w.Body.Bytes(), &version)
	assert.NoError(t, err)
	assert.Equal(t, w.Code, 200)
	assert.Equal(t, version.Version, utils.Config.WorkflowHelperImageVersion)
}
