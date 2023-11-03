export interface PodLogResponse {
  workflowRunID: string;
  podName: string;
  podType: string;
  log: string;
}

export interface PodLogRequest {
  request: {
    clusterID: string;
    workflowRunID: string;
    podName: string;
    podNamespace: string;
    podType: string;
    expPod?: string;
    runnerPod?: string;
    chaosNamespace?: string;
  };
}

export interface PodLog {
  getPodLog: PodLogResponse;
}
