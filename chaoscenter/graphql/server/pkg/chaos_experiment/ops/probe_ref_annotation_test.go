package ops

import (
	"encoding/json"
	"testing"

	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	"github.com/stretchr/testify/assert"
	"sigs.k8s.io/yaml"
)

func Test_chaosExperimentService_UpdateRuntimeCronWorkflowConfiguration_IgnoresOtherAnnotations(t *testing.T) {
	const manifest = `{"kind":"CronWorkflow","spec":{"schedule":"* * * * *","workflowSpec":{"templates":[{"name":"pod-delete",` +
		`"inputs":{"artifacts":[{"name":"pod-delete","raw":{"data":"apiVersion: litmuschaos.io/v1alpha1\nkind: ChaosEngine\n` +
		`metadata:\n  generateName: pod-delete\n  annotations:\n    team.example.com/owner: sre\n` +
		`    probeRef: '[{\"name\":\"http-probe\",\"mode\":\"SOT\"}]'\nspec:\n  experiments:\n  - name: pod-delete\n"}}]}}]}}}`

	var cronWorkflow v1alpha1.CronWorkflow
	assert.NoError(t, json.Unmarshal([]byte(manifest), &cronWorkflow))

	updated, faults, err := chaosExperimentRunTestService.UpdateRuntimeCronWorkflowConfiguration(
		cronWorkflow, dbChaosExperiment.ChaosExperimentRequest{InfraID: "infra-1"})

	assert.NoError(t, err)
	assert.Equal(t, []string{"pod-delete"}, faults)

	var engine chaosTypes.ChaosEngine
	assert.NoError(t, yaml.Unmarshal([]byte(updated.Spec.WorkflowSpec.Templates[0].Inputs.Artifacts[0].Raw.Data), &engine))
	assert.Equal(t, "sre", engine.Annotations["team.example.com/owner"])
	assert.Equal(t, "infra-1", engine.Labels["infra_id"])
}
