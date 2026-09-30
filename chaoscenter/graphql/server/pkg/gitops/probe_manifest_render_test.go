package gitops

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

func strPtr(s string) *string { return &s }
func intPtr(i int) *int       { return &i }
func boolPtr(b bool) *bool    { return &b }

// probeRequestsOfAllTypes returns one fully populated request per probe type.
func probeRequestsOfAllTypes() map[string]model.ProbeRequest {
	return map[string]model.ProbeRequest{
		"http": {
			Name:               "http-health-check",
			Description:        strPtr("checks /health"),
			Tags:               []string{"health", "http"},
			Type:               model.ProbeTypeHTTPProbe,
			InfrastructureType: model.InfrastructureTypeKubernetes,
			KubernetesHTTPProperties: &model.KubernetesHTTPProbeRequest{
				ProbeTimeout:         "5s",
				Interval:             "2s",
				Retry:                intPtr(1),
				Attempt:              intPtr(3),
				ProbePollingInterval: strPtr("1s"),
				InitialDelay:         strPtr("3s"),
				EvaluationTimeout:    strPtr("10s"),
				StopOnFailure:        boolPtr(true),
				URL:                  "http://my-app:8080/health",
				Method: &model.MethodRequest{Post: &model.POSTRequest{
					ContentType:  strPtr("application/json"),
					Body:         strPtr(`{"ping":true}`),
					Criteria:     "==",
					ResponseCode: "200",
				}},
				InsecureSkipVerify: boolPtr(false),
			},
		},
		"cmd": {
			Name:               "cmd-probe",
			Type:               model.ProbeTypeCmdProbe,
			InfrastructureType: model.InfrastructureTypeKubernetes,
			KubernetesCMDProperties: &model.KubernetesCMDProbeRequest{
				ProbeTimeout: "10s",
				Interval:     "5s",
				Command:      "echo test",
				Comparator:   &model.ComparatorInput{Type: "string", Value: "test", Criteria: "=="},
				Source:       strPtr(`{"image":"busybox"}`),
			},
		},
		"prom": {
			Name:               "prom-probe",
			Tags:               []string{"slo"},
			Type:               model.ProbeTypePromProbe,
			InfrastructureType: model.InfrastructureTypeKubernetes,
			PromProperties: &model.PROMProbeRequest{
				ProbeTimeout: "10s",
				Interval:     "5s",
				Endpoint:     "http://prometheus:9090",
				Query:        strPtr(`up{job="api"}`),
				Comparator:   &model.ComparatorInput{Type: "int", Value: "1", Criteria: ">="},
			},
		},
		"k8s": {
			Name:               "k8s-probe",
			Type:               model.ProbeTypeK8sProbe,
			InfrastructureType: model.InfrastructureTypeKubernetes,
			K8sProperties: &model.K8SProbeRequest{
				ProbeTimeout:  "10s",
				Interval:      "5s",
				Group:         strPtr("apps"),
				Version:       "v1",
				Resource:      "deployments",
				Namespace:     strPtr("default"),
				LabelSelector: strPtr("app=nginx"),
				Operation:     "present",
			},
		},
	}
}

func TestRenderProbeManifest_RoundTrip(t *testing.T) {
	for name, request := range probeRequestsOfAllTypes() {
		t.Run(name, func(t *testing.T) {
			data, err := renderProbeManifest(request)
			require.NoError(t, err)

			parsed, err := parseProbeManifest(data)
			require.NoError(t, err, string(data))
			assert.Equal(t, &request, parsed)
		})
	}
}

func TestRenderProbeManifest_Shape(t *testing.T) {
	data, err := renderProbeManifest(probeRequestsOfAllTypes()["http"])
	require.NoError(t, err)

	manifest := string(data)
	assert.Contains(t, manifest, "apiVersion: litmuschaos.io/v1alpha1\n")
	assert.Contains(t, manifest, "kind: ResilienceProbe\n")
	assert.Contains(t, manifest, "  name: http-health-check\n")
	assert.Contains(t, manifest, "  type: httpProbe\n")
	assert.Contains(t, manifest, "    url: http://my-app:8080/health\n")
	assert.NotContains(t, manifest, "kubernetesHTTPProperties", "properties must be inlined under spec.properties")
	assert.NotContains(t, manifest, "labels:")
}

func TestRenderProbeManifest_IsCanonical(t *testing.T) {
	request := probeRequestsOfAllTypes()["k8s"]

	first, err := renderProbeManifest(request)
	require.NoError(t, err)
	second, err := renderProbeManifest(request)
	require.NoError(t, err)

	assert.Equal(t, string(first), string(second))
}

func TestRenderProbeManifest_Errors(t *testing.T) {
	testCases := []struct {
		name    string
		request model.ProbeRequest
		wantErr string
	}{
		{
			name:    "missing properties",
			request: model.ProbeRequest{Name: "x", Type: model.ProbeTypeCmdProbe, InfrastructureType: model.InfrastructureTypeKubernetes},
			wantErr: "cmd probe type's properties are empty",
		},
		{
			name:    "unknown type",
			request: model.ProbeRequest{Name: "x", Type: model.ProbeType("dnsProbe")},
			wantErr: `unsupported probe type "dnsProbe"`,
		},
	}
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			data, err := renderProbeManifest(tc.request)

			assert.Nil(t, data)
			assert.EqualError(t, err, tc.wantErr)
		})
	}
}
