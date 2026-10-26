package chaoshubops_test

import (
	"testing"

	chaosHubOps "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/chaoshub/ops"

	"github.com/stretchr/testify/assert"
)

func TestGenerateKeys(t *testing.T) {
	// given
	// when
	publicKey, privateKey, err := chaosHubOps.GenerateKeys()
	// then
	assert.NotEmpty(t, publicKey)
	assert.NotEmpty(t, privateKey)
	assert.NoError(t, err)
}
