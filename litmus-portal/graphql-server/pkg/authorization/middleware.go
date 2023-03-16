package authorization

import (
	"context"
	"github.com/gin-gonic/gin"
	"net/http"

	"github.com/sirupsen/logrus"
)

type contextKey string

const (
	AuthKey    = contextKey("authorization")
	UserClaim  = contextKey("user-claims")
	CookieName = "litmus-cc-token"
)

// Middleware verifies jwt and checks if user has enough privilege to access route (no roles' info needed)
func Middleware(handler http.Handler) gin.HandlerFunc {
	return func(c *gin.Context) {
		jwt := ""
		auth, err := c.Request.Cookie(CookieName)
		if err == nil {
			jwt = auth.Value
		} else if c.Request.Header.Get("Authorization") != "" {
			jwt = c.Request.Header.Get("Authorization")
		}

		ctx := context.WithValue(c.Request.Context(), AuthKey, jwt)
		c.Request = c.Request.WithContext(ctx)
		handler.ServeHTTP(c.Writer, c.Request)
	}
}

// RestMiddlewareWithRole verifies jwt and checks if user has enough privilege to access route
func RestMiddlewareWithRole(handler gin.HandlerFunc, roles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		jwt := ""
		auth, err := c.Request.Cookie(CookieName)
		if err == nil {
			jwt = auth.Value
		} else if c.Request.Header.Get("Authorization") != "" {
			jwt = c.Request.Header.Get("Authorization")
		}
		user, err := UserValidateJWT(jwt)
		if err != nil {
			logrus.WithError(err).Error("Invalid Auth Cookie")
			c.Writer.WriteHeader(http.StatusUnauthorized)
			c.Writer.Write([]byte("Error verifying JWT token: " + err.Error()))
			return
		}
		if len(roles) == 0 {
			handler(c)
			return
		}
		for _, role := range roles {
			if role == user["role"] {
				handler(c)
				return
			}
		}
		c.Writer.WriteHeader(http.StatusUnauthorized)
		return
	}
}
