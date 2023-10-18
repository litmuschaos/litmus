package authorization

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type contextKey string

const (
	AuthKey      = contextKey("authorization")
	UserClaim    = contextKey("user-claims")
	BearerSchema = "Bearer "
	CookieName   = "token"
)

// Middleware verifies jwt and checks if user has enough privilege to access route (no roles' info needed)
func Middleware(handler http.Handler, mongoClient *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		jwt := ""
		if c.Request.Header.Get("Authorization") != "" {
			jwt = c.Request.Header.Get("Authorization")
		}
		if strings.HasPrefix(jwt, BearerSchema) {
			jwt = jwt[len(BearerSchema):]
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

// IsRevokedToken checks if the given JWT Token is revoked
func IsRevokedToken(tokenString string, mongoClient *mongo.Client) bool {
	collection := mongoClient.Database("auth").Collection("revoked-token")
	if err := collection.FindOne(context.Background(), bson.M{
		"token": tokenString,
	}).Err(); err != nil {
		return false
	}
	return true
}
