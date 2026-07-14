import type { Infra, InfrastructureType } from './chaosInfrastructure';
import type {
  DateRange,
  Weightages,
  ExperimentListType,
  ResourceDetails,
  Audit,
  ExperimentRunStatus,
  ExperimentType
} from './common';

export interface RecentExperimentRun extends Audit {
  experimentRunID: string;
  notifyID: string;
  phase: ExperimentRunStatus;
  resiliencyScore: number;
}

export interface Experiment extends Audit, ResourceDetails {
  projectID: string;
  experimentID: string;
  experimentManifest: string;
  cronSyntax: string;
  experimentType: ExperimentType;
  weightages: Weightages[];
  isCustomExperiment: boolean;
  infra?: Infra;
  recentExperimentRunDetails: RecentExperimentRun[];
}

export interface ExperimentFilterRequest {
  experimentName?: string;
  infraID?: string;
  infraActive?: boolean;
  scheduleType?: ExperimentListType;
  dateRange?: DateRange;
  infraTypes?: Array<InfrastructureType>;
}
