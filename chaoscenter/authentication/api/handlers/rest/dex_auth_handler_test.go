package rest_test

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

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

func setupOIDCServer(t *testing.T, idTokenFunc func() string) (*httptest.Server, *rsa.PrivateKey) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	assert.NoError(t, err)

	var server *httptest.Server
	mux := http.NewServeMux()

	mux.HandleFunc("/.well-known/openid-configuration", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"issuer":                                server.URL,
			"authorization_endpoint":               server.URL + "/auth",
			"token_endpoint":                       server.URL + "/token",
			"jwks_uri":                             server.URL + "/keys",
			"id_token_signing_alg_values_supported": []string{"RS256"},
		})
	})

	mux.HandleFunc("/keys", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		nStr := base64.RawURLEncoding.EncodeToString(privateKey.N.Bytes())
		eStr := base64.RawURLEncoding.EncodeToString(big.NewInt(int64(privateKey.E)).Bytes())
		json.NewEncoder(w).Encode(map[string]interface{}{
			"keys": []map[string]interface{}{
				{
					"kty": "RSA",
					"alg": "RS256",
					"use": "sig",
					"kid": "test-key",
					"n":   nStr,
					"e":   eStr,
				},
			},
		})
	})

	mux.HandleFunc("/token", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"access_token": "mock-access-token",
			"token_type":   "Bearer",
			"id_token":     idTokenFunc(),
		})
	})

	server = httptest.NewServer(mux)
	return server, privateKey
}

func generateIDToken(t *testing.T, privateKey *rsa.PrivateKey, issuer string, claims map[string]interface{}) string {
	header := map[string]interface{}{
		"alg": "RS256",
		"typ": "JWT",
		"kid": "test-key",
	}
	headerBytes, _ := json.Marshal(header)
	payloadBytes, _ := json.Marshal(claims)

	headerEnc := base64.RawURLEncoding.EncodeToString(headerBytes)
	payloadEnc := base64.RawURLEncoding.EncodeToString(payloadBytes)

	signingInput := headerEnc + "." + payloadEnc

	hashed := sha256.Sum256([]byte(signingInput))
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])
	assert.NoError(t, err)

	sigEnc := base64.RawURLEncoding.EncodeToString(signature)
	return signingInput + "." + sigEnc
}

func TestOAuthCallback_VerifiedEmail(t *testing.T) {
	origIssuer := utils.OAuthOIDCIssuer
	origClientID := utils.OAuthClientID
	origClientSecret := utils.OAuthClientSecret
	origCallbackURL := utils.OAuthCallBackURL
	defer func() {
		utils.OAuthOIDCIssuer = origIssuer
		utils.OAuthClientID = origClientID
		utils.OAuthClientSecret = origClientSecret
		utils.OAuthCallBackURL = origCallbackURL
	}()

	var idTokenStr string
	server, privateKey := setupOIDCServer(t, func() string {
		return idTokenStr
	})
	defer server.Close()

	utils.OAuthOIDCIssuer = server.URL
	utils.OAuthClientID = "test-client"
	utils.OAuthClientSecret = "test-secret"
	utils.OAuthCallBackURL = "http://localhost/callback"

	state, err := utils.GenerateOAuthJWT()
	assert.NoError(t, err)

	idTokenClaims := map[string]interface{}{
		"iss":            server.URL,
		"sub":            "user-123",
		"aud":            "test-client",
		"exp":            time.Now().Add(time.Hour).Unix(),
		"iat":            time.Now().Unix(),
		"name":           "Test User",
		"email":          "user@example.com",
		"email_verified": true,
	}
	idTokenStr = generateIDToken(t, privateKey, server.URL, idTokenClaims)

	mockService := new(mocks.MockedApplicationService)
	expectedUser := &entities.User{
		ID:       "user-123",
		Name:     "Test User",
		Email:    "user@example.com",
		Username: "user@example.com",
		Role:     entities.RoleUser,
	}

	mockService.On("LoginUser", mock.Anything).Return(expectedUser, nil)
	mockService.On("GetConfig", "salt").Return(&authConfig.AuthConfig{Value: "test-salt"}, nil)
	mockService.On("GetSignedJWT", expectedUser, "test-salt").Return("mocked-jwt-token", nil)
	mockService.On("GetOwnerProjectIDs", mock.Anything, "user-123").Return([]*entities.Project{{ID: "proj-123"}}, nil)

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	ctx.Request, _ = http.NewRequest("GET", "/oauth/callback?state="+state+"&code=valid-code", nil)

	rest.OAuthCallback(mockService)(ctx)

	assert.Equal(t, http.StatusPermanentRedirect, w.Code)
	assert.Contains(t, w.Header().Get("Location"), "jwtToken=mocked-jwt-token")
	mockService.AssertExpectations(t)
}

