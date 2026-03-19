package metrics

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// MetricsMiddleware tracks request metrics
func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		// Process request
		c.Next()

		// Record metrics after request completes
		duration := time.Since(start).Milliseconds()
		status := strconv.Itoa(c.Writer.Status())

		// Increment request counter
		APIRequestsTotal.WithLabelValues(path, status).Inc()

		// Record response time in milliseconds
		APIResponseTime.WithLabelValues(path).Observe(float64(duration))

		// Track errors (status >= 400)
		if c.Writer.Status() >= 400 {
			errorType := "client_error"
			if c.Writer.Status() >= 500 {
				errorType = "server_error"
			}
			APIErrorRequestsTotal.WithLabelValues(path, errorType).Inc()
		}
	}
}
