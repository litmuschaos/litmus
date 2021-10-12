package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/sirupsen/logrus"
)

func GenerateOAuthJWT() (string, error) {
	token := jwt.New(jwt.SigningMethodHS512)
	claims := token.Claims.(jwt.MapClaims)
	claims["exp"] = time.Now().Add(time.Minute * time.Duration(OAuthJWTExpDuration)).Unix()
	tokenString, err := token.SignedString([]byte(OAuthJwtSecret))
	if err != nil {
		logrus.Info(err)
		return "", err
	}
	return tokenString, nil
}

func ValidateOAuthJWT(tokenString string) (bool, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, isValid := token.Method.(*jwt.SigningMethodHMAC); !isValid {
			return nil, fmt.Errorf("invalid token %s", token.Header["alg"])
		}
		return []byte(OAuthJwtSecret), nil
	})
	if err != nil {
		return false, err
	}
	if _, ok := token.Claims.(jwt.Claims); !ok && !token.Valid {
		return false, err
	}
	return true, nil
}
