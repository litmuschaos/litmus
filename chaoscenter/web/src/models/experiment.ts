import type { ProbeObj } from '@api/entities';
import type { ChaosEngine, ProbeAttributes } from './chaosEngine';
import type { ChaosExperiment } from './chaosFaults';
import type { CronWorkflow } from './cronWorkflows';
import type { Workflow } from './workflows';

export type KubernetesExperimentManifest = Workflow | CronWorkflow;
export type ExperimentManifest = KubernetesExperimentManifest;

export interface FaultData {
  faultName: string;
  probes?: ProbeObj[] | ProbeAttributes[];
  faultCR?: ChaosExperiment;
  engineCR?: ChaosEngine;
  weight?: number;
}

export interface InfraDetails {
  infraID: string;
  environmentID: string;
}

export enum FaultTunableInputType {
  Text = 'text',
  Number = 'number',
  Boolean = 'boolean',
  SecretKeyRef = 'secretKeyRef',
  ConfigMapKeyRef = 'configMapKeyRef'
}

export interface FaultTunable {
  type: FaultTunableInputType;
  required?: boolean;
  value?: string | number | boolean;
  valueFrom?: {
    name: string;
    key: string;
  };
}

export interface FaultTunables {
  [name: string]: FaultTunable;
}
