package utils

import (
	"fmt"
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	"github.com/stretchr/testify/assert"
)

// annotatedEngineTemplates is a workflow templates section holding a ChaosEngine which, besides its
// probeRef annotation, carries annotations whose values are not probe references.
const annotatedEngineTemplates = `{"templates":[{"name":"pod-delete","inputs":{"artifacts":[{"name":"pod-delete","raw":{"data":` +
	`"apiVersion: litmuschaos.io/v1alpha1\nkind: ChaosEngine\nmetadata:\n  generateName: pod-delete\n  annotations:\n` +
	`    team.example.com/owner: sre\n    team.example.com/retries: \"3\"\n` +
	`    team.example.com/targets: '[{\"name\":\"not-a-probe\"}]'\n` +
	`    probeRef: '[{\"name\":\"http-probe\",\"mode\":\"SOT\"}]'\n"}}]}}]}`

func TestParseProbeRefAnnotation(t *testing.T) {
	httpProbe := dbChaosExperiment.ProbeAnnotations{Name: "http-probe", Mode: model.ModeSot}

	tests := []struct {
		name        string
		annotations map[string]string
		want        []dbChaosExperiment.ProbeAnnotations
		wantErr     bool
	}{
		{name: "nil annotations"},
		{name: "probeRef absent", annotations: map[string]string{"team.example.com/owner": "sre"}},
		{name: "empty probeRef", annotations: map[string]string{probeRefAnnotationKey: ""}},
		{
			name:        "probeRef only",
			annotations: map[string]string{probeRefAnnotationKey: `[{"name":"http-probe","mode":"SOT"}]`},
			want:        []dbChaosExperiment.ProbeAnnotations{httpProbe},
		},
		{
			name:        "field order does not matter",
			annotations: map[string]string{probeRefAnnotationKey: `[{"mode":"SOT","name":"http-probe"}]`},
			want:        []dbChaosExperiment.ProbeAnnotations{httpProbe},
		},
		{
			name: "other annotations are ignored whatever their value",
			annotations: map[string]string{
				"team.example.com/owner":   "sre",
				"team.example.com/retries": "3",
				"team.example.com/targets": `[{"name":"not-a-probe"}]`,
				probeRefAnnotationKey:      `[{"name":"http-probe","mode":"SOT"}]`,
			},
			want: []dbChaosExperiment.ProbeAnnotations{httpProbe},
		},
		{
			name:        "malformed probeRef is reported",
			annotations: map[string]string{probeRefAnnotationKey: "http-probe"},
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseProbeRefAnnotation(tt.annotations)

			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestParseProbesFromManifests_IgnoreOtherAnnotations(t *testing.T) {
	nonCron := fmt.Sprintf(`{"kind":"Workflow","spec":%s}`, annotatedEngineTemplates)
	cron := fmt.Sprintf(`{"kind":"CronWorkflow","spec":{"schedule":"* * * * *","workflowSpec":%s}}`, annotatedEngineTemplates)

	tests := []struct {
		name     string
		wfType   dbChaosExperiment.ChaosExperimentType
		manifest string
	}{
		{name: "non-cron experiment", wfType: dbChaosExperiment.NonCronExperiment, manifest: nonCron},
		{name: "cron experiment", wfType: dbChaosExperiment.CronExperiment, manifest: cron},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			probes, err := ParseProbesFromManifest(&tt.wfType, tt.manifest)
			assert.NoError(t, err)
			assert.Equal(t, []dbChaosExperiment.Probes{{FaultName: "pod-delete", ProbeNames: []string{"http-probe"}}}, probes)

			runProbes, err := ParseProbesFromManifestForRuns(&tt.wfType, tt.manifest)
			assert.NoError(t, err)
			assert.Equal(t, []dbChaosExperimentRun.Probes{{FaultName: "pod-delete", ProbeNames: []string{"http-probe"}}}, runProbes)
		})
	}
}
