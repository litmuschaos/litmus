package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// APIRequestsTotal tracks total API requests
	APIRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_api_requests_total",
			Help: "Total number of API requests",
		},
		[]string{"endpoint", "status"},
	)

	// APIResponseTime tracks API response duration
	APIResponseTime = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "litmus_api_response_time_seconds",
			Help:    "API response time in seconds",
			Buckets: []float64{0.1, 0.5, 1, 2, 5},
		},
		[]string{"endpoint"},
	)

	// APIErrorRequestsTotal tracks API errors
	APIErrorRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_api_error_requests_total",
			Help: "Total number of API errors",
		},
		[]string{"endpoint", "error_type"},
	)
)
