package authorization

import (
	"errors"
	"fmt"
	"log"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"

	"github.com/golang-jwt/jwt"
)

// UserValidateJWT validates the cluster jwt
func UserValidateJWT(token string) (jwt.MapClaims, error) {
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, isValid := token.Method.(*jwt.SigningMethodHMAC); !isValid {
			return nil, fmt.Errorf("invalid token %s", token.Header["alg"])
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

// GetUserID returns the GetUserID from the jwt token
func GetUserID(token string) (string, error) {
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(utils.Config.JwtSecret), nil
	})

	if err != nil {
		log.Print("USER JWT ERROR: ", err)
		return "", errors.New("invalid Token")
	}

	claims, ok := tkn.Claims.(jwt.MapClaims)
	if ok {
		return claims["uid"].(string), nil
	}

	return "", errors.New("invalid Token")
}
