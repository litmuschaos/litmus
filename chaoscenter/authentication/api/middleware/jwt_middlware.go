package middleware

import (
	"fmt"
	"litmus/litmus-portal/authentication/api/presenter"
	"litmus/litmus-portal/authentication/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/sirupsen/logrus"
)

//JwtMiddleware is a Gin Middleware that authorises requests
func JwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		const BearerSchema = "Bearer "
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
		tokenString := authHeader[len(BearerSchema):]
		token, err := ValidateToken(tokenString)
		if token.Valid {
			claims := token.Claims.(jwt.MapClaims)
			c.Set("username", claims["username"])
			c.Set("uid", claims["uid"])
			c.Set("role", claims["role"])
			c.Next()
		} else {
			logrus.Info(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
	}
}

//ValidateToken validates the given JWT Token
func ValidateToken(encodedToken string) (*jwt.Token, error) {
	return jwt.Parse(encodedToken, func(token *jwt.Token) (interface{}, error) {
		if _, isValid := token.Method.(*jwt.SigningMethodHMAC); !isValid {
			return nil, fmt.Errorf("invalid token %s", token.Header["alg"])
		}
		return []byte(utils.JwtSecret), nil
	})

}
