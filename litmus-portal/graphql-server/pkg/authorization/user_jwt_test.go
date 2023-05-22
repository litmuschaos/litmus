package authorization_test

import (
	"testing"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/authorization"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/stretchr/testify/assert"
)

// TestUserValidateJWT tests the UserValidateJWT function
func TestUserValidateJWT(t *testing.T) {
	// given
	username := uuid.NewString()
	testcases := []struct {
		name    string
		given   func() string
		wantErr bool
	}{
		{
			name: "success",
			given: func() string {
				claims := jwt.MapClaims{}
				claims["username"] = username
				token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)

				tokenString, _ := token.SignedString([]byte(utils.Config.JwtSecret))
				return tokenString
			},
			wantErr: false,
		},
		{
			name: "failure: parse err",
			given: func() string {
				return "invalid-jwt"
			},
			wantErr: true,
		},
		{
			name: "failure: unexpected signing method",
			given: func() string {
				claims := jwt.MapClaims{}
				claims["username"] = username
				token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

				tokenString, _ := token.SignedString([]byte(utils.Config.JwtSecret))
				return tokenString
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tokenString := tc.given()
			// when
			got, err := authorization.UserValidateJWT(tokenString)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, username, got["username"])
			}
		})
	}
}

// TestGetUsername tests the GetUsername function
func TestGetUsername(t *testing.T) {
	// given
	username := uuid.NewString()

	testcases := []struct {
		name    string
		given   func() string
		wantErr bool
	}{
		{
			name: "success",
			given: func() string {
				claims := jwt.MapClaims{}
				claims["username"] = username
				token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

				tokenString, _ := token.SignedString([]byte(utils.Config.JwtSecret))
				return tokenString
			},
			wantErr: false,
		},
		{
			name: "failure: parse err",
			given: func() string {
				return "invalid-jwt"
			},
			wantErr: true,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			tokenString := tc.given()
			// when
			got, err := authorization.GetUsername(tokenString)
			// then
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, username, got)
			}
		})
	}
}
