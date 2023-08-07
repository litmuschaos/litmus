package utils

import (
	"strconv"

	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

func TransformProbe(probeList []v1alpha1.ProbeAttributes) []v1alpha1.ProbeAttributes {
	var updateProbeList []v1alpha1.ProbeAttributes

	for _, probe := range probeList {
		updatedProbe := v1alpha1.ProbeAttributes{
			Name: probe.Name,
			Type: probe.Type,
			Mode: probe.Mode,
			Data: probe.Data,
			RunProperties: v1alpha1.RunProperty{
				ProbeTimeout:         validateUnits(probe.RunProperties.ProbeTimeout, "s"),
				Interval:             validateUnits(probe.RunProperties.Interval, "s"),
				Retry:                probe.RunProperties.Retry,
				Attempt:              probe.RunProperties.Attempt,
				InitialDelay:         validateUnits(probe.RunProperties.InitialDelay, "s"),
				EvaluationTimeout:    validateUnits(probe.RunProperties.EvaluationTimeout, "s"),
				ProbePollingInterval: validateUnits(probe.RunProperties.ProbePollingInterval, "s"),
				StopOnFailure:        probe.RunProperties.StopOnFailure,
			},
		}

		if probe.RunProperties.InitialDelaySeconds != 0 {
			updatedProbe.RunProperties.InitialDelay = validateUnits(strconv.Itoa(probe.RunProperties.InitialDelaySeconds), "s")
		}

		switch model.ProbeType(probe.Type) {
		case model.ProbeTypeHTTPProbe:
			updatedProbe.RunProperties.ProbeTimeout = validateUnits(probe.RunProperties.ProbeTimeout, "ms")
			updatedProbe.HTTPProbeInputs = probe.HTTPProbeInputs
		case model.ProbeTypeCmdProbe:
			updatedProbe.CmdProbeInputs = probe.CmdProbeInputs
		case model.ProbeTypeK8sProbe:
			updatedProbe.K8sProbeInputs = probe.K8sProbeInputs
		case model.ProbeTypePromProbe:
			updatedProbe.PromProbeInputs = probe.PromProbeInputs
		}
		updateProbeList = append(updateProbeList, updatedProbe)
	}
	return updateProbeList
}
