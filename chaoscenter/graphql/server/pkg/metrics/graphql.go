package metrics

import (
	"context"
	"sync"

	"github.com/99designs/gqlgen/graphql"
)

type operationMetricsKey struct{}

// Share labels with the HTTP middleware: values added to gqlgen's child context
// cannot be read back from the original request context. The lock also protects
// access when a WebSocket transport processes operations in separate goroutines.
type operationMetrics struct {
	mu            sync.Mutex
	name          string
	operationType string
}

// GraphQLOperationMiddleware tracks GraphQL operation details for request metrics.
func GraphQLOperationMiddleware(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
	oc := graphql.GetOperationContext(ctx)
	operationType := "query"
	if oc.Operation != nil && oc.Operation.Operation == "mutation" {
		operationType = "mutation"
	}
	operationName := oc.OperationName
	if operationName == "" {
		operationName = "anonymous"
	}

	if operation, ok := ctx.Value(operationMetricsKey{}).(*operationMetrics); ok {
		operation.mu.Lock()
		operation.name = operationName
		operation.operationType = operationType
		operation.mu.Unlock()
	}

	return next(ctx)
}
