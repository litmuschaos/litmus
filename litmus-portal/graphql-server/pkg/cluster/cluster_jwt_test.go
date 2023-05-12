package cluster_test

import (
	"testing"

	"github.com/google/uuid"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/cluster"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	"github.com/stretchr/testify/assert"
)

func TestCreateJwt(t *testing.T) {
	// given
	utils.Config.JwtSecret = uuid.NewString()
	// when
	_, err := cluster.CreateJWT(uuid.NewString())
	// then
	assert.NoError(t, err)
}

func TestValidateJWT(t *testing.T) {
	// given
	testcases := []struct {
		name      string
		wantError bool
		given     func() string
	}{
		{
			name:      "success",
			wantError: false,
			given: func() string {
				utils.Config.JwtSecret = uuid.NewString()
				token, _ := cluster.CreateJWT(uuid.NewString())
				return token
			},
		},
		{
			name:      "failure: invalid token",
			wantError: true,
			given: func() string {
				return uuid.NewString()
			},
		},
		{
			name:      "failure: valid token but secret changed",
			wantError: true,
			given: func() string {
				utils.Config.JwtSecret = uuid.NewString()
				token, _ := cluster.CreateJWT(uuid.NewString())
				utils.Config.JwtSecret = uuid.NewString()
				return token
			},
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			// given
			token := tc.given()
			// when
			_, err := cluster.ValidateJWT(token)
			// then
			if tc.wantError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
