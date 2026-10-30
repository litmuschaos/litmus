package metrics

import (
	"context"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// MetricsMiddleware tracks request metrics
func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		operation := &operationMetrics{name: "N/A", operationType: "N/A"}
		c.Request = c.Request.WithContext(context.WithValue(c.Request.Context(), operationMetricsKey{}, operation))
		start := time.Now()
		path := c.FullPath()
		if path == "" {
			path = "unmatched"
		}
		// Process request
		c.Next()

		// Record metrics after request completes
		duration := time.Since(start).Milliseconds()
		status := strconv.Itoa(c.Writer.Status())

		operation.mu.Lock()
		operationName, operationType := operation.name, operation.operationType
		operation.mu.Unlock()

		// Increment request counter with GraphQL operation details
		APIRequestsTotal.WithLabelValues(path, status, operationName, operationType).Inc()

		// Record response time with GraphQL operation details
		APIResponseTime.WithLabelValues(path, operationName, operationType).Observe(float64(duration))

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
