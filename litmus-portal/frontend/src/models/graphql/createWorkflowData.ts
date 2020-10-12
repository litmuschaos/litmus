export interface WeightMap {
  experiment_name: string;
  weightage: number;
}
export interface CreateWorkFlowInput {
  ChaosWorkFlowInput: {
    workflow_manifest: string;
    cronSyntax: string;
    workflow_name: string;
    workflow_description: string;
    isCustomWorkflow: boolean;
    weightages: WeightMap[];
    project_id: string;
    cluster_id: string;
  };
}

export interface CreateWorkflowResponse {
  cluster_id: string;
  is_active: boolean;
}
