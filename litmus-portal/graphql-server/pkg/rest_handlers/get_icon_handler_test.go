package rest_handlers_test

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/stretchr/testify/assert"
)

func TestGetIconHandler(t *testing.T) {
	// given
	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	projectID, hubName, chartName, iconName := uuid.NewString(), uuid.NewString(), uuid.NewString(), uuid.NewString()
	ctx.Params = []gin.Param{
		{
			Key:   "ProjectID",
			Value: projectID,
		},
		{
			Key:   "HubName",
			Value: hubName,
		},
		{
			Key:   "ChartName",
			Value: chartName,
		},
		{
			Key:   "IconName",
			Value: iconName,
		},
	}

	err := os.MkdirAll(fmt.Sprintf("/tmp/version/%s/%s/charts/%s/icons", projectID, hubName, chartName), 0777)
	if err != nil {
		t.FailNow()
	}
	_, err = os.Create(fmt.Sprintf("/tmp/version/%s/%s/charts/%s/icons/%s", projectID, hubName, chartName, iconName))
	if err != nil {
		t.FailNow()
	}
	t.Cleanup(func() { _ = os.RemoveAll("/tmp/version/" + projectID) })
	// when
	rest_handlers.GetIconHandler(ctx)

	// then
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "image/png", w.Header().Get("Content-Type"))
}
