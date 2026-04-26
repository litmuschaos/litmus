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

                // Try to get GraphQL operation details from context
                operationName := "N/A"
                operationType := "N/A"
                
                if opName := c.Request.Context().Value("graphql_operation_name"); opName != nil {
                        if name, ok := opName.(string); ok {
                                operationName = name
                        }
                }
                if opType := c.Request.Context().Value("graphql_operation_type"); opType != nil {
                        if opTypeStr, ok := opType.(string); ok {
                                operationType = opTypeStr
                        }
                }

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
