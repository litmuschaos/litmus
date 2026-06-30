**package handlers**

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/mocks"
)

func FuzzFileHandler(f *testing.F) {
	gin.SetMode(gin.TestMode)

	testCases := []struct {
		key     string
		referer string
	}{
		{"test-token.yaml", "http://localhost:3000"},
		{"test-token", "http://localhost:3000"},
		{"", "http://localhost:3000"},
		{"../invalid.yaml", "http://localhost:3000"},
		{"%00.yaml", "://invalid-url"},
	}

	for _, tc := range testCases {
		f.Add(tc.key, tc.referer)
	}

	f.Fuzz(func(t *testing.T, key string, referer string) {

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		req := httptest.NewRequest(http.MethodGet, "/file/"+url.PathEscape(key), nil)
		req.Header.Set("Referer", referer)
		ctx.Request = req

		ctx.Params = gin.Params{
			{
				Key:   "key",
				Value: key,
			},
		}

		mockOp := new(mocks.MongoOperator)

		defer func() {
			if r := recover(); r != nil {
				t.Fatalf("FileHandler panicked with key=%q referer=%q: %v", key, referer, r)
			}
		}()

		FileHandler(mockOp)(ctx)

		if w.Code < 100 || w.Code > 599 {
			t.Fatalf("unexpected HTTP status code: %d", w.Code)
		}

		if strings.Contains(w.Body.String(), "\x00") {
			t.Fatalf("response body contains null byte")
		}
	})
}
