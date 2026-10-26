package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// DefaultStructuredLogger logs a gin HTTP request in JSON format. Uses the
// default logger from rs/zerolog.
func DefaultStructuredLogger() gin.HandlerFunc {
	return StructuredLogger(&logrus.Logger{})
}

// StructuredLogger logs a gin HTTP request in JSON format. Allows to set the
// logger for testing purposes.
func StructuredLogger(logger *logrus.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {

		start := time.Now() // Start timer
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Fill the params
		param := gin.LogFormatterParams{}

		param.TimeStamp = time.Now() // Stop timer
		param.Latency = param.TimeStamp.Sub(start)
		if param.Latency > time.Minute {
			param.Latency = param.Latency.Truncate(time.Second)
		}

		param.ClientIP = c.ClientIP()
		param.Method = c.Request.Method
		param.StatusCode = c.Writer.Status()
		param.ErrorMessage = c.Errors.ByType(gin.ErrorTypePrivate).String()
		param.BodySize = c.Writer.Size()
		if raw != "" {
			path = path + "?" + raw
		}
		param.Path = path

		logFields := logrus.Fields{
			"status":    param.StatusCode,
			"method":    param.Method,
			"path":      param.Path,
			"client_ip": param.ClientIP,
			"latency":   param.Latency.String(),
			"body_size": param.BodySize,
			"error":     param.ErrorMessage,
		}

		if c.Writer.Status() >= 500 {
			logrus.WithFields(logFields).Error()
		} else {
			logrus.WithFields(logFields).Info()
		}

	}
}
