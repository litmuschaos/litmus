package k8s

import (
	"fmt"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

func FuzzUpdateLabels(f *testing.F) {
	f.Add([]byte("app.kubernetes.io/name\x00test\x00"))
	f.Add([]byte{})     // empty case
	f.Add([]byte{0x00}) // empty string seed

	// Fuzz test the updateLabels function
	f.Fuzz(func(t *testing.T, data []byte) {
		c := fuzz.NewConsumer(data)
		labels := make(map[string]string)

		// Set max iterations
		n, _ := c.GetInt()
		if n < 0 {
			n = -n
		}
		if n > 50 {
			n = 50
		}

		for i := 0; i < n; i++ {
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

func FuzzAddCustomLabels(f *testing.F) {
	f.Add([]byte{})
	f.Add([]byte("existing-key\x00existing-val\x00custom-key\x00custom-val\x00"))

	f.Fuzz(func(t *testing.T, data []byte) {
		c := fuzz.NewConsumer(data)
		obj := &unstructured.Unstructured{}

		// Build existing labels
		n, _ := c.GetInt()
		if n < 0 {
			n = -n
		}
		if n > 50 {
			n = 50
		}
		existing := make(map[string]string)
		for i := 0; i < n; i++ {
			key, _ := c.GetString()
			value, _ := c.GetString()
			existing[key] = value
		}
		obj.SetLabels(existing)

		// Build custom labels
		custom := make(map[string]string)
		for i := 0; i < n; i++ {
			key, _ := c.GetString()
			value, _ := c.GetString()
			custom[key] = value
		}

		addCustomLabels(obj, custom)
		after := obj.GetLabels()

		// Check if custom labels are always present
		for k, v := range custom {
			if after[k] != v {
				t.Fatalf("custom label %q: expected %q got %q", k, v, after[k])
			}
		}

		// Check if non-overlapping existing labels are preserved
		for k, v := range existing {
			if _, overwritten := custom[k]; overwritten {
				continue
			}
			if after[k] != v {
				t.Fatalf("existing label %q was lost or changed: expected %q got %q", k, v, after[k])
			}
		}
	})
}
