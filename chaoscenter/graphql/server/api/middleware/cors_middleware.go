package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	AllowedOrigin      string = "Access-Control-Allow-Origin"
	AllowedMethods     string = "Access-Control-Allow-Methods"
	AllowedHeaders     string = "Access-Control-Allow-Headers"
	AllowedCredentials string = "Access-Control-Allow-Credentials"
)

func ValidateCorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		//Supported origins
		//allowedOrigins := []string{"*"}

		//Fetching the origin from the request context
		origin := c.GetHeader("Origin")
		c.Writer.Header().Set(AllowedOrigin, origin)
		//Validating the origin with the supported origin regex
		//if origin != "" {
		//	validOrigin := false
		//	for _, allowedOrigin := range allowedOrigins {
		//		match, err := regexp.MatchString(allowedOrigin, origin)
		//		if err == nil && match {
		//			validOrigin = true
		//			c.Writer.Header().Set(AllowedOrigin, origin)
		//			break
		//		}
		//	}
		//
		//	//if none of the origins are valid, returning error
		//	if !validOrigin {
		//		c.JSON(http.StatusForbidden, gin.H{
		//			"error": "Invalid origin",
		//		})
		//		c.Abort()
		//		return
		//	}
		//}

		//Setting allowed methods
		c.Writer.Header().Set(AllowedMethods, strings.Join([]string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		}, ","))

		//Setting allowed headers
		c.Writer.Header().Set(AllowedHeaders, "*")

		//Setting allowed credentials
		c.Writer.Header().Set(AllowedCredentials, "true")

		c.Next()
	}
}
