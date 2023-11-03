import type { IconName } from '@harnessio/icons';
import { ProbeType, ChaosData, FaultProbeStatus, ProbeStatus, Probe, InfrastructureType } from '@api/entities';
import type {
  CmdProbeInputs,
  HTTPProbeInputs,
  K8sProbeInputs,
  NewCmdProbeInputs,
  ProbeAttributes,
  PromProbeInputs
} from '@models';
import { destructure } from './data';

export function getProbeDetails(probe: ProbeAttributes): string[][] {
  const probeDetails: string[][] = [];
  let inputs: PromProbeInputs | HTTPProbeInputs | CmdProbeInputs | K8sProbeInputs = {};
  if (probe['k8sProbe/inputs']) inputs = probe['k8sProbe/inputs'];
  if (probe['cmdProbe/inputs']) inputs = probe['cmdProbe/inputs'];
  if (probe['httpProbe/inputs']) inputs = probe['httpProbe/inputs'];
  if (probe['promProbe/inputs']) inputs = probe['promProbe/inputs'];

  Object.entries(destructure(inputs)).forEach(input => {
    probeDetails.push([input[0], input[1].toString() !== '' ? input[1].toString() : '-']);
  });
  return probeDetails;
}

export function getProbeDetailsFromParsedProbe(probe: Probe): string[][] {
  const probeDetails: string[][] = [];

  let inputs: PromProbeInputs | HTTPProbeInputs | NewCmdProbeInputs | K8sProbeInputs = {};

  if (probe.type === ProbeType.K8S)
    inputs = {
      group: probe?.k8sProperties?.group,
      version: probe?.k8sProperties?.version ?? '',
      resource: probe?.k8sProperties?.resource ?? '',
      resourceNames: probe?.k8sProperties?.resourceNames,
      namespace: probe?.k8sProperties?.namespace,
      fieldSelector: probe?.k8sProperties?.fieldSelector,
      labelSelector: probe?.k8sProperties?.labelSelector,
      operation: probe?.k8sProperties?.operation ?? ''
    };
  if (probe.type === ProbeType.CMD && probe.infrastructureType === InfrastructureType.KUBERNETES)
    inputs = {
      command: probe.kubernetesCMDProperties?.command,
      comparator: probe.kubernetesCMDProperties?.comparator,
      source: probe.kubernetesCMDProperties?.source
    };
  if (probe.type === ProbeType.HTTP && probe.infrastructureType === InfrastructureType.KUBERNETES)
    inputs = {
      url: probe.kubernetesHTTPProperties?.url ?? '',
      insecureSkipVerify: probe.kubernetesHTTPProperties?.insecureSkipVerify,
      method: probe.kubernetesHTTPProperties?.method ?? {}
    };
  if (probe.type === ProbeType.PROM)
    inputs = {
      endpoint: probe?.promProperties?.endpoint,
      query: probe?.promProperties?.query,
      queryPath: probe?.promProperties?.queryPath,
      comparator: probe?.promProperties?.comparator
    };

  Object.entries(destructure(inputs)).forEach(input => {
    probeDetails.push([input[0], input[1].toString() !== '' ? input[1].toString() : '-']);
  });
  return probeDetails;
}

export function getProbeProperties(probe: ProbeAttributes): string[][] {
  const probeProperties: string[][] = [];
  Object.entries(destructure(probe.runProperties)).forEach(property => {
    const key = property[0];
    const value = property[1].toString();

    probeProperties.push([key, value]);
  });
  return probeProperties;
}

export function getProbePropertiesFromParsedProbe(probe: Probe): string[][] {
  const probeProperties: string[][] = [];

  const handleProbeProperties = (property: [string, string]): void => {
    // Probe properties include both properties and details
    // This if checks only allows properties
    if (
      property[0] === 'probeTimeout' ||
      property[0] === 'interval' ||
      property[0] === 'attempt' ||
      property[0] === 'evaluationTimeout' ||
      property[0] === 'retry' ||
      property[0] === 'probePollingInterval' ||
      property[0] === 'initialDelay' ||
      property[0] === 'stopOnFailure'
    ) {
      const key = property[0];
      const value = property[1].toString();

      probeProperties.push([key, value]);
    }
  };

  if (probe.type === ProbeType.HTTP && probe.infrastructureType === InfrastructureType.KUBERNETES)
    Object.entries(destructure(probe.kubernetesHTTPProperties)).forEach(property => handleProbeProperties(property));
  if (probe.type === ProbeType.CMD && probe.infrastructureType === InfrastructureType.KUBERNETES)
    Object.entries(destructure(probe.kubernetesCMDProperties)).forEach(property => handleProbeProperties(property));
  if (probe.type === ProbeType.PROM)
    Object.entries(destructure(probe.promProperties)).forEach(property => handleProbeProperties(property));
  if (probe.type === ProbeType.K8S)
    Object.entries(destructure(probe.k8sProperties)).forEach(property => handleProbeProperties(property));

  return probeProperties;
}

export function getNormalizedProbeName(type: ProbeType): string {
  switch (type) {
    case ProbeType.HTTP:
      return 'HTTP';
    case ProbeType.CMD:
      return 'Command';
    case ProbeType.PROM:
      return 'Prometheus';
    case ProbeType.K8S:
      return 'Kubernetes';
  }
}

export function getIcon(type: ProbeType): IconName {
  switch (type) {
    case ProbeType.HTTP:
      return 'http-probe';
    case ProbeType.CMD:
      return 'cmd-probe';
    default:
      return 'custom-approval';
  }
}

export function getInfraIcon(type: InfrastructureType): IconName {
  switch (type) {
    case InfrastructureType.KUBERNETES:
      return 'custom-approval';
  }
}

export function getProbeStatusIcon(status: ProbeStatus): IconName {
  switch (status) {
    case ProbeStatus.Completed:
      return 'check';
    case ProbeStatus.Running:
      return 'dry-run';
    case ProbeStatus.Error:
      return 'error';
    case ProbeStatus.Queued:
      return 'waiting';
    default:
      return 'codebase-invalid';
  }
}

export function calculateTotalProbeStatusFromChaosData(chaosData?: ChaosData): [number, number, number] {
  let totalPassedProbeCount = 0;
  let totalFailedProbeCount = 0;
  let totalNAProbeCount = 0;
  if (chaosData?.chaosResult?.status?.probeStatuses) {
    chaosData.chaosResult.status.probeStatuses.forEach(probeStatus => {
      if (probeStatus.status?.verdict === FaultProbeStatus.PASSED) {
        totalPassedProbeCount++;
      } else if (probeStatus.status?.verdict === FaultProbeStatus.FAILED) {
        totalFailedProbeCount++;
      } else totalNAProbeCount++;
    });
  }
  return [totalPassedProbeCount, totalFailedProbeCount, totalNAProbeCount];
}
