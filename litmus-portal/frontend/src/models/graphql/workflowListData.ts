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

export interface Workflow {
  workflow_id: string;
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
  workflow_runs: WorkflowRun[];
}

export interface WorkflowList {
  ListWorkflow: Workflow[];
}

export interface WorkflowListDataVars {
  projectID: string;
  workflowIDs: string[];
}
