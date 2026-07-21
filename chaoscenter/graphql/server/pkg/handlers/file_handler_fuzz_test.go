package handlers

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
		// InfraValidateJWT reads the auth secret through the global Mongo
		// operator for JWT-shaped values. Keep this handler fuzz target
		// self-contained and let FuzzParseReferer exercise the next stage.
		if strings.Count(strings.TrimSuffix(key, ".yaml"), ".") == 2 {
			t.Skip("JWT-shaped keys require the Mongo-backed auth configuration")
		}

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		req := httptest.NewRequest(http.MethodGet, "/file/test-token.yaml", nil)
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

func TestParseReferer(t *testing.T) {
	tests := []struct {
		name      string
		referrer  string
		want      string
		wantError bool
	}{
		{
			name:     "keeps the origin and removes the path",
			referrer: "https://example.com/dashboard",
			want:     "https://example.com",
		},
		{
			name:      "rejects an empty header",
			referrer:  "",
			wantError: true,
		},
		{
			name:      "rejects a non-http scheme",
			referrer:  "javascript:alert(1)",
			wantError: true,
		},
		{
			name:      "rejects userinfo",
			referrer:  "https://user:password@example.com",
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parseReferer(tt.referrer)
			if (err != nil) != tt.wantError {
				t.Fatalf("parseReferer() error = %v, wantError %v", err, tt.wantError)
			}
			if err == nil && got != tt.want {
				t.Fatalf("parseReferer() = %q, want %q", got, tt.want)
			}
		})
	}
}

func FuzzParseReferer(f *testing.F) {
	for _, referer := range []string{
		"http://localhost:3000",
		"https://example.com/dashboard",
		"",
		"javascript:alert(1)",
		"http://<script>alert(1)</script>",
	} {
		f.Add(referer)
	}

	f.Fuzz(func(t *testing.T, referer string) {
		endpoint, err := parseReferer(referer)
		if err != nil {
			return
		}

		if strings.ContainsAny(endpoint, "<>\"'") {
			t.Fatalf("referer was not escaped before being embedded: %q", endpoint)
		}

		parsedEndpoint, err := url.Parse(endpoint)
		if err != nil {
			t.Fatalf("parseReferer returned invalid endpoint %q: %v", endpoint, err)
		}
		if parsedEndpoint.Scheme != "http" && parsedEndpoint.Scheme != "https" {
			t.Fatalf("parseReferer returned unsafe scheme %q", parsedEndpoint.Scheme)
		}
		if parsedEndpoint.Host == "" {
			t.Fatalf("parseReferer returned endpoint without a host: %q", endpoint)
		}
	})
}
