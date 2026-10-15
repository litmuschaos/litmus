package rest_test

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/handlers/rest"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/authConfig"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestOAuthLogin(t *testing.T) {
	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)

	rest.OAuthLogin()(ctx)

	assert.Equal(t, 500, w.Code)
}

// newTestOIDCProvider starts a minimal OIDC provider that hands out an id_token
// carrying the given claims, so the callback can be driven end to end.
func newTestOIDCProvider(t *testing.T, clientID string, claims map[string]interface{}) *httptest.Server {
	t.Helper()

	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("unable to generate signing key: %v", err)
	}

	mux := http.NewServeMux()
	server := httptest.NewServer(mux)
	t.Cleanup(server.Close)

	mux.HandleFunc("/.well-known/openid-configuration", func(w http.ResponseWriter, r *http.Request) {
		writeTestJSON(t, w, map[string]interface{}{
			"issuer":                                server.URL,
			"authorization_endpoint":                server.URL + "/auth",
			"token_endpoint":                        server.URL + "/token",
			"jwks_uri":                              server.URL + "/keys",
			"id_token_signing_alg_values_supported": []string{"RS256"},
		})
	})

	mux.HandleFunc("/keys", func(w http.ResponseWriter, r *http.Request) {
		writeTestJSON(t, w, map[string]interface{}{
			"keys": []map[string]string{{
				"kty": "RSA",
				"alg": "RS256",
				"use": "sig",
				"kid": "test",
				"n":   base64.RawURLEncoding.EncodeToString(key.N.Bytes()),
				"e":   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(key.E)).Bytes()),
			}},
		})
	})

	mux.HandleFunc("/token", func(w http.ResponseWriter, r *http.Request) {
		idClaims := jwt.MapClaims{
			"iss": server.URL,
			"aud": clientID,
			"sub": "attacker-subject",
			"iat": time.Now().Unix(),
			"exp": time.Now().Add(time.Hour).Unix(),
		}
		for k, v := range claims {
			idClaims[k] = v
		}

		idToken := jwt.NewWithClaims(jwt.SigningMethodRS256, idClaims)
		idToken.Header["kid"] = "test"
		signed, err := idToken.SignedString(key)
		if err != nil {
			t.Errorf("unable to sign id_token: %v", err)
			return
		}

		writeTestJSON(t, w, map[string]interface{}{
			"access_token": "test-access-token",
			"token_type":   "Bearer",
			"expires_in":   3600,
			"id_token":     signed,
		})
	})

	return server
}

func writeTestJSON(t *testing.T, w http.ResponseWriter, payload map[string]interface{}) {
	t.Helper()
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		t.Errorf("unable to write response: %v", err)
	}
}

func TestOAuthCallbackRejectsUnusableEmailClaims(t *testing.T) {
	const clientID = "litmus-test-client"

	tests := []struct {
		name   string
		claims map[string]interface{}
	}{
		{
			name: "email not verified by the provider",
			claims: map[string]interface{}{
				"email":          "victim@litmus.test",
				"email_verified": false,
				"name":           "attacker",
			},
		},
		{
			name: "email_verified claim absent",
			claims: map[string]interface{}{
				"email": "victim@litmus.test",
				"name":  "attacker",
			},
		},
		{
			name: "no email claim at all",
			claims: map[string]interface{}{
				"email_verified": true,
				"name":           "attacker",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			provider := newTestOIDCProvider(t, clientID, tt.claims)

			utils.OAuthOIDCIssuer = provider.URL
			utils.OAuthClientID = clientID
			utils.OAuthClientSecret = "test-client-secret"
			utils.OAuthCallBackURL = "http://localhost:3000/oauth/callback"
			utils.OAuthJwtSecret = "test-oauth-state-secret"

			state, err := utils.GenerateOAuthJWT()
			assert.NoError(t, err)

			service := new(mocks.MockedApplicationService)
			service.On("LoginUser", mock.Anything).Return(&entities.User{
				ID:       "victim-user-id",
				Username: "victim@litmus.test",
				Email:    "victim@litmus.test",
			}, nil)
			service.On("GetConfig", "salt").Return(&authConfig.AuthConfig{Value: "salt"}, nil)
			service.On("GetSignedJWT", mock.Anything, mock.Anything).Return("victim-session-token", nil)
			service.On("GetOwnerProjectIDs", mock.Anything, mock.Anything).
				Return([]*entities.Project{{ID: "victim-project"}}, nil)

			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			ctx.Request = httptest.NewRequest(http.MethodGet, "/oauth/callback?state="+state+"&code=test-code", nil)

			rest.OAuthCallback(service)(ctx)

			assert.Equal(t, 401, w.Code)
			assert.NotContains(t, w.Header().Get("Location"), "victim-session-token")
			service.AssertNotCalled(t, "GetSignedJWT", mock.Anything, mock.Anything)
		})
	}
}

func TestOAuthCallbackAcceptsVerifiedEmail(t *testing.T) {
	const clientID = "litmus-test-client"

	provider := newTestOIDCProvider(t, clientID, map[string]interface{}{
		"email":          "user@litmus.test",
		"email_verified": true,
		"name":           "user",
	})

	utils.OAuthOIDCIssuer = provider.URL
	utils.OAuthClientID = clientID
	utils.OAuthClientSecret = "test-client-secret"
	utils.OAuthCallBackURL = "http://localhost:3000/oauth/callback"
	utils.OAuthJwtSecret = "test-oauth-state-secret"

	state, err := utils.GenerateOAuthJWT()
	assert.NoError(t, err)

	service := new(mocks.MockedApplicationService)
	service.On("LoginUser", mock.Anything).Return(&entities.User{
		ID:       "user-id",
		Username: "user@litmus.test",
		Email:    "user@litmus.test",
	}, nil)
	service.On("GetConfig", "salt").Return(&authConfig.AuthConfig{Value: "salt"}, nil)
	service.On("GetSignedJWT", mock.Anything, mock.Anything).Return("user-session-token", nil)
	service.On("GetOwnerProjectIDs", mock.Anything, mock.Anything).
		Return([]*entities.Project{{ID: "user-project"}}, nil)

	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/oauth/callback?state="+state+"&code=test-code", nil)

	rest.OAuthCallback(service)(ctx)

	assert.Equal(t, http.StatusPermanentRedirect, w.Code)
	assert.Contains(t, w.Header().Get("Location"), "jwtToken=user-session-token")
}
