package middleware

import (
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"litmus/litmus-portal/authentication/api/presenter"
	"litmus/litmus-portal/authentication/pkg/utils"
)

func JwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		const BearerSchema = "Bearer "
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorised], presenter.CreateErrorResponse(utils.ErrUnauthorised))
			return
		}
		tokenString := authHeader[len(BearerSchema):]
		token, err := validateToken(tokenString)
		if token.Valid {
			claims := token.Claims.(jwt.MapClaims)
			fmt.Println(claims)
			c.Set("username", claims["username"])
			c.Set("uid", claims["uid"])
			c.Set("role", claims["role"])
			c.Next()
		} else {
			fmt.Println(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorised], presenter.CreateErrorResponse(utils.ErrUnauthorised))
			return
		}
	}
}

func validateToken(encodedToken string) (*jwt.Token, error) {
	return jwt.Parse(encodedToken, func(token *jwt.Token) (interface{}, error) {
		if _, isValid := token.Method.(*jwt.SigningMethodHMAC); !isValid {
			return nil, fmt.Errorf("invalid token %s", token.Header["alg"])
		}
		return []byte(utils.JwtSecret), nil
	})

}
