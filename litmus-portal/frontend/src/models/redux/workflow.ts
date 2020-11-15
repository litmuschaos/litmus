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

export interface customWorkflow {
  experiment_name: string;
  hubName?: string;
  repoUrl?: string;
  repoBranch?: string;
  description: string;
  yamlLink?: string;
  yaml?: string;
  index?: number;
}

export interface WorkflowData {
  name: string;
  link: string;
  yaml: string;
  id: string;
  description: string;
  weights: experimentMap[];
  isCustomWorkflow: boolean;
  namespace: string;
  clustername: string;
  clusterid: string;
  cronSyntax: string;
  scheduleType: scheduleType;
  scheduleInput: scheduleInput;
  customWorkflow: customWorkflow;
  customWorkflows: customWorkflow[];
  stepperActiveStep: number;
}

export enum WorkflowActions {
  SET_WORKFLOW_DETAILS = 'SET_WORKFLOW_DETAILS',
  SET_CUSTOM_WORKFLOW = 'SET_CUSTOM_WORKFLOW',
}

interface WorkflowActionType<T, P> {
  type: T;
  payload: P;
}

export type WorkflowAction =
  | WorkflowActionType<
      typeof WorkflowActions.SET_WORKFLOW_DETAILS,
      WorkflowData
    >
  | WorkflowActionType<
      typeof WorkflowActions.SET_CUSTOM_WORKFLOW,
      WorkflowData
    >;
