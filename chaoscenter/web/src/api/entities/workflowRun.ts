import type { ChaosResult } from '@models';
import type { Infra } from './chaosInfrastructure';
import type {
  Audit,
  DateRange,
  Weightages,
  ExperimentRunStatus,
  ExperimentRunFaultStatus,
  ExperimentType
} from './common';

export interface ChaosData {
  engineName: string;
  engineContext: string;
  engineUID: string;
  faultName: string;
  faultPod: string;
  faultStatus: string;
  faultVerdict: string;
  failStep: string;
  lastUpdatedAt: string;
  namespace: string;
  probeSuccessPercentage: string;
  runnerPod: string;
  chaosResult?: ChaosResult;
  taskDefinitionCR?: string;
}

export interface Node {
  children: string[] | null;
  finishedAt: string;
  message: string;
  name: string;
  phase: ExperimentRunFaultStatus;
  startedAt: string;
  type: string;
  chaosData?: ChaosData;
}

export interface Nodes {
  [index: string]: Node;
}

export interface ExecutionData {
  eventType: string;
  uid: string;
  namespace: string;
  name: string;
  creationTimestamp: string;
  phase: ExperimentRunStatus;
  message: string;
  startedAt: string;
  finishedAt: string;
  revisionID: string;
  nodes: Nodes;
}

export interface ExperimentRun extends Audit {
  projectID: string;
  experimentRunID: string;
  experimentID: string;
  weightages: Array<Weightages>;
  infra: Infra;
  experimentName: string;
  experimentManifest: string;
  experimentType: ExperimentType;
  phase: ExperimentRunStatus;
  resiliencyScore?: number;
  runSequence?: number;
  faultsPassed?: number;
  faultsFailed?: number;
  faultsAwaited?: number;
  faultsStopped?: number;
  faultsNa?: number;
  totalFaults?: number;
  executionData: string;
}

export interface ExperimentRunFilterRequest {
  infraName?: string;
  dateRange?: DateRange;
  experimentRunID?: string;
  experimentRunStatus?: Array<ExperimentRunFaultStatus>;
}
