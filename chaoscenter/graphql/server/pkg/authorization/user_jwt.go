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

// UserValidateJWT validates the cluster jwt
func UserValidateJWT(token string, salt string) (jwt.MapClaims, error) {
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
func GetUsername(token string) (string, error) {
	salt, err := authConfig.NewAuthConfigOperator(mongodb.Operator).GetAuthConfig(context.Background())
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
