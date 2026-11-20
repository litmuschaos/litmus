package handler

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

func TestGenerateProbeManifest_HTTPProbeKeepsInsecureSkipVerify(t *testing.T) {
	enabled := true
	disabled := false

	tests := []struct {
		name               string
		insecureSkipVerify *bool
		method             *model.Method
		want               bool
	}{
		{
			name:               "GET probe with insecureSkipVerify enabled",
			insecureSkipVerify: &enabled,
			method:             &model.Method{Get: &model.Get{Criteria: "==", ResponseCode: "200"}},
			want:               true,
		},
		{
			name:               "POST probe with insecureSkipVerify enabled",
			insecureSkipVerify: &enabled,
			method:             &model.Method{Post: &model.Post{Criteria: "==", ResponseCode: "200"}},
			want:               true,
		},
		{
			name:               "GET probe with insecureSkipVerify disabled",
			insecureSkipVerify: &disabled,
			method:             &model.Method{Get: &model.Get{Criteria: "==", ResponseCode: "200"}},
			want:               false,
		},
		{
			name:               "GET probe without insecureSkipVerify",
			insecureSkipVerify: nil,
			method:             &model.Method{Get: &model.Get{Criteria: "==", ResponseCode: "200"}},
			want:               false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := &probeService{}
			probe := &model.Probe{
				Name: "https-probe",
				Type: model.ProbeTypeHTTPProbe,
				KubernetesHTTPProperties: &model.KubernetesHTTPProbe{
					ProbeTimeout:       "1s",
					Interval:           "1s",
					URL:                "https://self-signed.example.com",
					Method:             tt.method,
					InsecureSkipVerify: tt.insecureSkipVerify,
				},
			}

			manifest, err := svc.GenerateProbeManifest(probe, model.ModeSot)
			require.NoError(t, err)

			var got HTTPProbeAttributes
			require.NoError(t, json.Unmarshal([]byte(manifest), &got))

			assert.Equal(t, tt.want, got.HTTPProbeInputs.InsecureSkipVerify)
			// the rest of the HTTP probe inputs must still be generated
			assert.Equal(t, "https://self-signed.example.com", got.HTTPProbeInputs.URL)
			if tt.method.Get != nil {
				require.NotNil(t, got.HTTPProbeInputs.Method.Get)
				assert.Equal(t, "200", got.HTTPProbeInputs.Method.Get.ResponseCode)
			} else {
				require.NotNil(t, got.HTTPProbeInputs.Method.Post)
				assert.Equal(t, "200", got.HTTPProbeInputs.Method.Post.ResponseCode)
			}
		})
	}
}
