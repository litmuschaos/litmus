package rest_handlers

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// LoggingMiddleware is a middleware that logs the request as it goes in and the response as it goes out.
func LoggingMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		startTime := time.Now() // Starting time request
		ctx.Next()              // Processing request
		endTime := time.Now()   // End Time request

		clientIP := ctx.ClientIP()
		escapedClientIP := strings.Replace(clientIP, "\n", "", -1)
		escapedClientIP = strings.Replace(escapedClientIP, "\r", "", -1)

		log.WithFields(log.Fields{
			"method":   ctx.Request.Method,     // request method
			"uri":      ctx.Request.RequestURI, // request uri
			"status":   ctx.Writer.Status(),    //status code
			"latency":  endTime.Sub(startTime), // execution time
			"clientIP": escapedClientIP,        // request ip
		}).Info("http request")

		ctx.Next()
	}
}
