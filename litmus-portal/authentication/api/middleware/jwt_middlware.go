package middleware

import (
	"litmus/litmus-portal/authentication/api/presenter"
	"litmus/litmus-portal/authentication/pkg/services"
	"litmus/litmus-portal/authentication/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/sirupsen/logrus"
)

//JwtMiddleware is a Gin Middleware that authorises requests
func JwtMiddleware(service services.ApplicationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		const BearerSchema = "Bearer "
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
		tokenString := authHeader[len(BearerSchema):]
		token, err := service.ValidateToken(tokenString)
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
