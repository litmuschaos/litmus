package handlers_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/handlers"
)

var (
	realMongoAvailable bool
	originalClient     *mongo.Client
	originalOperator   mongodb.MongoOperator
	realMongoClient    *mongo.Client
)

func TestMain(m *testing.M) {
	// Save original values
	originalClient = mongodb.MgoClient
	originalOperator = mongodb.Operator

	// Try to connect to real MongoDB for comprehensive testing
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err == nil {
		// Try to ping to verify connection
		if err := client.Ping(ctx, nil); err == nil {
			realMongoAvailable = true
			realMongoClient = client
			// Set the raw client that handlers use
			mongodb.MgoClient = client
			// Note: We keep the original Operator since it accesses MgoClient through the interface
		} else {
			client.Disconnect(ctx)
		}
	}

	// Run tests
	code := m.Run()

	// Cleanup
	if realMongoAvailable && mongodb.MgoClient != nil && mongodb.MgoClient != originalClient {
		mongodb.MgoClient.Disconnect(context.Background())
	}

	// Restore original values
	mongodb.MgoClient = originalClient
	mongodb.Operator = originalOperator

	os.Exit(code)
}

func GetTestGinContext(w *httptest.ResponseRecorder) *gin.Context {
	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = &http.Request{
		Header: make(http.Header),
	}
	return ctx
}

// setupDeadConnection initializes MongoDB client pointing to non-existent server
// This simulates database unreachable scenario
func setupDeadConnection() {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	// Connect to non-existent MongoDB server (port 27099)
	client, _ := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27099").
		SetServerSelectionTimeout(100*time.Millisecond).
		SetConnectTimeout(100*time.Millisecond))

	// Set the raw client - Operator will use this through MgoClient
	mongodb.MgoClient = client
}

func TestReadinessHandler_AllScenarios(t *testing.T) {
	tests := []struct {
		name           string
		setup          func()
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "Database unreachable returns 503",
			setup: func() {
				setupDeadConnection()
			},
			expectedStatus: http.StatusServiceUnavailable,
			expectedBody:   `"database":"down"`,
		},
	}

	// Add test for healthy database if MongoDB is available
	if realMongoAvailable {
		tests = append(tests, struct {
			name           string
			setup          func()
			expectedStatus int
			expectedBody   string
		}{
			name: "Database up with litmus returns 200",
			setup: func() {
				// Restore the real MongoDB connection
				mongodb.MgoClient = realMongoClient
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `"database":"up"`,
		})
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setup != nil {
				tt.setup()
			}

			w := httptest.NewRecorder()
			ctx := GetTestGinContext(w)

			handlers.ReadinessHandler()(ctx)

			assert.Equal(t, tt.expectedStatus, w.Code,
				"Expected status %d, got %d. Response: %s", tt.expectedStatus, w.Code, w.Body.String())
			assert.Contains(t, w.Body.String(), tt.expectedBody)
			assert.Contains(t, w.Body.String(), "database") // Always has database field
		})
	}
}

func TestStatusHandler_AllScenarios(t *testing.T) {
	tests := []struct {
		name           string
		setup          func()
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "Database unreachable returns 503",
			setup: func() {
				setupDeadConnection()
			},
			expectedStatus: http.StatusServiceUnavailable,
			expectedBody:   `"status":"down"`,
		},
	}

	// Add test for healthy database if MongoDB is available
	if realMongoAvailable {
		tests = append(tests, struct {
			name           string
			setup          func()
			expectedStatus int
			expectedBody   string
		}{
			name: "Database up returns 200",
			setup: func() {
				// Restore the real MongoDB connection
				mongodb.MgoClient = realMongoClient
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `"status":"up"`,
		})
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setup != nil {
				tt.setup()
			}

			w := httptest.NewRecorder()
			ctx := GetTestGinContext(w)

			handlers.StatusHandler()(ctx)

			assert.Equal(t, tt.expectedStatus, w.Code,
				"Expected status %d, got %d. Response: %s", tt.expectedStatus, w.Code, w.Body.String())
			assert.Contains(t, w.Body.String(), tt.expectedBody)
			assert.Contains(t, w.Body.String(), "status") // Always has status field
		})
	}
}
