import type { CmdProbeInputs, HTTPProbeInputs, K8sProbeInputs, PromProbeInputs, RunProperty } from '@models';
import type { Identifiers, Audit } from '.';

export enum ProbeType {
  HTTP = 'HTTP',
  PROM = 'PROM',
  K8S = 'K8S',
  CMD = 'CMD'
}

export enum Mode {
  SoT = 'SoT',
  EoT = 'EoT',
  Edge = 'Edge',
  Continuous = 'Continuous',
  OnChaos = 'OnChaos'
}

export interface Probe extends Audit {
  identifiers: Identifiers;
  probeId: string;
  name: string;
  description: string;
  tags: Array<string>;
  type: ProbeType;
  httpProperties: HTTPProbeInputs & RunProperty;
  cmdProperties: CmdProbeInputs & RunProperty;
  k8sProperties: K8sProbeInputs & RunProperty;
  promProperties: PromProbeInputs & RunProperty;
}
