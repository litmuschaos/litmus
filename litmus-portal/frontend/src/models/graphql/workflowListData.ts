export interface WeightageMap {
  experiment_name: string;
  weightage: number;
}

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
  execution_data: string;
  last_updated: string;
  workflow_run_id: string;
}

export interface ScheduledWorkflow {
  workflow_id: string;
  workflow_manifest: string;
  cronSyntax: string;
  cluster_name: string;
  workflow_name: string;
  workflow_description: string;
  weightages: WeightageMap[];
  isCustomWorkflow: string;
  updated_at: string;
  created_at: string;
  project_id: string;
  cluster_id: string;
  cluster_type: string;
  isRemoved: Boolean;
}

export interface WorkflowList {
  ListWorkflow: ScheduledWorkflow[];
}

export interface WorkflowListDataVars {
  projectID: string;
  workflowIDs: string[];
}

export interface ListManifestTemplateArray {
  template_id: string;
  manifest: string;
  project_name: string;
  template_description: string;
  template_name: string;
  isCustomWorkflow: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface ListManifestTemplate {
  ListManifestTemplate: ListManifestTemplateArray[];
}

export interface SortInput {
  field: 'Name' | 'Time';
  descending?: Boolean;
}

export interface WorkflowFilterInput {
  workflow_name?: string;
  cluster_name?: string;
}
export interface ListWorkflowsInput {
  workflowInput: {
    project_id: string;
    workflow_ids?: string[];
    pagination?: Pagination;
    sort?: SortInput;
    filter?: WorkflowFilterInput;
  };
}

export interface ListWorkflowsOutput {
  total_no_of_workflows: number;
  workflows: ScheduledWorkflow[];
}

export interface ScheduledWorkflows {
  ListWorkflow: ListWorkflowsOutput;
}
