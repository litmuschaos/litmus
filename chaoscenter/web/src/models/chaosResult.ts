import type * as kubernetes from './k8s';

// ChaosResult is the Schema for the chaosresults API
export interface ChaosResult {
  apiVersion?: string;
  kind?: string;
  metadata?: kubernetes.ObjectMeta;
  spec?: ChaosResultSpec;
  status?: ChaosResultStatus;
}

// ChaosResultSpec defines the desired state of ChaosResult
// The chaosresult holds the status of a chaos experiment that is listed as an item
// in the chaos engine to be run against a given app.
export interface ChaosResultSpec {
  // engine defines the name of chaosEngine
  engine?: string;
  // experiment defines the name of chaosexperiment
  experiment: string;
  // instance defines the instance id
  instance?: string;
}

// ResultPhase is typecasted to string for supporting the values below.
export type ResultPhase = 'Running' | 'Completed' | 'Stopped';

// ResultVerdict is typecasted to string for supporting the values below.
export type ResultVerdict = 'Pass' | 'Fail' | 'Stopped' | 'Awaited';

export type ProbeVerdict = 'Passed' | 'Failed' | 'N/A' | 'NA' | 'Awaited';

// ChaosResultStatus defines the observed state of ChaosResult
export interface ChaosResultStatus {
  // experimentStatus contains the status,verdict of the experiment
  experimentStatus: TestStatus;
  // probeStatus contains the status of the probe
  probeStatuses?: ProbeStatuses[];
  // history contains cumulative values of verdicts
  history?: HistoryDetails;
}

// TestStatus defines information about the status and results of a chaos experiment
export interface TestStatus {
  // phase defines whether an experiment is running or completed
  phase: ResultPhase;
  // verdict defines whether an experiment result is pass or fail
  verdict: ResultVerdict;
  // FailureOutput defines failed step and errorCode, if experiment failed
  failureOutput?: FailureOutput;
  // FailureOutput defines failed step and errorCode, if experiment failed
  errorOutput?: ErrorOutput;
  // probeSuccessPercentage defines the score of the probes
  probeSuccessPercentage?: string;
}

export interface FailureOutput {
  // ErrorCode defines error code of the experiment
  errorCode?: string;
  // FailedStep defines step where the experiments failed
  failedStep?: string;
}

export interface ErrorOutput {
  // ErrorCode defines error code of the experiment
  errorCode?: string;
  // Reason contains the error reason
  reason?: string;
}

// ProbeStatus defines information about the status and result of the probes
export interface ProbeStatuses {
  // name defines the name of probe
  name?: string;
  // type defined the type of probe, supported values: K8sProbe, HttpProbe, CmdProbe
  type?: string;
  // mode defined the mode of probe, supported values: SOT, EOT, Edge, OnChaos, Continuous
  mode?: string;
  // status defines whether a probe is pass or fail
  status?: ProbeStatus;
}

// ProbeStatus defines information about the status and result of the probes
export interface ProbeStatus {
  // verdict defines the verdict of the probe, range: Passed, Failed, N/A
  verdict?: ProbeVerdict;
  // description defines the description of probe status
  description?: string;
}

// HistoryDetails contains cumulative values of verdicts
export interface HistoryDetails {
  passedRuns: number;
  failedRuns: number;
  stoppedRuns: number;
  targets?: TargetDetails[];
}

// TargetDetails contains target details for the experiment and the chaos status
export interface TargetDetails {
  name?: string;
  kind?: string;
  chaosStatus?: string;
}
