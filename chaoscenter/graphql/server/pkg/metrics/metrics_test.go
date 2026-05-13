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
			APIRequestsTotal,
			APIResponseTime,
			APIErrorRequestsTotal,
			AuthenticationFailuresTotal,
			ExperimentsTotal,
			ExperimentRunsTotal,
			ExperimentRunDuration,
			ExperimentStatus,
			ConnectedAgents,
			DisconnectedAgents,
			TotalAgents,
		)
	})
}

func TestAPIRequestsTotal(t *testing.T) {
	endpointSuccess := "/query/" + t.Name()
	operationSuccess := "listExperiment_" + t.Name()
	endpointError := "/mutation/" + t.Name()
	operationError := "runChaosExperiment_" + t.Name()

	successCounter := APIRequestsTotal.WithLabelValues(endpointSuccess, "200", operationSuccess, "query")
	errorCounter := APIRequestsTotal.WithLabelValues(endpointError, "500", operationError, "mutation")

	successBefore := testutil.ToFloat64(successCounter)
	errorBefore := testutil.ToFloat64(errorCounter)

	successCounter.Inc()
	successCounter.Inc()
	errorCounter.Inc()

	assert.Equal(t, successBefore+2, testutil.ToFloat64(successCounter))
	assert.Equal(t, errorBefore+1, testutil.ToFloat64(errorCounter))
}

func TestExperimentRunsTotal(t *testing.T) {
	projectOne := "proj-1-" + t.Name()
	experimentOne := "exp-1-" + t.Name()
	experimentNameOne := "pod-delete-" + t.Name()
	infraOne := "infra-1-" + t.Name()

	projectTwo := "proj-2-" + t.Name()
	experimentTwo := "exp-2-" + t.Name()
	experimentNameTwo := "cpu-hog-" + t.Name()
	infraTwo := "infra-2-" + t.Name()

	firstRunCounter := ExperimentRunsTotal.WithLabelValues(projectOne, experimentOne, experimentNameOne, infraOne)
	secondRunCounter := ExperimentRunsTotal.WithLabelValues(projectTwo, experimentTwo, experimentNameTwo, infraTwo)

	firstBefore := testutil.ToFloat64(firstRunCounter)
	secondBefore := testutil.ToFloat64(secondRunCounter)

	firstRunCounter.Inc()
	firstRunCounter.Inc()
	secondRunCounter.Inc()

	assert.Equal(t, firstBefore+2, testutil.ToFloat64(firstRunCounter))
	assert.Equal(t, secondBefore+1, testutil.ToFloat64(secondRunCounter))
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
	assert.Equal(t, float64(1), testutil.ToFloat64(gauge.WithLabelValues("proj-1", "exp-1", "pod-delete", "Running", "infra-1")))
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
	req, err := http.NewRequest("GET", "/test", nil)
	assert.NoError(t, err)
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
	req, err := http.NewRequest("GET", "/test", nil)
	assert.NoError(t, err)
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
	req, err := http.NewRequest("GET", "/nonexistent", nil)
	assert.NoError(t, err)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.Equal(t, float64(1), testutil.ToFloat64(APIRequestsTotal.WithLabelValues("unmatched", "404", "N/A", "N/A")))
}
