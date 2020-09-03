package userManagment

import (
	"context"
	"fmt"

	"github.com/dgrijalva/jwt-go"
	"github.com/litmuschaos/litmus/litmus-portal/backend/graphql-server/pkg/usermanagement"
)

var (
	secret = "litmus-portal@123"
)

//Validation ...
func Validation(ctx context.Context, token string) bool {

	// Parsing the token
	tkn, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	// If parding containts error
	if err != nil {
		return false
	}
	// Tocken is not valid then
	if !tkn.Valid {
		return false
	}
	// Claiming using User_Name
	claims, ok := tkn.Claims.(jwt.MapClaims)

	if ok {
		userName, err := usermanagement.GetUser(ctx, claims["UserName"].(string))
		if err != nil {
			return false
		}
		claim := userName
		fmt.Println(claim)
		return true
	}
	return false
}
