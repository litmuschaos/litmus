export interface WeightageMap {
  experimentName: string;
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
  resiliencyScore?: number;
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

export interface WorkflowRun {
  executionData: string;
  lastUpdated: string;
  workflowRunID: string;
}

export interface ScheduledWorkflow {
  workflowID: string;
  workflowManifest: string;
  cronSyntax: string;
  clusterName: string;
  workflowName: string;
  workflowDescription: string;
  weightages: WeightageMap[];
  isCustomWorkflow: string;
  updatedAt: string;
  createdAt: string;
  projectID: string;
  clusterID: string;
  clusterType: string;
  isRemoved: Boolean;
  lastUpdatedBy: string;
}

export interface WorkflowList {
  listWorkflow: ScheduledWorkflow[];
}

export interface WorkflowListDataVars {
  projectID: string;
  workflowIDs: string[];
}

export interface ListManifestTemplateArray {
  templateID: string;
  manifest: string;
  projectName: string;
  templateDescription: string;
  templateName: string;
  isCustomWorkflow: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface ListManifestTemplate {
  listManifestTemplate: ListManifestTemplateArray[];
}

export interface SortInput {
  field: 'Name' | 'Time';
  descending?: Boolean;
}

export interface WorkflowFilterInput {
  workflowName?: string;
  clusterName?: string;
}
export interface ListWorkflowsInput {
  workflowInput: {
    projectID: string;
    workflowIDs?: string[];
    pagination?: Pagination;
    sort?: SortInput;
    filter?: WorkflowFilterInput;
  };
}

export interface ListWorkflowsOutput {
  totalNoOfWorkflows: number;
  workflows: ScheduledWorkflow[];
}

export interface ScheduledWorkflows {
  listWorkflow: ListWorkflowsOutput;
}
