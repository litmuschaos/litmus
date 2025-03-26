package authorization

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/authConfig"

	"github.com/golang-jwt/jwt"
)

type Operator struct {
	authConfigOperator *authConfig.Operator
}

func NewAuthorizationOperator(mongodbOperator mongodb.MongoOperator) *Operator {
	return &Operator{
		authConfigOperator: authConfig.NewAuthConfigOperator(mongodbOperator),
	}
}

// UserValidateJWT validates the cluster jwt
func (o *Operator) UserValidateJWT(token string, salt string) (jwt.MapClaims, error) {
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, isValid := token.Method.(*jwt.SigningMethodHMAC); !isValid {
			return nil, fmt.Errorf("invalid token %s", token.Header["alg"])
		}
		return []byte(salt), nil
	})

	if err != nil {
		log.Print("USER JWT ERROR: ", err)
		return nil, errors.New("invalid Token")
	}

	if !tkn.Valid {
		return nil, errors.New("invalid Token")
	}

	claims, ok := tkn.Claims.(jwt.MapClaims)
	if ok {
		return claims, nil
	}

	return nil, errors.New("invalid Token")
}

// GetUsername returns the username from the jwt token
func (o *Operator) GetUsername(token string) (string, error) {
	salt, err := o.authConfigOperator.GetAuthConfig(context.Background())
	if err != nil {
		return "", err
	}
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(salt.Value), nil
	})

	if err != nil {
		log.Print("USER JWT ERROR: ", err)
		return "", errors.New("invalid Token")
	}

	claims, ok := tkn.Claims.(jwt.MapClaims)
	if ok {
		return claims["username"].(string), nil
	}

	return "", errors.New("invalid Token")
}
