export type DateValue = {
  date: number;
  value: number;
};

export enum Filter {
  Monthly = 'Monthly',
  Daily = 'Daily',
  Hourly = 'Hourly',
}

export interface WorkflowStatsResponse {
  getWorkflowStats: Array<DateValue>;
}

export interface WorkflowStatsVars {
  filter: Filter;
  project_id: string;
  show_workflow_runs: boolean;
}

export const resilienceScoreColourMap = {
  0: '#FD6868',
  14: '#FE9A9A',
  27: '#FEC3C3',
  40: '#EECC91',
  50: '#E3AD4F',
  60: '#E79F32',
  70: '#9BE9A8',
  80: '#40C463',
  90: '#109B67',
};
