package telemetry

import (
	"context"
	"testing"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/testutil"
	"go.mongodb.org/mongo-driver/event"
)

// TestNormalizeCommand verifies known commands pass through
// and unknown commands are bucketed as "other".
func TestNormalizeCommand(t *testing.T) {
	known := []string{"find", "insert", "update", "delete", "aggregate", "count", "distinct"}
	for _, cmd := range known {
		if got := normalizeCommand(cmd); got != cmd {
			t.Errorf("normalizeCommand(%q) = %q, want %q", cmd, got, cmd)
		}
	}
	for _, cmd := range []string{"listCollections", "ping", "hello", "buildInfo"} {
		if got := normalizeCommand(cmd); got != "other" {
			t.Errorf("normalizeCommand(%q) = %q, want \"other\"", cmd, got)
		}
	}
}

// TestRegisterMetricsTwice verifies sync.Once prevents double registration panics.
func TestRegisterMetricsTwice(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("RegisterMetrics panicked on second call: %v", r)
		}
	}()
	RegisterMetrics()
	RegisterMetrics() // must not panic
}

// newTestMetrics creates an isolated set of metrics backed by a private registry
// so tests don't interfere with the package-level sync.Once-guarded metrics.
func newTestMetrics() (*prometheus.GaugeVec, *prometheus.CounterVec, *prometheus.HistogramVec, *event.CommandMonitor) {
	reg := prometheus.NewRegistry()

	inFlight := prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "test_litmus_mongo_in_flight_commands",
		Help: "Test gauge for in-flight MongoDB commands",
	}, []string{"command"})

	total := prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "test_litmus_mongo_command_total",
		Help: "Test counter for total MongoDB commands",
	}, []string{"command", "status"})

	duration := prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "test_litmus_mongo_command_duration_seconds",
		Help:    "Test histogram for MongoDB command duration",
		Buckets: prometheus.DefBuckets,
	}, []string{"command", "status"})

	reg.MustRegister(inFlight, total, duration)

	monitor := &event.CommandMonitor{
		Started: func(ctx context.Context, evt *event.CommandStartedEvent) {
			cmd := normalizeCommand(evt.CommandName)
			inFlight.WithLabelValues(cmd).Inc()
		},
		Succeeded: func(ctx context.Context, evt *event.CommandSucceededEvent) {
			cmd := normalizeCommand(evt.CommandName)
			inFlight.WithLabelValues(cmd).Dec()
			duration.WithLabelValues(cmd, "success").Observe(evt.Duration.Seconds())
			total.WithLabelValues(cmd, "success").Inc()
		},
		Failed: func(ctx context.Context, evt *event.CommandFailedEvent) {
			cmd := normalizeCommand(evt.CommandName)
			inFlight.WithLabelValues(cmd).Dec()
			duration.WithLabelValues(cmd, "failed").Observe(evt.Duration.Seconds())
			total.WithLabelValues(cmd, "failed").Inc()
		},
	}

	return inFlight, total, duration, monitor
}

// TestMonitorHandlers checks that Started/Succeeded/Failed correctly adjust
// the in-flight gauge and counters at each step.
func TestMonitorHandlers(t *testing.T) {
	inFlight, total, _, monitor := newTestMetrics()
	ctx := context.Background()

	startEvt := &event.CommandStartedEvent{CommandName: "find"}

	// After Started: in-flight should be 1.
	monitor.Started(ctx, startEvt)
	if got := testutil.ToFloat64(inFlight.WithLabelValues("find")); got != 1 {
		t.Errorf("after Started: in-flight gauge = %v, want 1", got)
	}

	succeededEvt := &event.CommandSucceededEvent{
		CommandFinishedEvent: event.CommandFinishedEvent{
			CommandName: "find",
			Duration:    10 * time.Millisecond,
		},
	}

	// After Succeeded: in-flight back to 0, success counter = 1.
	monitor.Succeeded(ctx, succeededEvt)
	if got := testutil.ToFloat64(inFlight.WithLabelValues("find")); got != 0 {
		t.Errorf("after Succeeded: in-flight gauge = %v, want 0", got)
	}
	if got := testutil.ToFloat64(total.WithLabelValues("find", "success")); got != 1 {
		t.Errorf("after Succeeded: success counter = %v, want 1", got)
	}

	// Start a second command so the gauge doesn't go negative when Failed decrements.
	monitor.Started(ctx, startEvt)
	if got := testutil.ToFloat64(inFlight.WithLabelValues("find")); got != 1 {
		t.Errorf("after second Started: in-flight gauge = %v, want 1", got)
	}

	failedEvt := &event.CommandFailedEvent{
		CommandFinishedEvent: event.CommandFinishedEvent{
			CommandName: "find",
			Duration:    5 * time.Millisecond,
		},
	}

	// After Failed: in-flight back to 0, failed counter = 1.
	monitor.Failed(ctx, failedEvt)
	if got := testutil.ToFloat64(inFlight.WithLabelValues("find")); got != 0 {
		t.Errorf("after Failed: in-flight gauge = %v, want 0", got)
	}
	if got := testutil.ToFloat64(total.WithLabelValues("find", "failed")); got != 1 {
		t.Errorf("after Failed: failed counter = %v, want 1", got)
	}
}
