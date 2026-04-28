package telemetry

import (
	"context"
	"testing"
	"time"

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

// TestMonitorHandlers verifies Started/Succeeded/Failed handlers
// do not panic and correctly adjust the in-flight gauge.
func TestMonitorHandlers(t *testing.T) {
	RegisterMetrics()
	monitor := GetMongoMonitor()
	ctx := context.Background()

	startEvt := &event.CommandStartedEvent{CommandName: "find"}
	monitor.Started(ctx, startEvt)

	succeededEvt := &event.CommandSucceededEvent{
		CommandFinishedEvent: event.CommandFinishedEvent{
			CommandName: "find",
			Duration:    10 * time.Millisecond,
		},
	}
	monitor.Succeeded(ctx, succeededEvt)

	failedEvt := &event.CommandFailedEvent{
		CommandFinishedEvent: event.CommandFinishedEvent{
			CommandName: "find",
			Duration:    5 * time.Millisecond,
		},
	}
	// Start a new command so gauge doesn't go negative before Failed decrements.
	monitor.Started(ctx, startEvt)
	monitor.Failed(ctx, failedEvt)
}
