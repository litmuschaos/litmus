package k8s

import (
	"fmt"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
)

func FuzzUpdateLabels(f *testing.F) {
	f.Add([]byte("app.kubernetes.io/name\x00test\x00"))
	f.Add([]byte{})     // empty case
	f.Add([]byte{0x00}) // empty string seed

	// Fuzz test the updateLabels function
	f.Fuzz(func(t *testing.T, data []byte) {
		c := fuzz.NewConsumer(data)
		labels := make(map[string]string)

		n, _ := c.GetInt()

		// Set max iteration
		maxInterations := n
		if maxInterations < 0 {
			maxInterations = -n
		}
		if maxInterations > 50 {
			maxInterations = 50
		}

		for i := 0; i < maxInterations; i++ {
			// Generate random key and values
			key, _ := c.GetString()
			value, _ := c.GetString()
			labels[key] = value
		}

		// Test normal map
		assertUpdateLabels(t, labels)

		// Explicitly test nil — fuzzer can never generate this, so testing it directly
		assertUpdateLabels(t, nil)
	})
}

func assertUpdateLabels(t *testing.T, labels map[string]string) {
	t.Helper()
	got := (&k8sSubscriber{}).updateLabels(labels)

	if labels == nil {
		if len(got) != 0 {
			t.Fatalf("Expected empty slice for nil input, got %v", got)
		}
		return
	}

	if len(got) != len(labels) {
		t.Fatalf("Got %d labels, expected %d. labels=%v got=%v", len(got), len(labels), labels, got)
	}

	// Every key=value must appear exactly once
	seen := make(map[string]bool)
	for _, item := range got {
		if seen[item] {
			t.Fatalf("Duplicate entry in output: %q", item)
		}
		seen[item] = true
	}

	// Every input label must be present
	for k, v := range labels {
		expected := fmt.Sprintf("%s=%s", k, v)
		if !seen[expected] {
			t.Fatalf("Expected %q not found in output %v", expected, got)
		}
	}
}
