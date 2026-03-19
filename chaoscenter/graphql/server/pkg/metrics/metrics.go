package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
)

var (
	// APIRequestsTotal tracks total API requests
	APIRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_api_requests_total",
			Help: "Total number of API requests",
		},
		[]string{"endpoint", "status"},
	)

	// APIResponseTime tracks API response duration
	APIResponseTime = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "litmus_api_response_time_milliseconds",
			Help:    "API response time in milliseconds",
			Buckets: []float64{10, 50, 100, 200, 500, 1000, 2000, 5000},
		},
		[]string{"endpoint"},
	)

	// APIErrorRequestsTotal tracks API errors
	APIErrorRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_api_error_requests_total",
			Help: "Total number of API errors",
		},
		[]string{"endpoint", "error_type"},
	)
)

func init() {
	// Manually register all metrics
	prometheus.MustRegister(APIRequestsTotal)
	prometheus.MustRegister(APIResponseTime)
	prometheus.MustRegister(APIErrorRequestsTotal)
}
