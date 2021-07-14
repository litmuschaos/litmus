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
  resiliency_score?: number;
  experiments_passed?: number;
  total_experiments?: number;
  event_type: string;
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
  experiment_name: string;
  weightage: number;
}

export interface WorkflowRun {
  workflow_run_id: string;
  workflow_id: string;
  cluster_name: string;
  weightages: WeightageMap[];
  last_updated: string;
  project_id: string;
  cluster_id: string;
  workflow_name: string;
  cluster_type: String;
  phase: string;
  resiliency_score: number;
  experiments_passed: number;
  experiments_failed: number;
  experiments_awaited: number;
  experiments_stopped: number;
  experiments_na: number;
  total_experiments: number;
  execution_data: string;
  isRemoved: boolean;
}

interface GetWorkflowRunsOutput {
  total_no_of_workflow_runs: number;
  workflow_runs: WorkflowRun[];
}

export interface Workflow {
  getWorkflowRuns: GetWorkflowRunsOutput;
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
  start_date: string;
  end_date?: string;
}

export type WorkflowStatus =
  | 'All'
  | 'Failed'
  | 'Running'
  | 'Succeeded'
  | undefined;

export interface WorkflowRunFilterInput {
  workflow_name?: string;
  cluster_name?: string;
  workflow_status?: WorkflowStatus;
  date_range?: DateRange;
  isRemoved?: boolean | null;
}

export interface WorkflowDataVars {
  workflowRunsInput: {
    project_id: string;
    workflow_run_ids?: string[];
    workflow_ids?: string[];
    pagination?: Pagination;
    sort?: SortInput;
    filter?: WorkflowRunFilterInput;
  };
}

export interface HeatmapDataVars {
  project_id: string;
  workflow_id: string;
  year: number;
}

export interface WorkflowRunDetails {
  no_of_runs: number;
  date_stamp: number;
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
    total_workflow_runs: number;
    succeeded_workflow_runs: number;
    failed_workflow_runs: number;
    running_workflow_runs: number;
    workflow_run_succeeded_percentage: number;
    workflow_run_failed_percentage: number;
    average_resiliency_score: number;
    passed_percentage: number;
    failed_percentage: number;
    total_experiments: number;
    experiments_passed: number;
    experiments_failed: number;
    experiments_awaited: number;
    experiments_stopped: number;
    experiments_na: number;
  };
}

export interface WorkflowRunStatsRequest {
  workflowRunStatsRequest: {
    project_id: string;
    workflow_ids?: string[];
  };
}
