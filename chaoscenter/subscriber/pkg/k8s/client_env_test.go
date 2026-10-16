package k8s

import "testing"

func TestGetEnvOrDefault(t *testing.T) {
	t.Setenv("INFRA_CONFIG_NAME", "")
	if got := getEnvOrDefault("INFRA_CONFIG_NAME", "subscriber-config"); got != "subscriber-config" {
		t.Errorf("unset: got %q, want the default", got)
	}

	t.Setenv("INFRA_CONFIG_NAME", "subscriber-config-v2")
	if got := getEnvOrDefault("INFRA_CONFIG_NAME", "subscriber-config"); got != "subscriber-config-v2" {
		t.Errorf("set: got %q, want the override", got)
	}
}
