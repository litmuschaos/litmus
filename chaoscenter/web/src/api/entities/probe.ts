import type {
  HTTPProbeInputs,
  K8sProbeInputs,
  NewCmdProbeInputs,
  ProbeVerdict,
  PromProbeInputs,
  RunProperty
} from '@models';
import type { Identifiers, Audit, DateRange } from './common';
import type { InfrastructureType, UserDetails } from '.';

export enum ProbeType {
  HTTP = 'httpProbe',
  PROM = 'promProbe',
  K8S = 'k8sProbe',
  CMD = 'cmdProbe'
}

export enum ProbeStatus {
  Running = 'Running',
  Completed = 'Completed',
  Stopped = 'Stopped',
  Error = 'Error',
  Queued = 'Queued',
  NA = 'NA'
}

export enum Mode {
  SoT = 'SOT',
  EoT = 'EOT',
  Edge = 'Edge',
  Continuous = 'Continuous',
  OnChaos = 'OnChaos'
}

export interface Probe extends Audit {
  projectID: string;
  name: string;
  description?: string;
  tags?: Array<string>;
  type: ProbeType;
  recentExecutions?: ProbeRecentExecutions[];
  referencedBy?: number;
  infrastructureType: InfrastructureType;
  // HTTP Probe
  kubernetesHTTPProperties?: HTTPProbeInputs & RunProperty;
  // CMD Probe
  kubernetesCMDProperties?: NewCmdProbeInputs & RunProperty;
  // K8s Probe
  k8sProperties?: K8sProbeInputs & RunProperty;
  // Prometheus Probe
  promProperties?: PromProbeInputs & RunProperty;
}

export interface ProbeRecentExecutions {
  faultName: string;
  status: Status;
  executedByExperiment: ExecutedByExperiment;
}

export interface RecentProbeRun {
  executedByExperiment: ExecutedByExperiment;
  status: Status;
}

interface ExecutedByExperiment {
  experimentID: string;
  experimentName: string;
  updatedBy: UserDetails;
  updatedAt: number;
}

export interface ExecutionHistory {
  faultName: string;
  status: Status;
  executedByExperiment: ExecutedByExperiment;
  mode: Mode;
}

interface RecentExecutions {
  faultName: string;
  mode: Mode;
  executionHistory: ExecutionHistory[];
}

export interface ProbeReference {
  identifiers: Identifiers;
  name: string;
  totalRuns: number;
  recentExecutions: RecentExecutions[];
}

export interface ProbeInput {
  faultName: string;
  probeNames: string[];
}

export interface Status {
  verdict?: ProbeVerdict;
  description?: string;
}

export interface ProbeObj {
  name: string;
  mode: Mode;
}

export interface ProbeFilterRequest {
  name: string | undefined;
  dateRange: DateRange | undefined;
  type: ProbeType[] | undefined;
}
