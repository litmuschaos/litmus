export interface Weights {
  experimentName: string;
  weightage: number;
}

export interface ScheduleWorkflow {
  clusterID: string;
  createdAt: string;
  cronSyntax: string;
  isCustomWorkflow: string;
  projectID: string;
  updatedAt: string;
  weightages: Weights[];
  workflowDescription: string;
  workflowID: string;
  workflowManifest: string;
  workflowName: string;
  clusterName: string;
  clusterType: string;
  regularity?: string;
  isRemoved: boolean;
  lastUpdatedBy: string;
}
export interface DeleteSchedule {
  workflowID: string;
}
