package cluster

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
)

// CreateClusterJWT generates jwt used in cluster registration
func CreateClusterJWT(id string) (string, error) {
	claims := jwt.MapClaims{}
	claims["cluster_id"] = id
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(utils.Config.JwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateClusterJWT validates the cluster jwt
func ValidateClusterJWT(token string) (string, error) {
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(utils.Config.JwtSecret), nil
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
