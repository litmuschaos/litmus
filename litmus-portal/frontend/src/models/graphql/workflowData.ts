export interface ChaosData {
  engineName: string;
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

export interface WorkflowRun {
  cluster_name: string;
  execution_data: string;
  last_updated: string;
  project_id: string;
  workflow_id: string;
  workflow_name: string;
  workflow_run_id: string;
  cluster_type: string;
  cluster_id: string;
  phase: string;
  resiliency_score?: number;
  experiments_passed?: number;
  total_experiments?: number;
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
  end_date: string;
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
}

export interface WorkflowDataVars {
  workflowRunsInput: {
    project_id: string;
    workflow_run_ids?: string[];
    pagination?: Pagination;
    sort?: SortInput;
    filter?: WorkflowRunFilterInput;
  };
}
