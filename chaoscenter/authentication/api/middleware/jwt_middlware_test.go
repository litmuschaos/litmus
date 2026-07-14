package middleware_test

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/middleware"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/mocks"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestJwtMiddleware(t *testing.T) {
	router := gin.Default()
	mockService := new(mocks.MockedApplicationService)
	router.Use(middleware.JwtMiddleware(mockService))

	router.GET("/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Access Granted"})
	})

	createRequest := func(token string) *httptest.ResponseRecorder {
		req := httptest.NewRequest("GET", "/status", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		return w
	}

	t.Run("Valid Token", func(t *testing.T) {
		wValid := createRequest("jwtstring")
		assert.Equal(t, http.StatusOK, wValid.Code)
	})

	t.Run("Missing Authorization Header", func(t *testing.T) {
		wMissingHeader := httptest.NewRecorder()
		reqMissingHeader := httptest.NewRequest("GET", "/status", nil)
		router.ServeHTTP(wMissingHeader, reqMissingHeader)
		assert.Equal(t, http.StatusUnauthorized, wMissingHeader.Code)
	})
}

func TestJwtMiddleware_SetClaimsAndCallNextHandler(t *testing.T) {
	router := gin.Default()

	mockService := new(mocks.MockedApplicationService)
	router.Use(middleware.JwtMiddleware(mockService))

	router.GET("/status", func(c *gin.Context) {
		username, _ := c.Get("username")
		uid, _ := c.Get("uid")
		role, _ := c.Get("role")
		assert.Equal(t, "testuser", username)
		assert.Equal(t, "12345", uid)
		assert.Equal(t, "admin", role)
		c.JSON(http.StatusOK, gin.H{"message": "Access Granted"})
	})

	mockService.On("ValidateToken", "jwtstring").Return(&jwt.Token{
		Valid: true,
		Claims: jwt.MapClaims{
			"username": "testuser",
			"uid":      "12345",
			"role":     "admin",
		},
	}, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/status", nil)
	req.Header.Set("Authorization", "Bearer jwtstring")
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestJwtMiddleware_TokenValidationFailure(t *testing.T) {
	router := gin.Default()

	mockService := new(mocks.MockedApplicationService)
	router.Use(middleware.JwtMiddleware(mockService))

	router.GET("/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Access Granted"})
	})

	mockService.On("ValidateToken", "invalidtoken").Return(&jwt.Token{
		Valid: false,
	}, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/status", nil)
	req.Header.Set("Authorization", "Bearer invalidtoken")
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestJwtMiddleware_Error(t *testing.T) {
	router := gin.Default()

	mockService := new(mocks.MockedApplicationService)
	router.Use(middleware.JwtMiddleware(mockService))

	dummyToken := &jwt.Token{
		Raw:       "DummyToken",
		Method:    jwt.SigningMethodHS256,
		Header:    map[string]interface{}{"alg": "HS256"},
		Claims:    jwt.MapClaims{"foo": "bar"},
		Signature: "",
		Valid:     false,
	}

	mockService.On("ValidateToken", "dummy").Return(dummyToken, errors.New("mock error"))

	req, _ := http.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer dummy")
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	if status := resp.Code; status != utils.ErrorStatusCodes[utils.ErrUnauthorized] {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, utils.ErrorStatusCodes[utils.ErrUnauthorized])
	}
}
