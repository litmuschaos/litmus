export interface Node {
  children: string[] | null;
  finishedAt: string;
  name: string;
  phase: string;
  startedAt: string;
  type: string;
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
  nodes: object;
}

export interface WorkflowRun {
  cluster_name: string;
  execution_data: string;
  last_updated: string;
  project_id: string;
  workflow_id: string;
  workflow_name: string;
  workflow_run_id: string;
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
