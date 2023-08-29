import { ChaosData, FaultProbeStatus } from '@api/entities';
import type { CmdProbeInputs, HTTPProbeInputs, K8sProbeInputs, ProbeAttributes, PromProbeInputs } from '@models';
import { destructure } from './destructure';

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

export function getProbeProperties(probe: ProbeAttributes): string[][] {
  const probeProperties: string[][] = [];
  Object.entries(destructure(probe.runProperties)).forEach(property => {
    const key = property[0];
    const value =
      probe.type === 'httpProbe' && property[0] === 'probeTimeout'
        ? `${property[1]} ms`
        : typeof property[1] != 'boolean' && property[0] !== 'retry'
        ? `${property[1]} seconds`
        : `${property[1].toString()}`;

    probeProperties.push([key, value]);
  });
  return probeProperties;
}

// export function getIcon(type: ProbeType): IconName {
//   switch (type) {
//     case ProbeType.HTTP:
//       return 'http-probe';
//     case ProbeType.CMD:
//       return 'cmd-probe';
//     case ProbeType.PROM:
//       return 'service-prometheus';
//     case ProbeType.K8S:
//       return 'app-kubernetes';
//     default:
//       return 'custom-approval';
//   }
// }

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
