package metrics

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/testutil"
	"github.com/stretchr/testify/assert"
)

func TestMetricsRegistration(t *testing.T) {
	reg := prometheus.NewRegistry()
	assert.NotPanics(t, func() {
		reg.MustRegister(
			prometheus.NewCounterVec(prometheus.CounterOpts{Name: "litmus_api_requests_total", Help: "test"}, []string{"endpoint", "status", "operation_name", "operation_type"}),
			prometheus.NewHistogramVec(prometheus.HistogramOpts{Name: "litmus_api_response_time_milliseconds", Help: "test", Buckets: prometheus.DefBuckets}, []string{"endpoint", "operation_name", "operation_type"}),
			prometheus.NewCounterVec(prometheus.CounterOpts{Name: "litmus_api_error_requests_total", Help: "test"}, []string{"endpoint", "error_type"}),
			prometheus.NewCounterVec(prometheus.CounterOpts{Name: "litmus_api_authentication_failures_total", Help: "test"}, []string{"auth_method"}),
			prometheus.NewGaugeVec(prometheus.GaugeOpts{Name: "litmus_experiments_total", Help: "test"}, []string{"project_id", "status", "infra_id"}),
			prometheus.NewCounterVec(prometheus.CounterOpts{Name: "litmus_experiment_runs_total", Help: "test"}, []string{"project_id", "experiment_id", "experiment_name", "infra_id"}),
			prometheus.NewHistogramVec(prometheus.HistogramOpts{Name: "litmus_experiment_run_duration_seconds", Help: "test", Buckets: prometheus.DefBuckets}, []string{"project_id", "experiment_id", "experiment_name", "infra_id"}),
			prometheus.NewGaugeVec(prometheus.GaugeOpts{Name: "litmus_experiment_status", Help: "test"}, []string{"project_id", "experiment_id", "experiment_name", "status", "infra_id"}),
			prometheus.NewGaugeVec(prometheus.GaugeOpts{Name: "litmus_connected_agents", Help: "test"}, []string{"project_id"}),
			prometheus.NewGaugeVec(prometheus.GaugeOpts{Name: "litmus_disconnected_agents", Help: "test"}, []string{"project_id"}),
			prometheus.NewGaugeVec(prometheus.GaugeOpts{Name: "litmus_total_agents", Help: "test"}, []string{"project_id"}),
		)
	})
}

func TestAPIRequestsTotal(t *testing.T) {
	counter := prometheus.NewCounterVec(
		prometheus.CounterOpts{Name: "litmus_api_requests_total_test", Help: "test"},
		[]string{"endpoint", "status", "operation_name", "operation_type"},
	)

	counter.WithLabelValues("/query", "200", "listExperiment", "query").Inc()
	counter.WithLabelValues("/query", "200", "listExperiment", "query").Inc()
	counter.WithLabelValues("/query", "500", "runChaosExperiment", "mutation").Inc()

	assert.Equal(t, float64(2), testutil.ToFloat64(counter.WithLabelValues("/query", "200", "listExperiment", "query")))
	assert.Equal(t, float64(1), testutil.ToFloat64(counter.WithLabelValues("/query", "500", "runChaosExperiment", "mutation")))
}

func TestExperimentRunsTotal(t *testing.T) {
	counter := prometheus.NewCounterVec(
		prometheus.CounterOpts{Name: "litmus_experiment_runs_total_test", Help: "test"},
		[]string{"project_id", "experiment_id", "experiment_name", "infra_id"},
	)

	counter.WithLabelValues("proj-1", "exp-1", "pod-delete", "infra-1").Inc()
	counter.WithLabelValues("proj-1", "exp-1", "pod-delete", "infra-1").Inc()
	counter.WithLabelValues("proj-2", "exp-2", "cpu-hog", "infra-2").Inc()

	assert.Equal(t, float64(2), testutil.ToFloat64(counter.WithLabelValues("proj-1", "exp-1", "pod-delete", "infra-1")))
	assert.Equal(t, float64(1), testutil.ToFloat64(counter.WithLabelValues("proj-2", "exp-2", "cpu-hog", "infra-2")))
}

