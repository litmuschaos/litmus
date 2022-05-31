export interface WeightMap {
  experimentName: string;
  weightage: number;
}

export interface CreateWorkFlowRequest {
  request: {
    workflowID?: string;
    workflowManifest: string;
    cronSyntax: string;
    workflowName: string;
    workflowDescription: string;
    isCustomWorkflow: boolean;
    weightages: WeightMap[];
    projectID: string;
    clusterID: string;
  };
}

export interface UpdateWorkflowResponse {
  workflowID: string;
  workflowName: string;
  workflowDescription: string;
  isCustomWorkflow: string;
  cronSyntax: string;
}

export interface CreateWorkflowResponse {
  clusterID: string;
  isActive: boolean;
}

export interface GVRRequest {
  group: string;
  version: string;
  resource: string;
}

export interface KubeObjRequest {
  request: {
    clusterID: string;
    objectType: string;
    kubeObjRequest: GVRRequest;
  };
}

export interface KubeObjResponse {
  getKubeObject: {
    clusterID: string;
    kubeObj: string;
  };
}

export interface KubeObjResource {
  apiVersion: string;
  containers: object;
  creationTimestamp: string;
  labels: string;
  name: string;
  namespace: string;
  terminationGracePeriods: string;
  uid: string;
  volumes: object;
}

export interface KubeObjData {
  namespace: string;
  data: KubeObjResource[];
}
