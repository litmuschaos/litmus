package chaos_infrastructure

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/utils"
)

// InfraCreateJWT generates jwt used in chaos_infra registration
func InfraCreateJWT(id string) (string, error) {
	claims := jwt.MapClaims{}
	claims["chaos_infra_id"] = id
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(utils.Config.JwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// InfraValidateJWT validates the chaos_infra jwt
func InfraValidateJWT(token string) (string, error) {
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
		return "", errors.New("invalid chaos_infra jwt token")
	}

	claims, ok := tkn.Claims.(jwt.MapClaims)
	if ok {
		return claims["chaos_infra_id"].(string), nil
	}

	return "", errors.New("invalid Token")
}
