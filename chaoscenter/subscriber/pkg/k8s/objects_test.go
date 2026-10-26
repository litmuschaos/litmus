package k8s

import (
	"testing"
)

func TestUpdateLabels_nil(t *testing.T) {
	got := (&k8sSubscriber{}).updateLabels(nil)
	if len(got) != 0 {
		t.Fatalf("expected empty slice for nil input, got %v", got)
	}
}

func TestUpdateLabels_empty(t *testing.T) {
	got := (&k8sSubscriber{}).updateLabels(map[string]string{})
	if len(got) != 0 {
		t.Fatalf("expected empty slice for empty map, got %v", got)
	}
}

func TestUpdateLabels_basic(t *testing.T) {
	labels := map[string]string{
		"app.kubernetes.io/name": "subscriber",
		"env":                    "test",
	}
	got := (&k8sSubscriber{}).updateLabels(labels)

	want := []string{"app.kubernetes.io/name=subscriber", "env=test"}
	if len(got) != len(want) {
		t.Fatalf("got %d labels, want %d: %v", len(got), len(want), got)
	}

	seen := make(map[string]bool, len(got))
	for _, item := range got {
		seen[item] = true
	}
	for _, item := range want {
		if !seen[item] {
			t.Fatalf("expected %q in output %v", item, got)
		}
	}
}