func TestOAuthCallback_UnverifiedEmail_ExplicitFalse(t *testing.T) {
	origIssuer := utils.OAuthOIDCIssuer
	origClientID := utils.OAuthClientID
	origClientSecret := utils.OAuthClientSecret
	origCallbackURL := utils.OAuthCallBackURL
	defer func() {
		utils.OAuthOIDCIssuer = origIssuer
		utils.OAuthClientID = origClientID
		utils.OAuthClientSecret = origClientSecret
		utils.OAuthCallBackURL = origCallbackURL
	}()

	var idTokenStr string
	server, privateKey := setupOIDCServer(t, func() string {
		return idTokenStr
	})
	defer server.Close()

	utils.OAuthOIDCIssuer = server.URL
	utils.OAuthClientID = "test-client"
	utils.OAuthClientSecret = "test-secret"
	utils.OAuthCallBackURL = "http://localhost/callback"

	state, err := utils.GenerateOAuthJWT()
	assert.NoError(t, err)

	idTokenClaims := map[string]interface{}{
		"iss":            server.URL,
		"sub":            "user-123",
		"aud":            "test-client",
		"exp":            time.Now().Add(time.Hour).Unix(),
		"iat":            time.Now().Unix(),
		"name":           "Unverified User",
		"email":          "unverified@example.com",
		"email_verified": false,
	}
	idTokenStr = generateIDToken(t, privateKey, server.URL, idTokenClaims)

	mockService := new(mocks.MockedApplicationService)

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	ctx.Request, _ = http.NewRequest("GET", "/oauth/callback?state="+state+"&code=valid-code", nil)

	rest.OAuthCallback(mockService)(ctx)

	assert.Equal(t, 500, w.Code)
	mockService.AssertNotCalled(t, "LoginUser", mock.Anything)
	mockService.AssertNotCalled(t, "GetSignedJWT", mock.Anything, mock.Anything)
	mockService.AssertNotCalled(t, "CreateProject", mock.Anything)
}

func TestOAuthCallback_UnverifiedEmail_MissingClaim(t *testing.T) {
	origIssuer := utils.OAuthOIDCIssuer
	origClientID := utils.OAuthClientID
	origClientSecret := utils.OAuthClientSecret
	origCallbackURL := utils.OAuthCallBackURL
	defer func() {
		utils.OAuthOIDCIssuer = origIssuer
		utils.OAuthClientID = origClientID
		utils.OAuthClientSecret = origClientSecret
		utils.OAuthCallBackURL = origCallbackURL
	}()

	var idTokenStr string
	server, privateKey := setupOIDCServer(t, func() string {
		return idTokenStr
	})
	defer server.Close()

	utils.OAuthOIDCIssuer = server.URL
	utils.OAuthClientID = "test-client"
	utils.OAuthClientSecret = "test-secret"
	utils.OAuthCallBackURL = "http://localhost/callback"

	state, err := utils.GenerateOAuthJWT()
	assert.NoError(t, err)

	// Omit "email_verified" claim
	idTokenClaims := map[string]interface{}{
		"iss":   server.URL,
		"sub":   "user-123",
		"aud":   "test-client",
		"exp":   time.Now().Add(time.Hour).Unix(),
		"iat":   time.Now().Unix(),
		"name":  "Missing Claim User",
		"email": "missing@example.com",
	}
	idTokenStr = generateIDToken(t, privateKey, server.URL, idTokenClaims)

	mockService := new(mocks.MockedApplicationService)

	w := httptest.NewRecorder()
	ctx := GetTestGinContext(w)
	ctx.Request, _ = http.NewRequest("GET", "/oauth/callback?state="+state+"&code=valid-code", nil)

	rest.OAuthCallback(mockService)(ctx)

	assert.Equal(t, 500, w.Code)
	mockService.AssertNotCalled(t, "LoginUser", mock.Anything)
	mockService.AssertNotCalled(t, "GetSignedJWT", mock.Anything, mock.Anything)
	mockService.AssertNotCalled(t, "CreateProject", mock.Anything)
}
