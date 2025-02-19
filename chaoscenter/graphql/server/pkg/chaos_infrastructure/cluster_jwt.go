package chaos_infrastructure

import (
	"context"
	"errors"
	"fmt"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/authConfig"

	"github.com/golang-jwt/jwt"
)

type Operator struct {
	authConfigOperator *authConfig.Operator
}

func NewChaosInfrastructureOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		authConfigOperator: authConfig.NewAuthConfigOperator(mongodbOperator),
	}
}

// InfraCreateJWT generates jwt used in chaos_infra registration
func (o *Operator) InfraCreateJWT(id string) (string, error) {
	claims := jwt.MapClaims{}
	claims["chaos_infra_id"] = id
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	config, err := o.authConfigOperator.GetAuthConfig(context.Background())
	if err != nil {
		return "", err
	}
	tokenString, err := token.SignedString([]byte(config.Value))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// InfraValidateJWT validates the chaos_infra jwt
func (o *Operator) InfraValidateJWT(token string) (string, error) {
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		config, err := o.authConfigOperator.GetAuthConfig(context.Background())
		if err != nil {
			return "", err
		}
		return []byte(config.Value), nil
	})

	if err != nil {
		return "", err
	}

	if !tkn.Valid {
		return "", errors.New("invalid chaos_infra jwt token")
	}

	claims, ok := tkn.Claims.(jwt.MapClaims)
	if ok {
		return claims["chaos_infra_id"].(string), nil
	}

	return "", errors.New("invalid Token")
}
