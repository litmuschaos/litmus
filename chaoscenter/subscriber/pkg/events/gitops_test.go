package events

import (
	"os"
	"testing"

	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/stretchr/testify/assert"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGitOpsWorkflowID(t *testing.T) {
	obj := &chaosTypes.ChaosEngine{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: "default",
			Name:      "pod-delete-gitops",
		},
	}
	assert.Equal(t, "gitops-default-pod-delete-gitops", gitOpsWorkflowID(obj))

	obj.Labels = map[string]string{"workflow_id": "existing-id"}
	assert.Equal(t, "existing-id", gitOpsWorkflowID(obj))
}

func TestIsGitOpsEngine(t *testing.T) {
	os.Unsetenv("GITOPS_DISCOVERY_SELECTOR")

	plain := &chaosTypes.ChaosEngine{
		ObjectMeta: metav1.ObjectMeta{Namespace: "default", Name: "e1"},
	}
	assert.True(t, isGitOpsEngine(plain))

	labeled := &chaosTypes.ChaosEngine{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: "default",
			Name:      "e2",
			Labels:    map[string]string{"workflow_id": "abc"},
		},
	}
	assert.False(t, isGitOpsEngine(labeled))

	os.Setenv("GITOPS_DISCOVERY_SELECTOR", "chaoscenter.io/discover=true")
	defer os.Unsetenv("GITOPS_DISCOVERY_SELECTOR")

	optIn := &chaosTypes.ChaosEngine{
		ObjectMeta: metav1.ObjectMeta{
			Namespace: "default",
			Name:      "e3",
			Labels:    map[string]string{"chaoscenter.io/discover": "true"},
		},
	}
	assert.True(t, isGitOpsEngine(optIn))

	optOut := &chaosTypes.ChaosEngine{
		ObjectMeta: metav1.ObjectMeta{Namespace: "default", Name: "e4"},
	}
	assert.False(t, isGitOpsEngine(optOut))
}

func TestGitOpsDiscoveryEnabledDefault(t *testing.T) {
	os.Unsetenv("GITOPS_DISCOVERY_ENABLED")
	assert.True(t, gitOpsDiscoveryEnabled())

	os.Setenv("GITOPS_DISCOVERY_ENABLED", "false")
	defer os.Unsetenv("GITOPS_DISCOVERY_ENABLED")
	assert.False(t, gitOpsDiscoveryEnabled())
}
