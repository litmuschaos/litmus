export interface PodLogRequest {
  cluster_id: string;
  workflow_run_id: string;
  pod_name: string;
  pod_namespace: string;
  pod_type: string;
  exp_pod?: string;
  runner_pod?: string;
  chaos_namespace?: string;
}

export interface PodLogResponse {
  workflow_run_id: string;
  pod_name: string;
  pod_type: string;
  log: string;
}

export interface ProbeResponse {
  name: string;
  type: string;
  status: Object;
}

export interface ChaosResultResponse {
  phase: string;
  verdict: string;
  failStep: string;
  probeSuccessPercentage: string;
  probeStatus: ProbeResponse[];
  passedRuns: number;
  failedRuns: number;
  stoppedRuns: number;
}

export interface PodLogVars {
  podDetails: PodLogRequest;
}

export interface PodLog {
  getPodLog: PodLogResponse;
}
