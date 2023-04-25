package authorization

import (
	"errors"
	"fmt"
	"log"

	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

// UserValidateJWT validates the cluster jwt
func UserValidateJWT(token string) (jwt.MapClaims, error) {
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if ok := token.Method.Alg() == jwt.SigningMethodHS512.Alg(); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(utils.Config.JwtSecret), nil
	})

	if err != nil {
		log.Print("USER JWT ERROR: ", err)
		return nil, errors.New("Invalid Token")
	}

	if !tkn.Valid {
		return nil, errors.New("Invalid Token")
	}

	claims, ok := tkn.Claims.(jwt.MapClaims)
	if ok {
		return claims, nil
	}

	return nil, errors.New("Invalid Token")
}

// GetUsername returns the username from the jwt token
func GetUsername(token string) (string, error) {
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(utils.Config.JwtSecret), nil
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