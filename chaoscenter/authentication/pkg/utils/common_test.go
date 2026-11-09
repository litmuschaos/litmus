package utils

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestOAuthJWT_GenerateAndValidate(t *testing.T) {
	// Set mock secret and duration for testing
	origSecret := OAuthJwtSecret
	origDuration := OAuthJWTExpDuration
	defer func() {
		OAuthJwtSecret = origSecret
		OAuthJWTExpDuration = origDuration
	}()

	OAuthJwtSecret = "test-secret-key-1234567890"
	OAuthJWTExpDuration = 5

	token, err := GenerateOAuthJWT()
	require.NoError(t, err)
	assert.NotEmpty(t, token)

	valid, err := ValidateOAuthJWT(token)
	assert.NoError(t, err)
	assert.True(t, valid)
}

func TestValidateOAuthJWT_InvalidTokens(t *testing.T) {
	origSecret := OAuthJwtSecret
	defer func() {
		OAuthJwtSecret = origSecret
	}()
	OAuthJwtSecret = "test-secret-key-1234567890"

	t.Run("malformed token string", func(t *testing.T) {
		valid, err := ValidateOAuthJWT("this-is-not-a-valid-jwt")
		assert.Error(t, err)
		assert.False(t, valid)
	})

	t.Run("token with invalid signature", func(t *testing.T) {
		token := jwt.New(jwt.SigningMethodHS512)
		claims := token.Claims.(jwt.MapClaims)
		claims["exp"] = time.Now().Add(time.Minute * 5).Unix()
		wrongSecretToken, err := token.SignedString([]byte("wrong-secret-key"))
		require.NoError(t, err)

		valid, err := ValidateOAuthJWT(wrongSecretToken)
		assert.Error(t, err)
		assert.False(t, valid)
	})

	t.Run("expired token", func(t *testing.T) {
		token := jwt.New(jwt.SigningMethodHS512)
		claims := token.Claims.(jwt.MapClaims)
		claims["exp"] = time.Now().Add(-time.Hour).Unix()
		expiredToken, err := token.SignedString([]byte(OAuthJwtSecret))
		require.NoError(t, err)

		valid, err := ValidateOAuthJWT(expiredToken)
		assert.Error(t, err)
		assert.False(t, valid)
	})

	t.Run("unsupported signing method none", func(t *testing.T) {
		token := jwt.New(jwt.SigningMethodNone)
		noneToken, err := token.SignedString(jwt.UnsafeAllowNoneSignatureType)
		require.NoError(t, err)

		valid, err := ValidateOAuthJWT(noneToken)
		assert.Error(t, err)
		assert.False(t, valid)
	})
}
