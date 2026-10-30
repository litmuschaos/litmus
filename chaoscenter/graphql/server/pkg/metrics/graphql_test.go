package metrics

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"sync"
	"testing"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/testutil"
	dto "github.com/prometheus/client_model/go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/vektah/gqlparser/v2"
	"github.com/vektah/gqlparser/v2/ast"
)

func TestGraphQLOperationMetrics(t *testing.T) {
	gin.SetMode(gin.TestMode)
	schema := gqlparser.MustLoadSchema(&ast.Source{Input: `
		type Query { status: String! }
		type Mutation { run: String! }
	`})
	server := handler.New(&graphql.ExecutableSchemaMock{
		SchemaFunc: func() *ast.Schema { return schema },
		ComplexityFunc: func(string, string, int, map[string]interface{}) (int, bool) {
			return 0, false
		},
		ExecFunc: func(ctx context.Context) graphql.ResponseHandler {
			if graphql.GetOperationContext(ctx).Operation.Operation == ast.Mutation {
				return graphql.OneShot(&graphql.Response{Data: []byte(`{"run":"ok"}`)})
			}
			return graphql.OneShot(&graphql.Response{Data: []byte(`{"status":"ok"}`)})
		},
	})
	server.AddTransport(transport.POST{})
	server.AroundOperations(GraphQLOperationMiddleware)

	tests := []struct {
		name          string
		query         string
		operationName string
		wantName      string
		wantType      string
		wantStatus    int
	}{
		{"named query", "query Health { status }", "Health", "Health", "query", http.StatusOK},
		{"named mutation", "mutation Run { run }", "Run", "Run", "mutation", http.StatusOK},
		{"anonymous query", "{ status }", "", "anonymous", "query", http.StatusOK},
		{"anonymous mutation", "mutation { run }", "", "anonymous", "mutation", http.StatusOK},
		{"selected operation", "query Health { status } mutation Run { run }", "Run", "Run", "mutation", http.StatusOK},
		{"invalid query", "{ missingField }", "", "N/A", "N/A", http.StatusUnprocessableEntity},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			endpoint := "/" + t.Name()
			router := gin.New()
			router.Use(MetricsMiddleware())
			router.POST(endpoint, gin.WrapH(server))

			status := strconv.Itoa(tt.wantStatus)
			t.Cleanup(func() {
				APIRequestsTotal.DeleteLabelValues(endpoint, status, tt.wantName, tt.wantType)
				APIRequestsTotal.DeleteLabelValues(endpoint, status, "N/A", "N/A")
				APIResponseTime.DeleteLabelValues(endpoint, tt.wantName, tt.wantType)
				APIResponseTime.DeleteLabelValues(endpoint, "N/A", "N/A")
				APIErrorRequestsTotal.DeleteLabelValues(endpoint, "client_error")
			})
			requestBody, err := json.Marshal(map[string]string{"query": tt.query, "operationName": tt.operationName})
			require.NoError(t, err)
			request := httptest.NewRequest(http.MethodPost, endpoint, bytes.NewReader(requestBody))
			request.Header.Set("Content-Type", "application/json")
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)

			assert.Equal(t, tt.wantStatus, response.Code, response.Body.String())
			assert.Equal(t, float64(1), testutil.ToFloat64(APIRequestsTotal.WithLabelValues(endpoint, status, tt.wantName, tt.wantType)))
			histogram := &dto.Metric{}
			require.NoError(t, APIResponseTime.WithLabelValues(endpoint, tt.wantName, tt.wantType).(prometheus.Metric).Write(histogram))
			assert.Equal(t, uint64(1), histogram.GetHistogram().GetSampleCount())
			if tt.wantName != "N/A" {
				assert.Zero(t, testutil.ToFloat64(APIRequestsTotal.WithLabelValues(endpoint, status, "N/A", "N/A")))
			}
		})
	}

	t.Run("concurrent requests", func(t *testing.T) {
		endpoint := "/" + t.Name()
		router := gin.New()
		router.Use(MetricsMiddleware())
		router.POST(endpoint, gin.WrapH(server))

		var requests sync.WaitGroup
		for i := 0; i < 20; i++ {
			name := fmt.Sprintf("Operation%d", i)
			operationType, field := "query", "status"
			if i%2 != 0 {
				operationType, field = "mutation", "run"
			}
			body, err := json.Marshal(map[string]string{
				"query":         fmt.Sprintf("%s %s { %s }", operationType, name, field),
				"operationName": name,
			})
			require.NoError(t, err)
			t.Cleanup(func() {
				APIRequestsTotal.DeleteLabelValues(endpoint, "200", name, operationType)
				APIResponseTime.DeleteLabelValues(endpoint, name, operationType)
			})

			requests.Add(1)
			go func() {
				defer requests.Done()
				request := httptest.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
				request.Header.Set("Content-Type", "application/json")
				response := httptest.NewRecorder()
				router.ServeHTTP(response, request)
				assert.Equal(t, http.StatusOK, response.Code, response.Body.String())
			}()
		}
		requests.Wait()

		for i := 0; i < 20; i++ {
			name := fmt.Sprintf("Operation%d", i)
			operationType := "query"
			if i%2 != 0 {
				operationType = "mutation"
			}
			assert.Equal(t, float64(1), testutil.ToFloat64(APIRequestsTotal.WithLabelValues(endpoint, "200", name, operationType)))
			histogram := &dto.Metric{}
			require.NoError(t, APIResponseTime.WithLabelValues(endpoint, name, operationType).(prometheus.Metric).Write(histogram))
			assert.Equal(t, uint64(1), histogram.GetHistogram().GetSampleCount())
		}
	})
}

func TestGraphQLOperationMiddlewareWithoutHTTPMetrics(t *testing.T) {
	ctx := graphql.WithOperationContext(context.Background(), &graphql.OperationContext{
		OperationName: "Health",
		Operation:     &ast.OperationDefinition{Operation: ast.Query},
	})
	called := false
	response := GraphQLOperationMiddleware(ctx, func(nextCtx context.Context) graphql.ResponseHandler {
		called = true
		assert.Equal(t, ctx, nextCtx)
		return graphql.OneShot(&graphql.Response{Data: []byte(`{"status":"ok"}`)})
	})
	assert.True(t, called)
	assert.JSONEq(t, `{"status":"ok"}`, string(response(ctx).Data))
}
