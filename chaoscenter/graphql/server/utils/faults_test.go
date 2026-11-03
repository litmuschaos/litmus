package utils

import (
	"testing"

	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestValidateUnits(t *testing.T) {
	tests := []struct {
		value string
		unit  string
		want  string
	}{
		{value: "", unit: "s", want: ""},
		{value: "10", unit: "s", want: "10s"},
		{value: "1.5", unit: "s", want: "1.5s"},
		{value: "500", unit: "ms", want: "500ms"},
		{value: "10s", unit: "s", want: "10s"},
		{value: "500ms", unit: "s", want: "500ms"},
		{value: "2m", unit: "s", want: "2m"},
		{value: "1m30s", unit: "s", want: "1m30s"},
		{value: "1h30m", unit: "s", want: "1h30m"},
		{value: "2h45m10s", unit: "s", want: "2h45m10s"},
		{value: "1s500ms", unit: "ms", want: "1s500ms"},
	}

	for _, tt := range tests {
		t.Run(tt.value, func(t *testing.T) {
			assert.Equal(t, tt.want, validateUnits(tt.value, tt.unit))
		})
	}
}

func TestTransformProbeKeepsCompoundDurations(t *testing.T) {
	probes := []v1alpha1.ProbeAttributes{
		{
			Name: "http-probe",
			Type: string(model.ProbeTypeHTTPProbe),
			RunProperties: v1alpha1.RunProperty{
				ProbeTimeout:         "1s500ms",
				Interval:             "1m30s",
				InitialDelay:         "10",
				EvaluationTimeout:    "1h30m",
				ProbePollingInterval: "2s",
			},
		},
	}

	got := TransformProbe(probes)

	assert.Len(t, got, 1)
	assert.Equal(t, "1s500ms", got[0].RunProperties.ProbeTimeout)
	assert.Equal(t, "1m30s", got[0].RunProperties.Interval)
	assert.Equal(t, "10s", got[0].RunProperties.InitialDelay)
	assert.Equal(t, "1h30m", got[0].RunProperties.EvaluationTimeout)
	assert.Equal(t, "2s", got[0].RunProperties.ProbePollingInterval)
}
