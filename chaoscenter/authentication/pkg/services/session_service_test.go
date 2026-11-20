package services

import (
	"context"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/authConfig"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const testSalt = "test-salt"

type fakeAuthConfigRepo struct{}

func (fakeAuthConfigRepo) CreateConfig(authConfig.AuthConfig) error { return nil }

func (fakeAuthConfigRepo) GetConfig(key string) (*authConfig.AuthConfig, error) {
	return &authConfig.AuthConfig{Key: key, Value: testSalt}, nil
}

func (fakeAuthConfigRepo) UpdateConfig(context.Context, string, interface{}) error { return nil }

type fakeRevokedTokenRepo struct {
	revoked []*entities.RevokedToken
}

func (r *fakeRevokedTokenRepo) RevokeToken(token *entities.RevokedToken) error {
	r.revoked = append(r.revoked, token)
	return nil
}

func (r *fakeRevokedTokenRepo) IsTokenRevoked(string) bool { return false }

func signedToken(t *testing.T, secret string, exp time.Time) string {
	t.Helper()
	token := jwt.New(jwt.SigningMethodHS512)
	token.Claims.(jwt.MapClaims)["exp"] = exp.Unix()
	signed, err := token.SignedString([]byte(secret))
	require.NoError(t, err)
	return signed
}

func TestRevokeToken(t *testing.T) {
	tests := []struct {
		name        string
		token       string
		wantErr     bool
		wantRevoked int
	}{
		{
			name:        "valid token is recorded as revoked",
			token:       signedToken(t, testSalt, time.Now().Add(time.Hour)),
			wantRevoked: 1,
		},
		{
			// Deleting an API token that has already expired must still succeed:
			// an expired token can no longer be used, so there is nothing to revoke.
			name:        "expired token is not an error",
			token:       signedToken(t, testSalt, time.Now().Add(-time.Hour)),
			wantRevoked: 0,
		},
		{
			name:    "expired token with a wrong signature is rejected",
			token:   signedToken(t, "other-salt", time.Now().Add(-time.Hour)),
			wantErr: true,
		},
		{
			name:    "token with a wrong signature is rejected",
			token:   signedToken(t, "other-salt", time.Now().Add(time.Hour)),
			wantErr: true,
		},
		{
			name:    "malformed token is rejected",
			token:   "not-a-jwt",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			revokedRepo := &fakeRevokedTokenRepo{}
			svc := applicationService{
				authConfigRepo:         fakeAuthConfigRepo{},
				revokedTokenRepository: revokedRepo,
			}

			err := svc.RevokeToken(tt.token)

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.Len(t, revokedRepo.revoked, tt.wantRevoked)
		})
	}
}
