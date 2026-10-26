package middleware

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	AllowedOrigin      string = "Access-Control-Allow-Origin"
	AllowedMethods     string = "Access-Control-Allow-Methods"
	AllowedHeaders     string = "Access-Control-Allow-Headers"
	AllowedCredentials string = "Access-Control-Allow-Credentials"
)

func ValidateCors(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin == "" {
			origin = c.Request.Host
		}

		validOrigin := false
		for _, allowedOrigin := range allowedOrigins {
			match, err := regexp.MatchString(allowedOrigin, origin)
			if err == nil && match {
				validOrigin = true
				c.Writer.Header().Set(AllowedOrigin, origin)
				break
			}
		}

		if !validOrigin {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Invalid origin",
			})
			c.Abort()
			return
		}

		c.Writer.Header().Set(AllowedMethods, strings.Join([]string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		}, ","))
		c.Writer.Header().Set(AllowedHeaders, "*")
		c.Writer.Header().Set(AllowedCredentials, "true")

		c.Next()
	}
}
