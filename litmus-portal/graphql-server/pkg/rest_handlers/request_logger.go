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

		replacer := strings.NewReplacer("\n", "", "\r", "")

		log.WithFields(log.Fields{
			"method":   replacer.Replace(ctx.Request.Method),     // request method
			"uri":      replacer.Replace(ctx.Request.RequestURI), // request uri
			"status":   ctx.Writer.Status(),                      //status code
			"latency":  endTime.Sub(startTime),                   // execution time
			"clientIP": replacer.Replace(ctx.ClientIP()),         // request ip
		}).Info("http request")

		ctx.Next()
	}
}
