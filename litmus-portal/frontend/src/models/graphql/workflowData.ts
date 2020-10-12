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
  cluster_name: string;
  execution_data: string;
  last_updated: string;
  project_id: string;
  workflow_id: string;
  workflow_name: string;
  workflow_run_id: string;
  cluster_type: string;
  cluster_id: string;
}

export interface Workflow {
  getWorkFlowRuns: WorkflowRun[];
}

export interface WorkflowSubscription {
  workflowEventListener: WorkflowRun;
}

export interface WorkflowDataVars {
  projectID: string;
}
