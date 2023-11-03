package authorization_test

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/rest_handlers"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"
)

// GetTestGinContext returns a gin context for testing
func GetTestGinContext(w *httptest.ResponseRecorder) *gin.Context {
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = &http.Request{
		Header: make(http.Header),
		URL:    &url.URL{},
	}

	return ctx
}

// TestMiddleware tests the middleware function
func TestMiddleware(t *testing.T) {
	//given
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	testcases := []struct {
		name           string
		isRevokedToken bool
		statusCode     int
	}{
		{
			name:           "unauthorized: revoked token",
			isRevokedToken: true,
			statusCode:     http.StatusUnauthorized,
		},
		{
			name:           "success",
			isRevokedToken: false,
			statusCode:     http.StatusOK,
		},
	}
	for _, tc := range testcases {
		mt.Run(tc.name, func(mt *mtest.T) {
			// given
			w := httptest.NewRecorder()
			ctx := GetTestGinContext(w)
			ctx.Request.AddCookie(&http.Cookie{
				Name:  authorization.CookieName,
				Value: "test",
			})
			handlerMock := http.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
			}))
			ts := httptest.NewServer(handlerMock)
			defer ts.Close()
			if tc.isRevokedToken {
				mt.AddMockResponses(mtest.CreateCursorResponse(1, "auth.revoked-token", mtest.FirstBatch, bson.D{{"token", "test"}}))
			}
			// when
			authorization.Middleware(handlerMock, mt.Client)(ctx)
			// then
			assert.Equal(mt, tc.statusCode, w.Code)
		})
	}
}

func TestRestMiddlewareWithRole(t *testing.T) {
	//given
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	var (
		w        *httptest.ResponseRecorder
		ctx      *gin.Context
		username = uuid.NewString()
	)
	testcases := []struct {
		name           string
		given          func() string
		statusCode     int
		roles          []string
		isRevokedToken bool
	}{
		{
			name: "unauthorized: revoked token",
			given: func() string {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				claims := jwt.MapClaims{}
				claims["username"] = username
				token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)
				tokenString, _ := token.SignedString([]byte(utils.Config.JwtSecret))
				return tokenString
			},
			statusCode:     http.StatusUnauthorized,
			isRevokedToken: true,
		},
		{
			name: "success",
			given: func() string {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				claims := jwt.MapClaims{}
				claims["username"] = username
				token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)
				tokenString, _ := token.SignedString([]byte(utils.Config.JwtSecret))
				return tokenString
			},
			statusCode: http.StatusOK,
		},
		{
			name: "failure: invalid token",
			given: func() string {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				return "invalid-token"
			},
			statusCode: http.StatusUnauthorized,
		},
		{
			name: "success",
			given: func() string {
				w = httptest.NewRecorder()
				ctx = GetTestGinContext(w)
				claims := jwt.MapClaims{}
				claims["username"] = username
				claims["role"] = "admin"
				token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)
				tokenString, _ := token.SignedString([]byte(utils.Config.JwtSecret))
				return tokenString
			},
			statusCode: http.StatusOK,
			roles:      []string{"admin"},
		},
	}
	for _, tc := range testcases {
		mt.Run(tc.name, func(mt *mtest.T) {
			// given
			tokenString := tc.given()
			ctx.Request.AddCookie(&http.Cookie{
				Name:  authorization.CookieName,
				Value: tokenString,
			})
			if tc.isRevokedToken {
				mt.AddMockResponses(mtest.CreateCursorResponse(1, "auth.revoked-token", mtest.FirstBatch, bson.D{{"token", tokenString}}))
			}
			// when
			authorization.RestMiddlewareWithRole(rest_handlers.PlaygroundHandler(), mt.Client, tc.roles)(ctx)
			// then
			assert.Equal(t, tc.statusCode, w.Code)
		})
	}
}
