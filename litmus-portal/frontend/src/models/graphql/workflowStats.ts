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
  listWorkflowStats: Array<DateValue>;
}

export interface WorkflowStatsVars {
  filter: Filter;
  projectID: string;
  showWorkflowRuns: boolean;
}
