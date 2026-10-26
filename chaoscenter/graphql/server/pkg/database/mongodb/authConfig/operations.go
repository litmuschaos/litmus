package authConfig

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
)

// Operator is the model for cluster collection
type Operator struct {
	operator mongodb.MongoOperator
}

// NewAuthConfigOperator returns a new instance of Operator
func NewAuthConfigOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		operator: mongodbOperator,
	}
}

func (c *Operator) GetAuthConfig(ctx context.Context) (*mongodb.AuthConfig, error) {
	salt, err := c.operator.GetAuthConfig(ctx, "salt")
	if err != nil {
		return nil, err
	}
	return salt, nil
}
