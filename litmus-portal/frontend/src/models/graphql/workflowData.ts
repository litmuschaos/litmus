import { WeekData } from 'litmus-ui';

export interface ChaosData {
  engineName: string;
  engineContext: string;
  engineUID: string;
  experimentName: string;
  experimentPod: string;
  experimentStatus: string;
  experimentVerdict: string;
  failStep: string;
  lastUpdatedAt: string;
  namespace: string;
  probeSuccessPercentage: string;
  runnerPod: string;
  chaosResult?: any;
}

export interface Node {
  children: string[] | null;
  finishedAt: string;
  message: string;
  name: string;
  phase: string;
  startedAt: string;
  type: string;
  chaosData?: ChaosData;
}

export interface Nodes {
  [index: string]: Node;
}

export interface ExecutionData {
  resiliencyScore?: number;
  experimentsPassed?: number;
  totalExperiments?: number;
  eventType: string;
  uid: string;
  namespace: string;
  name: string;
  creationTimestamp: string;
  phase: string;
  startedAt: string;
  finishedAt: string;
  nodes: Nodes;
}

export interface WeightageMap {
  experimentName: string;
  weightage: number;
}

export interface WorkflowRun {
  workflowRunID: string;
  workflowID: string;
  clusterName: string;
  weightages: WeightageMap[];
  lastUpdated: string;
  projectID: string;
  clusterID: string;
  workflowName: string;
  clusterType: String;
  phase: string;
  resiliencyScore: number;
  experimentsPassed: number;
  experimentsFailed: number;
  experimentsAwaited: number;
  experimentsStopped: number;
  experimentsNa: number;
  totalExperiments: number;
  executionData: string;
  isRemoved: boolean;
}

interface GetWorkflowRunsResponse {
  totalNoOfWorkflowRuns: number;
  workflowRuns: WorkflowRun[];
}

export interface Workflow {
  getWorkflowRuns: GetWorkflowRunsResponse;
}

export interface WorkflowSubscription {
  workflowEventListener: WorkflowRun;
}

export interface WorkflowSubscriptionInput {
  projectID: string;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
}

// Sort
export interface SortInput {
  field: 'Name' | 'Time';
  descending?: boolean;
}

// Filter
interface DateRange {
  startDate: string;
  endDate?: string;
}

export type WorkflowStatus =
  | 'All'
  | 'Failed'
  | 'Running'
  | 'Succeeded'
  | 'Terminated'
  | undefined;

export interface WorkflowRunFilterInput {
  workflowName?: string;
  clusterName?: string;
  workflowStatus?: WorkflowStatus;
  dateRange?: DateRange;
  isRemoved?: boolean | null;
}

export interface WorkflowDataRequest {
  workflowRunsRequest: {
    projectID: string;
    workflowRunIDs?: string[];
    workflowIDs?: string[];
    pagination?: Pagination;
    sort?: SortInput;
    filter?: WorkflowRunFilterInput;
  };
}

export interface HeatmapDataVars {
  projectID: string;
  workflowID: string;
  year: number;
}

export interface WorkflowRunDetails {
  noOfRuns: number;
  dateStamp: number;
}
export interface HeatMapData {
  value: number;
  workflowRunDetail: WorkflowRunDetails[];
}

export interface HeatmapDataResponse {
  getHeatmapData: WeekData[];
}

export interface WorkflowRunStatsResponse {
  getWorkflowRunStats: {
    totalWorkflowRuns: number;
    succeededWorkflowRuns: number;
    failedWorkflowRuns: number;
    runningWorkflowRuns: number;
    workflowRunSucceededPercentage: number;
    workflowRunFailedPercentage: number;
    averageResiliencyScore: number;
    passedPercentage: number;
    failedPercentage: number;
    totalExperiments: number;
    experimentsPassed: number;
    experimentsFailed: number;
    experimentsAwaited: number;
    experimentsStopped: number;
    experimentsNa: number;
  };
}

export interface WorkflowRunStatsRequest {
  workflowRunStatsRequest: {
    projectID: string;
    workflowIDs?: string[];
  };
}
