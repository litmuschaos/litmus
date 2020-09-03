package authorization

import (
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/dgrijalva/jwt-go"
)

var secret = os.Getenv("JWT_SECRET")

//UserValidateJWT validates the cluster jwt
func UserValidateJWT(token string) (jwt.MapClaims, error) {
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if ok := token.Method.Alg() == jwt.SigningMethodHS512.Alg(); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
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
