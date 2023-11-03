// Identifiers
export interface Identifiers {
  projectID: string;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
}

// Sort Type
export enum SortType {
  NAME = 'NAME',
  TIME = 'TIME'
}

// Sort
export interface SortInput {
  field: SortType;
  descending?: boolean;
}

// Filter
export interface DateRange {
  startDate: string;
  endDate?: string;
}

// TODO: to be changed to faultName after backend change
export interface Weightages {
  experimentName: string;
  weightage: number;
}

export enum ExperimentCreationType {
  ALL = 'All',
  WORKFLOW = 'Experiment',
  CRONWORKFLOW = 'CronExperiment',
  CHAOSENGINE = 'ChaosEngine',
  CHAOSSCHEDULE = 'ChaosSchedule'
}

export enum ExperimentManifestType {
  CRON = 'CronExperiment',
  NON_CRON_KUBERNETES = 'Experiment'
}

export enum ExperimentListType {
  CRON = 'CRON',
  NON_CRON = 'NON_CRON',
  ALL = 'ALL'
}

export interface ResourceDetails {
  name: string;
  description?: string;
  tags?: Array<string>;
}

export interface UserDetails {
  userID: string;
  username: string;
  email: string;
}

export interface Audit {
  updatedAt?: string;
  createdAt?: string;
  updatedBy?: UserDetails;
  createdBy?: UserDetails;
  isRemoved?: boolean;
}

// Experiment Types
export enum ExperimentType {
  CRON = 'cronexperiment',
  NON_CRON = 'experiment'
}

// Experiment Run Status
export enum ExperimentRunStatus {
  COMPLETED = 'Completed',
  /**
   * @deprecated Use COMPLETED_WITH_PROBE_FAILURE instead.
   */
  COMPLETED_WITH_ERROR = 'Completed_With_Error',
  COMPLETED_WITH_PROBE_FAILURE = 'Completed_With_Probe_Failure',
  ERROR = 'Error',
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  TIMEOUT = 'Timeout',
  QUEUED = 'Queued',
  NA = 'NA' // <!-- needed for default -->
}

// Experiment Run Fault Status
export enum ExperimentRunFaultStatus {
  COMPLETED = 'Completed',
  /**
   * @deprecated Use COMPLETED_WITH_PROBE_FAILURE instead.
   */
  COMPLETED_WITH_ERROR = 'Completed_With_Error',
  COMPLETED_WITH_PROBE_FAILURE = 'Completed_With_Probe_Failure',
  ERROR = 'Error',
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  SKIPPED = 'Skipped',
  /**
   * @deprecated Use COMPLETED instead.
   */
  SUCCEEDED = 'Succeeded',
  /**
   * @deprecated Use COMPLETED instead.
   */
  PASSED = 'Passed',
  /**
   * @deprecated Use ERROR instead.
   */
  FAILED = 'Failed',
  NA = 'NA' // <!-- needed for default -->
}

// Experiment Run Fault Probe Status
export enum FaultProbeStatus {
  PASSED = 'Passed',
  FAILED = 'Failed',
  AWAITED = 'Awaited',
  NA = 'NA',
  'N/A' = 'N/A'
}

export enum ResourceType {
  EXPERIMENT = 'EXPERIMENT',
  PROBE = 'PROBE'
}
