package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/api/presenter"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/services"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"
	log "github.com/sirupsen/logrus"
)

// JwtMiddleware is a Gin Middleware that authorises requests
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
		if err != nil {
			log.Error(err)
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
		if token.Valid {
			claims := token.Claims.(jwt.MapClaims)
			c.Set("username", claims["username"])
			c.Set("uid", claims["uid"])
			c.Set("role", claims["role"])
			c.Next()
		} else {
			c.AbortWithStatusJSON(utils.ErrorStatusCodes[utils.ErrUnauthorized], presenter.CreateErrorResponse(utils.ErrUnauthorized))
			return
		}
	}
}
