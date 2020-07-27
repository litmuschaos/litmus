package cluster

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var secret = os.Getenv("SECRET")

//ClusterCreateJWT generates jwt used in cluster registration
func ClusterCreateJWT(id string) (string, error) {
	if secret == "" {
		panic("JWT SECRET NOT FOUND")
	}

	expirationTime := time.Now().Add(12 * time.Hour)
	claims := jwt.MapClaims{}
	claims["cluster_id"] = id
	claims["exp"] = expirationTime.Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

//ClusterValidateJWT validates the cluster jwt
func ClusterValidateJWT(token string) (string, error) {

	if secret == "" {
		panic("JWT SECRET NOT FOUND")
	}

	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return "", err
	}

	if !tkn.Valid {
		return "", errors.New("Invalid Token")
	}
	claims, ok := tkn.Claims.(jwt.MapClaims)
	if ok {
		return claims["cluster_id"].(string), nil
	}
	return "", errors.New("Invalid Token")
}
