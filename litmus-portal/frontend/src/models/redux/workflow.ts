export interface experimentMap {
  experimentName: string;
  weight: number;
}
export interface WorkflowData {
  name: string;
  link: string;
  yaml: string;
  id: string;
  description: string;
  weights: experimentMap[];
  isCustomWorkflow: boolean;
  clusterid: string;
}

export enum WorkflowActions {
  SET_WORKFLOW_DETAILS = 'SET_WORKFLOW_DETAILS',
}

interface WorkflowActionType<T, P> {
  type: T;
  payload: P;
}

export type WorkflowAction = WorkflowActionType<
  typeof WorkflowActions.SET_WORKFLOW_DETAILS,
  WorkflowData
>;
