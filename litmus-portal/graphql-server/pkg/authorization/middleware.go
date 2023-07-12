package authorization

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type contextKey string

const (
	AuthKey    = contextKey("authorization")
	UserClaim  = contextKey("user-claims")
	CookieName = "litmus-cc-token"
)

// Middleware verifies jwt and checks if user has enough privilege to access route (no roles' info needed)
func Middleware(handler http.Handler, mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		jwt := ""
		auth, err := c.Request.Cookie(CookieName)
		if err == nil {
			jwt = auth.Value
		} else if c.Request.Header.Get("Authorization") != "" {
			jwt = c.Request.Header.Get("Authorization")
		}
		if IsRevokedToken(jwt, mongoClient) {
			c.Writer.WriteHeader(http.StatusUnauthorized)
			c.Writer.Write([]byte("Error verifying JWT token: Token is revoked"))
			return
		}
		ctx := context.WithValue(c.Request.Context(), AuthKey, jwt)
		c.Request = c.Request.WithContext(ctx)
		handler.ServeHTTP(c.Writer, c.Request)
	}
}

// RestMiddlewareWithRole verifies jwt and checks if user has enough privilege to access route
func RestMiddlewareWithRole(handler gin.HandlerFunc, mongoClient *mongo.Client, roles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		jwt := ""
		auth, err := c.Request.Cookie(CookieName)
		if err == nil {
			jwt = auth.Value
		} else if c.Request.Header.Get("Authorization") != "" {
			jwt = c.Request.Header.Get("Authorization")
		}
		if IsRevokedToken(jwt, mongoClient) {
			c.Writer.WriteHeader(http.StatusUnauthorized)
			c.Writer.Write([]byte("Error verifying JWT token: Token is revoked"))
			return
		}
		user, err := UserValidateJWT(jwt)
		if err != nil {
			log.WithError(err).Error("invalid Auth Cookie")
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

// IsRevokedToken checks if the given JWT Token is revoked
func IsRevokedToken(tokenString string, mongoClient *mongo.Client) bool {
	collection := mongoClient.Database("auth").Collection("revoked-token")
	result := struct {
		Token     string `bson:"token"`
		ExpireOn  int64  `bson:"expire_on"`
		CreatedAt int64  `bson:"created_at"`
	}{}
	err := collection.FindOne(context.Background(), bson.M{
		"token": tokenString,
	}).Decode(&result)
	if err != nil {
		return false
	}
	return true
}
