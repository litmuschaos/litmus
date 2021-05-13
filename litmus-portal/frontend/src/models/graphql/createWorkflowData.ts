export interface WeightMap {
  experiment_name: string;
  weightage: number;
}
export interface CreateWorkFlowInput {
  ChaosWorkFlowInput: {
    workflow_id?: string;
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

export interface UpdateWorkflowResponse {
  workflow_id: string;
  workflow_name: string;
  workflow_description: string;
  isCustomWorkflow: string;
  cronSyntax: string;
}

export interface CreateWorkflowResponse {
  cluster_id: string;
  is_active: boolean;
}

export interface GVRRequest {
  group: string;
  version: string;
  resource: string;
}

export interface KubeObjRequest {
  data: {
    cluster_id: string;
    object_type: string;
    kube_obj_request: GVRRequest;
  };
}

export interface KubeObjResponse {
  getKubeObject: {
    cluster_id: string;
    kube_obj: string;
  };
}

export interface KubeObjResource {
  api_version: string;
  containers: object;
  creation_timestamp: string;
  labels: string;
  name: string;
  namespace: string;
  termination_grace_periods: string;
  uid: string;
  volumes: object;
}

export interface KubeObjData {
  namespace: string;
  data: KubeObjResource[];
}

export interface ImageRegistryInfo {
  image_registry_name: string;
  image_repo_name: string;
  image_registry_type: string;
  secret_name: string;
  secret_namespace: string;
  enable_registry: boolean;
}