func TestExperimentStatus(t *testing.T) {
	gauge := prometheus.NewGaugeVec(
		prometheus.GaugeOpts{Name: "litmus_experiment_status_test", Help: "test"},
		[]string{"project_id", "experiment_id", "experiment_name", "status", "infra_id"},
	)

	// Experiment starts - set to 1
	gauge.WithLabelValues("proj-1", "exp-1", "pod-delete", "Running", "infra-1").Set(1)
	assert.Equal(t, float64(1), testutil.ToFloat64(gauge.WithLabelValues("proj-1", "exp-1", "pod-delete", "Running", "infra-1")))

	// Experiment completes - set to 0
	gauge.WithLabelValues("proj-1", "exp-1", "pod-delete", "Completed", "infra-1").Set(0)
	assert.Equal(t, float64(0), testutil.ToFloat64(gauge.WithLabelValues("proj-1", "exp-1", "pod-delete", "Completed", "infra-1")))
}

func TestExperimentsTotal(t *testing.T) {
	gauge := prometheus.NewGaugeVec(
		prometheus.GaugeOpts{Name: "litmus_experiments_total_test", Help: "test"},
		[]string{"project_id", "status", "infra_id"},
	)

	gauge.WithLabelValues("proj-1", "Active", "infra-1").Inc()
	gauge.WithLabelValues("proj-1", "Active", "infra-1").Inc()

	assert.Equal(t, float64(2), testutil.ToFloat64(gauge.WithLabelValues("proj-1", "Active", "infra-1")))
}

func TestAgentMetrics(t *testing.T) {
	connectedAgents := prometheus.NewGaugeVec(
		prometheus.GaugeOpts{Name: "litmus_connected_agents_test", Help: "test"},
		[]string{"project_id"},
	)
	disconnectedAgents := prometheus.NewGaugeVec(
		prometheus.GaugeOpts{Name: "litmus_disconnected_agents_test", Help: "test"},
		[]string{"project_id"},
	)
	totalAgents := prometheus.NewGaugeVec(
		prometheus.GaugeOpts{Name: "litmus_total_agents_test", Help: "test"},
		[]string{"project_id"},
	)

	connectedAgents.WithLabelValues("proj-1").Set(3)
	disconnectedAgents.WithLabelValues("proj-1").Set(1)
	totalAgents.WithLabelValues("proj-1").Set(4)

	assert.Equal(t, float64(3), testutil.ToFloat64(connectedAgents.WithLabelValues("proj-1")))
	assert.Equal(t, float64(1), testutil.ToFloat64(disconnectedAgents.WithLabelValues("proj-1")))
	assert.Equal(t, float64(4), testutil.ToFloat64(totalAgents.WithLabelValues("proj-1")))

	// Verify connected + disconnected = total
	assert.Equal(t,
		testutil.ToFloat64(connectedAgents.WithLabelValues("proj-1"))+testutil.ToFloat64(disconnectedAgents.WithLabelValues("proj-1")),
		testutil.ToFloat64(totalAgents.WithLabelValues("proj-1")),
	)
}

func TestContextKeys(t *testing.T) {
	assert.Equal(t, "graphql_operation_name", GraphqlOperationNameKey)
	assert.Equal(t, "graphql_operation_type", GraphqlOperationTypeKey)
}

func TestMetricsMiddleware_SuccessRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(MetricsMiddleware())
	router.GET("/test", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, float64(1), testutil.ToFloat64(APIRequestsTotal.WithLabelValues("/test", "200", "N/A", "N/A")))
}

func TestMetricsMiddleware_ErrorRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(MetricsMiddleware())
	router.GET("/test", func(c *gin.Context) {
		c.Status(http.StatusInternalServerError)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Equal(t, float64(1), testutil.ToFloat64(APIRequestsTotal.WithLabelValues("/test", "500", "N/A", "N/A")))
	assert.Equal(t, float64(1), testutil.ToFloat64(APIErrorRequestsTotal.WithLabelValues("/test", "server_error")))
}

func TestMetricsMiddleware_UnmatchedRoute(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(MetricsMiddleware())

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/nonexistent", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.Equal(t, float64(1), testutil.ToFloat64(APIRequestsTotal.WithLabelValues("unmatched", "404", "N/A", "N/A")))
}
