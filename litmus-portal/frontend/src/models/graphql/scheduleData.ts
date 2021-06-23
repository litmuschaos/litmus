export interface Weights {
  experiment_name: string;
  weightage: number;
}

export interface ScheduleWorkflow {
  cluster_id: string;
  created_at: string;
  cronSyntax: string;
  isCustomWorkflow: string;
  project_id: string;
  updated_at: string;
  weightages: Weights[];
  workflow_description: string;
  workflow_id: string;
  workflow_manifest: string;
  workflow_name: string;
  cluster_name: string;
  cluster_type: string;
  regularity?: string;
  isRemoved: boolean;
}
export interface DeleteSchedule {
  workflow_id: string;
}

export interface WorkflowStatsVars {
  filter: Filter;
  project_id: string;
  show_workflow_runs: boolean;
}

export interface DateValue {
  date: number;
  value: number;
}

export interface WorkflowStatsResponse {
  getScheduledWorkflowStats: Array<DateValue>;
}

export enum Filter {
  monthly = 'Monthly',
  weekly = 'Weekly',
  hourly = 'Hourly',
}
