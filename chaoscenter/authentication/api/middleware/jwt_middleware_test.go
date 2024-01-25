package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/stretchr/testify/assert"
)

type MockApplicationService struct{}

func (m *MockApplicationService) ValidateToken(tokenString string) (*jwt.Token, error) {
	return nil, nil
}

func TestJwtMiddleware(t *testing.T) {
	// Initialize Gin Engine
	router := gin.Default()

	// Set up the middleware with the mock service
	mockService := &MockApplicationService{}
	router.Use(JwtMiddleware(mockService))

	// Define a test route that uses the middleware
	router.GET("/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Access Granted"})
	})

	// Test Case 1: Valid Token
	validToken := "jwtstring"
	reqValid := httptest.NewRequest("GET", "/status", nil)
	reqValid.Header.Set("Authorization", "Bearer "+validToken)
	wValid := httptest.NewRecorder()
	router.ServeHTTP(wValid, reqValid)

	// Assert the response for a valid token
	assert.Equal(t, http.StatusOK, wValid.Code)

	// Test Case 2: Missing Authorization Header
	reqMissingHeader := httptest.NewRequest("GET", "/status", nil)
	wMissingHeader := httptest.NewRecorder()
	router.ServeHTTP(wMissingHeader, reqMissingHeader)

	// Assert the response for a missing Authorization header
	assert.Equal(t, http.StatusUnauthorized, wMissingHeader.Code)

	// Test Case 3: Invalid Token
	invalidToken := "invalidTokenString"
	reqInvalid := httptest.NewRequest("GET", "/status", nil)
	reqInvalid.Header.Set("Authorization", "Bearer "+invalidToken)
	wInvalid := httptest.NewRecorder()
	router.ServeHTTP(wInvalid, reqInvalid)

	// Assert the response for an invalid token
	assert.Equal(t, http.StatusUnauthorized, wInvalid.Code)
}
