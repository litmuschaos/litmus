package graph

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/authorization"
)

func TestUsernameFromContext_MissingToken(t *testing.T) {
	_, err := usernameFromContext(context.Background())

	assert.EqualError(t, err, "JWT token not found")
}

func TestUsernameFromContext_TokenOfWrongType(t *testing.T) {
	ctx := context.WithValue(context.Background(), authorization.AuthKey, 42)

	_, err := usernameFromContext(ctx)

	assert.EqualError(t, err, "JWT token not found")
}
