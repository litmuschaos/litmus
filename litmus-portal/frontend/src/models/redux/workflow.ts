export interface experimentMap {
  experimentName: string;
  weight: number;
}

export interface scheduleType {
  scheduleOnce: string;
  recurringSchedule: string;
}

export interface scheduleInput {
  hour_interval: number;
  day: number;
  weekday: string;
  time: Date;
  date: Date;
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
  cronSyntax: string;
  scheduleType: scheduleType;
  scheduleInput: scheduleInput;
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
