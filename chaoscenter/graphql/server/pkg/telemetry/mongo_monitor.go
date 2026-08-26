package telemetry

import (
	"context"
	"sync"

	"github.com/prometheus/client_golang/prometheus"
	"go.mongodb.org/mongo-driver/event"
)

var (
	// MongoDuration measures the latency of MongoDB commands.
	MongoDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "litmus_mongo_command_duration_seconds",
			Help:    "Duration of MongoDB commands in seconds",
			Buckets: []float64{0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10},
		},
		[]string{"command", "status"},
	)

	// MongoTotal counts the total number of MongoDB commands.
	MongoTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "litmus_mongo_command_total",
			Help: "Total number of MongoDB commands",
		},
		[]string{"command", "status"},
	)

	// MongoInFlight tracks the number of concurrent MongoDB commands.
	MongoInFlight = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "litmus_mongo_in_flight_commands",
			Help: "Number of MongoDB commands currently in flight",
		},
		[]string{"command"},
	)

	registerOnce sync.Once
)

// RegisterMetrics ensures metrics are registered with Prometheus only once.
func RegisterMetrics() {
	registerOnce.Do(func() {
		prometheus.MustRegister(MongoDuration)
		prometheus.MustRegister(MongoTotal)
		prometheus.MustRegister(MongoInFlight)
	})
}

// GetMongoMonitor returns an event.CommandMonitor to intercept and measure MongoDB commands.
func GetMongoMonitor() *event.CommandMonitor {
	return &event.CommandMonitor{
		Started: func(ctx context.Context, evt *event.CommandStartedEvent) {
			cmd := normalizeCommand(evt.CommandName)
			MongoInFlight.WithLabelValues(cmd).Inc()
		},
		Succeeded: func(ctx context.Context, evt *event.CommandSucceededEvent) {
			cmd := normalizeCommand(evt.CommandName)
			MongoInFlight.WithLabelValues(cmd).Dec()
			MongoDuration.WithLabelValues(cmd, "success").Observe(evt.Duration.Seconds())
			MongoTotal.WithLabelValues(cmd, "success").Inc()

		},
		Failed: func(ctx context.Context, evt *event.CommandFailedEvent) {
			cmd := normalizeCommand(evt.CommandName)
			MongoInFlight.WithLabelValues(cmd).Dec()
			MongoDuration.WithLabelValues(cmd, "failed").Observe(evt.Duration.Seconds())
			MongoTotal.WithLabelValues(cmd, "failed").Inc()
		},
	}
}

// normalizeCommand groups less common commands into "other" to prevent high cardinality.
func normalizeCommand(name string) string {
	switch name {
	case "find", "insert", "update", "delete", "aggregate", "count", "distinct":
		return name
	default:
		return "other"
	}
}
