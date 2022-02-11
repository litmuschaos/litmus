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
  last_updated_by: string;
}
export interface DeleteSchedule {
  workflow_id: string;
}
