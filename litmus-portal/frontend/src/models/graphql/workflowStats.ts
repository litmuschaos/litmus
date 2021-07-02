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
