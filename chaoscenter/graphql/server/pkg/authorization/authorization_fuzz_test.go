package authorization

import (
	"fmt"
	"testing"
	"time"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"github.com/golang-jwt/jwt/v4"
)

// generateExpiredFakeJWTToken generates a fake JWT token with expiration time set to the past
func generateExpiredFakeJWTToken(username string) string {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["username"] = username
	claims["exp"] = time.Now().Add(-time.Hour).Unix()               // Set expiration time to 1 hour ago
	signedToken, _ := token.SignedString([]byte("your-secret-key")) // Sign the token with a secret key
	return signedToken
}

// generateFakeJWTTokenWithInvalidSignature generates a fake JWT token with an invalid signature
func generateFakeJWTTokenWithInvalidSignature(username string) string {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["username"] = username
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()              // Set expiration time to 24 hours from now
	signedToken, _ := token.SignedString([]byte("invalid-secret-key")) // Sign the token with an invalid secret key
	return signedToken
}

// generateFakeJWTToken generates a fake JWT token with predefined claims
func generateFakeJWTToken(username string) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS512, jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // Set expiration time to 24 hours from now
	})
	fakeSecret := ""
	signedToken, _ := token.SignedString([]byte(fakeSecret)) // No signature is needed for testing
	return signedToken
}

// generateJWTToken generates a JWT token with the given claims
func generateJWTTokenFromClaims(claims jwt.MapClaims) (string, error) {
	// Set expiration time to 24 hours from now
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	// Create a new token with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with a secret key
	tokenString, err := token.SignedString([]byte(""))
	if err != nil {
		return "", fmt.Errorf("failed to sign JWT token: %v", err)
	}

	return tokenString, nil
}

func FuzzUserValidateJWT(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		inputClaims := &jwt.MapClaims{}
		err := fuzzConsumer.GenerateStruct(inputClaims)
		if err != nil {
			return
		}
		// Generate a JWT token with fuzzed claims
		tokenString, err := generateJWTTokenFromClaims(*inputClaims)
		if err != nil {
			t.Fatalf("Error generating JWT token: %v", err)
		}

		// Run the test with the generated JWT token
		claims, err := UserValidateJWT(tokenString, "")
		if err != nil {
			t.Errorf("Error encountered: %v", err)
		}

		// Optionally, check if claims are nil when there's an error
		if claims == nil && err == nil {
			t.Errorf("Claims are nil while no error is returned")
		}

	})
}
