export type DateValue = {
  date: number;
  value: number;
};

export enum Filter {
  MONTHLY = 'MONTHLY',
  DAILY = 'DAILY',
  HOURLY = 'HOURLY',
}

export interface WorkflowStatsResponse {
  getWorkflowStats: Array<DateValue>;
}

export interface WorkflowStatsVars {
  filter: Filter;
  projectID: string;
  showWorkflowRuns: boolean;
}
