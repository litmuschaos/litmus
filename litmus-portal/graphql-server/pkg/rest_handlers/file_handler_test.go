package rest_handlers_test

import (
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/database/mongodb/model/mocks"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/stretchr/testify/assert"
)

func TestFileHandler(t *testing.T) {
	// given
	var (
		w             *httptest.ResponseRecorder
		ctx           *gin.Context
		mongoOperator = new(mocks.MongoOperator)
	)
	testcases := []struct {
		name       string
		statusCode int
		given      func()
	}{
		{
			name:       "failure: should return 404 when cluster is not found",
			statusCode: 500,
			given: func() {
				w = httptest.NewRecorder()
				accessKey := "invalid-token"
				ctx, _ = gin.CreateTestContext(w)
				ctx.Params = []gin.Param{{
					Key:   "key",
					Value: accessKey,
				}}
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tc.given()
			// when
			rest_handlers.FileHandler(mongoOperator)(ctx)

			// then
			assert.Equal(t, w.Code, tc.statusCode)
		})
	}
}
