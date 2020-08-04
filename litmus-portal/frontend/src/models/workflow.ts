export interface WorkflowData {
  name: string;
  link: string;
  yaml: string;
  id: string;
  description: string;
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
  { name: string; link: string; context: string }
>;
