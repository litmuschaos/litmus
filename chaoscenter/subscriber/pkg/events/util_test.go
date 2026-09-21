package events

import (
	"testing"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	"github.com/stretchr/testify/assert"
)

func TestResolveEngineNamespace(t *testing.T) {
	tests := []struct {
		name       string
		manifestNS string
		fallbackNS string
		expected   string
	}{
		{
			name:       "unrendered template falls back to fallbackNS",
			manifestNS: "{{workflow.parameters.adminModeNamespace}}",
			fallbackNS: "custom-chaos-ns",
			expected:   "custom-chaos-ns",
		},
		{
			name:       "unrendered template with spaces falls back to fallbackNS",
			manifestNS: "  {{ workflow.parameters.adminModeNamespace }}  ",
			fallbackNS: "custom-chaos-ns",
			expected:   "custom-chaos-ns",
		},
		{
			name:       "empty manifest namespace falls back to fallbackNS",
			manifestNS: "",
			fallbackNS: "custom-chaos-ns",
			expected:   "custom-chaos-ns",
		},
		{
			name:       "whitespace manifest namespace falls back to fallbackNS",
			manifestNS: "   ",
			fallbackNS: "custom-chaos-ns",
			expected:   "custom-chaos-ns",
		},
		{
			name:       "explicit literal namespace is preserved unchanged",
			manifestNS: "sock-shop",
			fallbackNS: "custom-chaos-ns",
			expected:   "sock-shop",
		},
		{
			name:       "explicit literal namespace with whitespace is trimmed",
			manifestNS: "  sock-shop  ",
			fallbackNS: "custom-chaos-ns",
			expected:   "sock-shop",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := resolveEngineNamespace(tt.manifestNS, tt.fallbackNS)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGetAdminModeNamespace(t *testing.T) {
	customVal := v1alpha1.AnyString("custom-chaos-ns")
	spacesVal := v1alpha1.AnyString("  spaced-ns  ")
	templateVal := v1alpha1.AnyString("{{workflow.parameters.adminModeNamespace}}")
	emptyVal := v1alpha1.AnyString("")
	whiteSpaceVal := v1alpha1.AnyString("   ")
	defaultVal := v1alpha1.AnyString("default-chaos-ns")

	tests := []struct {
		name       string
		params     []v1alpha1.Parameter
		fallbackNS string
		expected   string
	}{
		{
			name: "adminModeNamespace parameter present with valid value",
			params: []v1alpha1.Parameter{
				{Name: "otherParam", Value: &customVal},
				{Name: "adminModeNamespace", Value: &customVal},
			},
			fallbackNS: "litmus",
			expected:   "custom-chaos-ns",
		},
		{
			name: "adminModeNamespace parameter present with whitespace trimmed",
			params: []v1alpha1.Parameter{
				{Name: "adminModeNamespace", Value: &spacesVal},
			},
			fallbackNS: "litmus",
			expected:   "spaced-ns",
		},
		{
			name: "adminModeNamespace parameter with unrendered template falls back",
			params: []v1alpha1.Parameter{
				{Name: "adminModeNamespace", Value: &templateVal},
			},
			fallbackNS: "litmus",
			expected:   "litmus",
		},
		{
			name: "adminModeNamespace parameter with empty value falls back",
			params: []v1alpha1.Parameter{
				{Name: "adminModeNamespace", Value: &emptyVal},
			},
			fallbackNS: "litmus",
			expected:   "litmus",
		},
		{
			name: "adminModeNamespace parameter with whitespace only falls back",
			params: []v1alpha1.Parameter{
				{Name: "adminModeNamespace", Value: &whiteSpaceVal},
			},
			fallbackNS: "litmus",
			expected:   "litmus",
		},
		{
			name: "adminModeNamespace parameter using Default field",
			params: []v1alpha1.Parameter{
				{Name: "adminModeNamespace", Default: &defaultVal},
			},
			fallbackNS: "litmus",
			expected:   "default-chaos-ns",
		},
		{
			name: "adminModeNamespace parameter missing entirely",
			params: []v1alpha1.Parameter{
				{Name: "otherParam", Value: &customVal},
			},
			fallbackNS: "litmus",
			expected:   "litmus",
		},
		{
			name:       "nil parameters slice falls back",
			params:     nil,
			fallbackNS: "litmus",
			expected:   "litmus",
		},
		{
			name:       "empty parameters slice falls back",
			params:     []v1alpha1.Parameter{},
			fallbackNS: "litmus",
			expected:   "litmus",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getAdminModeNamespace(tt.params, tt.fallbackNS)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestCheckChaosData_PendingPhase(t *testing.T) {
	ev := &subscriberEvents{}
	nodeStatus := v1alpha1.NodeStatus{
		Type:  v1alpha1.NodeTypePod,
		Phase: v1alpha1.NodePending,
		Inputs: &v1alpha1.Inputs{
			Artifacts: []v1alpha1.Artifact{
				{
					ArtifactLocation: v1alpha1.ArtifactLocation{
						Raw: &v1alpha1.RawArtifact{
							Data: `
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-sample
  namespace: "{{workflow.parameters.adminModeNamespace}}"
`,
						},
					},
				},
			},
		},
	}

	nodeType, cd, err := ev.CheckChaosData(nodeStatus, "litmus", "custom-ns", nil)
	assert.NoError(t, err)
	assert.Equal(t, "ChaosEngine", nodeType)
	assert.Nil(t, cd)
}

func TestCheckChaosData_NonChaosEngineArtifact(t *testing.T) {
	ev := &subscriberEvents{}
	nodeStatus := v1alpha1.NodeStatus{
		Type:  v1alpha1.NodeTypePod,
		Phase: v1alpha1.NodeRunning,
		Inputs: &v1alpha1.Inputs{
			Artifacts: []v1alpha1.Artifact{
				{
					ArtifactLocation: v1alpha1.ArtifactLocation{
						Raw: &v1alpha1.RawArtifact{
							Data: `
apiVersion: v1
kind: Pod
metadata:
  name: some-pod
  namespace: default
`,
						},
					},
				},
			},
		},
	}

	nodeType, cd, err := ev.CheckChaosData(nodeStatus, "litmus", "custom-ns", nil)
	assert.NoError(t, err)
	assert.Equal(t, "Pod", nodeType)
	assert.Nil(t, cd)
}

func TestCheckChaosData_InvalidArtifactYAML(t *testing.T) {
	ev := &subscriberEvents{}
	nodeStatus := v1alpha1.NodeStatus{
		Type:  v1alpha1.NodeTypePod,
		Phase: v1alpha1.NodeRunning,
		Inputs: &v1alpha1.Inputs{
			Artifacts: []v1alpha1.Artifact{
				{
					ArtifactLocation: v1alpha1.ArtifactLocation{
						Raw: &v1alpha1.RawArtifact{
							Data: `invalid: [yaml: unclosed`,
						},
					},
				},
			},
		},
	}

	nodeType, cd, err := ev.CheckChaosData(nodeStatus, "litmus", "custom-ns", nil)
	assert.NoError(t, err)
	assert.Equal(t, "Pod", nodeType)
	assert.Nil(t, cd)
}
