import type { PaginationProps } from '@harnessio/uicore';
import type { ExperimentRunFaultStatus, ExperimentRunStatus, UserDetails } from '@api/entities';

interface ProbeStatus {
  passed: number;
  failed: number;
  na: number;
}
export interface ExperimentRunFaultDetails {
  faultID: string;
  faultName: string;
  faultStatus: ExperimentRunFaultStatus;
  faultWeight: number;
  probeStatus: ProbeStatus;
  startedAt?: number;
  finishedAt?: number;
}

export interface ExperimentRunFaultDetailsTableProps {
  experimentID: string;
  experimentRunID: string;
  content: Array<ExperimentRunFaultDetails>;
}

export interface ExperimentRunDetails {
  experimentID: string;
  experimentRunName: string;
  experimentRunID: string;
  experimentStatus: ExperimentRunStatus;
  executedBy: UserDetails | undefined;
  resilienceScore: number | undefined;
  startedAt: number;
  finishedAt: number;
  executedAt: number;
  faultTableData: ExperimentRunFaultDetailsTableProps;
}

export interface ExperimentRunHistoryTableProps {
  content: Array<ExperimentRunDetails>;
  pagination?: PaginationProps;
}
