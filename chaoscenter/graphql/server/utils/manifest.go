package utils

import (
	"encoding/json"
	"errors"
	"github.com/argoproj/argo-workflows/v3/pkg/apis/workflow/v1alpha1"
	chaosTypes "github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	dbChaosExperiment "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment"
	dbChaosExperimentRun "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/chaos_experiment_run"
	"strings"

	"github.com/ghodss/yaml"
)

func UpdateRuntimeCronWorkflowConfiguration(cronWorkflowManifest v1alpha1.CronWorkflow, experiment dbChaosExperiment.ChaosExperimentRequest) (v1alpha1.CronWorkflow, []string, error) {
	var (
		faults []string
		probes []dbChaosExperimentRun.Probes
	)
	for i, template := range cronWorkflowManifest.Spec.WorkflowSpec.Templates {
		artifact := template.Inputs.Artifacts
		if len(artifact) > 0 {
			if artifact[0].Raw == nil {
				continue
			}
			data := artifact[0].Raw.Data
			if len(data) > 0 {
				var meta chaosTypes.ChaosEngine
				annotation := make(map[string]string)
				err := yaml.Unmarshal([]byte(data), &meta)
				if err != nil {
					return cronWorkflowManifest, faults, errors.New("failed to unmarshal chaosengine")
				}
				if strings.ToLower(meta.Kind) == "chaosengine" {
					faults = append(faults, meta.GenerateName)
					if meta.Annotations != nil {
						annotation = meta.Annotations
					}

					var annotationArray []string
					for _, key := range annotation {

						var manifestAnnotation []dbChaosExperiment.ProbeAnnotations
						err := json.Unmarshal([]byte(key), &manifestAnnotation)
						if err != nil {
							return cronWorkflowManifest, faults, errors.New("failed to unmarshal experiment annotation object")
						}
						for _, annotationKey := range manifestAnnotation {
							annotationArray = append(annotationArray, annotationKey.Name)
						}
					}
					probes = append(probes, dbChaosExperimentRun.Probes{
						artifact[0].Name,
						annotationArray,
					})

					meta.Annotations = annotation

					if meta.Labels == nil {
						meta.Labels = map[string]string{
							"infra_id":        experiment.InfraID,
							"step_pod_name":   "{{pod.name}}",
							"workflow_run_id": "{{workflow.uid}}",
						}
					} else {
						meta.Labels["infra_id"] = experiment.InfraID
						meta.Labels["step_pod_name"] = "{{pod.name}}"
						meta.Labels["workflow_run_id"] = "{{workflow.uid}}"
					}

					if len(meta.Spec.Experiments[0].Spec.Probe) != 0 {
						meta.Spec.Experiments[0].Spec.Probe = TransformProbe(meta.Spec.Experiments[0].Spec.Probe)
					}
					res, err := yaml.Marshal(&meta)
					if err != nil {
						return cronWorkflowManifest, faults, errors.New("failed to marshal chaosengine")
					}
					cronWorkflowManifest.Spec.WorkflowSpec.Templates[i].Inputs.Artifacts[0].Raw.Data = string(res)
				}
			}
		}
	}
	return cronWorkflowManifest, faults, nil
}
