package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
)

var (
	// API request metrics
	APIRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_api_requests_total",
			Help: "Total number of API requests",
		},
		[]string{"endpoint", "status", "operation_name", "operation_type"},
	)

	// API response time metrics
	APIResponseTime = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "litmus_api_response_time_milliseconds",
			Help:    "API response time in milliseconds",
			Buckets: []float64{10, 50, 100, 200, 500, 1000, 2000, 5000},
		},
		[]string{"endpoint", "operation_name", "operation_type"},
	)

	// API error metrics
	APIErrorRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_api_error_requests_total",
			Help: "Total number of API errors",
		},
		[]string{"endpoint", "error_type"},
	)

	// Authentication failure metrics
	AuthenticationFailuresTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_api_authentication_failures_total",
			Help: "Total number of authentication failures",
		},
		[]string{"auth_method"},
	)

	// Experiment metrics
	ExperimentsTotal = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "litmus_experiments_total",
			Help: "Total number of experiments",
		},
		[]string{"project_id", "status", "infra_id"},
	)

	ExperimentRunsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_experiment_runs_total",
			Help: "Total number of experiment runs",
		},
		[]string{"project_id", "experiment_id", "experiment_name", "infra_id"},
	)

	ExperimentRunDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "litmus_experiment_run_duration_seconds",
			Help:    "Experiment run duration in seconds",
			Buckets: []float64{1, 5, 10, 30, 60, 120, 300, 600, 1200, 1800},
		},
		[]string{"project_id", "experiment_id", "experiment_name", "infra_id"},
	)

	// ExperimentStatus tracks the current status of experiment runs.
	// Value 0 = started, 1 = completed. The status label holds the phase string (e.g. "Running", "Completed").
	ExperimentStatus = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "litmus_experiment_status",
			Help: "Status of experiment runs: 0 = started, 1 = completed",
		},
		[]string{"project_id", "experiment_id", "experiment_name", "status", "infra_id"},
	)

	// Agent metrics
	ConnectedAgents = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "litmus_connected_agents",
			Help: "Number of connected chaos agents",
		},
		[]string{"project_id"},
	)

	DisconnectedAgents = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "litmus_disconnected_agents",
			Help: "Number of disconnected agents",
		},
		[]string{"project_id"},
	)

	TotalAgents = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "litmus_total_agents",
			Help: "Total number of registered agents",
		},
		[]string{"project_id"},
	)
)

func init() {
	// Manually register all metrics with Prometheus
	prometheus.MustRegister(APIRequestsTotal)
	prometheus.MustRegister(APIResponseTime)
	prometheus.MustRegister(APIErrorRequestsTotal)
	prometheus.MustRegister(AuthenticationFailuresTotal)
	prometheus.MustRegister(ExperimentsTotal)
	prometheus.MustRegister(ExperimentRunsTotal)
	prometheus.MustRegister(ExperimentRunDuration)
	prometheus.MustRegister(ExperimentStatus)
	prometheus.MustRegister(ConnectedAgents)
	prometheus.MustRegister(DisconnectedAgents)
	prometheus.MustRegister(TotalAgents)
}