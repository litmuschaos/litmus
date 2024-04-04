import type * as kubernetes from './k8s';

// ChaosEngine is the Schema for the chaosengines API
export interface ChaosEngine {
  apiVersion?: string;
  kind?: string;
  metadata?: kubernetes.ObjectMeta;
  spec?: ChaosEngineSpec;
  status?: ChaosEngineStatus;
}

// ChaosEngineSpec defines the desired state of ChaosEngine
// ChaosEngineSpec describes a user-facing custom resource which is used by developers
// to create a chaos profile
export interface ChaosEngineSpec {
  //Appinfo contains deployment details of AUT
  appinfo?: ApplicationParams;
  //AnnotationCheck defines whether annotation check is allowed or not. It can be true or false
  annotationCheck?: string;
  //DefaultAppHealthCheck defines whether default health checks should be executed or not. It can be true or false
  // default value is true
  defaultAppHealthCheck?: string;
  //ChaosServiceAccount is the SvcAcc specified for chaos runner pods
  chaosServiceAccount: string;
  //Components contains the image, imagePullPolicy, arguments, and commands of runner
  components?: ComponentParams;
  //Consists of experiments executed by the engine
  experiments: FaultList[];
  //JobCleanUpPolicy decides to retain or delete the jobs
  jobCleanUpPolicy?: CleanUpPolicy;
  //AuxiliaryAppInfo contains details of dependent applications (infra chaos)
  auxiliaryAppInfo?: string;
  //EngineStatus is a requirement for validation
  engineState: EngineState;
  // TerminationGracePeriodSeconds contains terminationGracePeriod for the chaos resources
  terminationGracePeriodSeconds?: number;
}

// EngineState provides interface for all supported strings in spec.EngineState
export type EngineState = 'active' | 'stop';

// FaultStatus is export interfacecasted to string for supporting the values below.
export type FaultStatus =
  | 'Running'
  | 'Completed'
  | 'Waiting for Job Creation'
  | 'ChaosFault Not Found'
  | 'Forcefully Aborted'
  | 'Skipped';

// EngineStatus provides interface for all supported strings in status.EngineStatus
export type EngineStatus = 'initialized' | 'completed' | 'stopped';

// CleanUpPolicy defines the garbage collection method used by chaos-operator
export type CleanUpPolicy = 'delete' | 'retain';

// ChaosEngineStatus defines the observed state of ChaosEngine
// ChaosEngineStatus derives information about status of individual experiments
export interface ChaosEngineStatus {
  //EngineStatus is a export interfaced string to support limited values for ChaosEngine Status
  engineStatus: EngineStatus;
  //Detailed status of individual experiments
  experiments: FaultStatuses[];
}

// ApplicationParams defines information about Application-Under-Test (AUT) on the cluster
// Controller expects AUT to be annotated with litmuschaos.io/chaos: "true" to run chaos
export interface ApplicationParams {
  //Namespace of the AUT
  appns?: string;
  //Unique label of the AUT
  applabel?: string;
  //kind of application
  appkind?: string;
}

// ComponentParams defines information about the runner
export interface ComponentParams {
  //Contains information of the the runner pod
  runner: RunnerInfo;
}

// RunnerInfo defines the information of the runnerinfo pod
export interface RunnerInfo {
  //Image of the runner pod
  image?: string;
  //Type of runner
  type?: string;
  //Args of runner
  args?: string[];
  //Command for runner
  command?: string[];
  //ImagePullPolicy for runner pod
  imagePullPolicy?: kubernetes.PullPolicy;
  //ImagePullSecrets for runner pod
  imagePullSecrets?: kubernetes.LocalObjectReference[];
  // Runner Annotations that needs to be provided in the pod for pod that is getting created
  runnerAnnotation?: { [key: string]: string };
  // NodeSelector for runner pod
  nodeSelector?: { [key: string]: string };
  // ConfigMaps for runner pod
  configMaps?: kubernetes.ConfigMap[];
  // Secrets for runner pod
  secrets?: kubernetes.Secret[];
  // Tolerations for runner pod
  tolerations?: kubernetes.Toleration;
  // Resource requirements for the runner pod
  resources?: kubernetes.ResourceRequirements;
}

// FaultList defines information about chaos experiments defined in the chaos engine
// These experiments are "pulled" as versioned charts from a "hub"
export interface FaultList {
  //Name of the chaos experiment
  name: string;
  //Holds properties of an experiment listed in the engine
  spec: FaultAttributes;
}

// FaultAttributes defines attributes of experiments
export interface FaultAttributes {
  //Execution priority of the chaos experiment
  rank?: number;
  // It contains env, configmaps, secrets, experimentImage, node selector, custom experiment annotation
  // which can be provided or overridden from the chaos engine
  components?: FaultComponents;
  // Probe contains details of probe, which can be applied on the experiments
  // Probe can be httpProbe, k8sProbe or cmdProbe
  probe?: ProbeAttributes[];
}

// ProbeAttributes contains details of probe, which can be applied on the experiments
export interface ProbeAttributes {
  // Name of probe
  name: string;
  // Type of probe
  type?: string;
  // inputs needed for the k8s probe
  'k8sProbe/inputs'?: K8sProbeInputs;
  // inputs needed for the http probe
  'httpProbe/inputs'?: HTTPProbeInputs;
  // inputs needed for the cmd probe
  'cmdProbe/inputs'?: CmdProbeInputs;
  // inputs needed for the prometheus probe
  'promProbe/inputs'?: PromProbeInputs;
  // RunProperty contains timeout, retry and interval for the probe
  runProperties?: RunProperty;
  // mode for k8s probe
  // it can be SOT, EOT, Edge
  mode: string;
  // Data contains the manifest/data for the resource, which need to be created
  // it supported for create operation only
  data?: string;
}

// K8sProbeInputs contains all the inputs required for k8s probe
export interface K8sProbeInputs {
  // group of the resource
  group?: string;
  // apiversion of the resource
  version: string;
  // kind of resource
  resource: string;
  // ResourceNames to get the resources using their list of comma separated names
  resourceNames?: string;
  // namespace of the resource
  namespace?: string;
  // fieldselector to get the resource using fields selector
  fieldSelector?: string;
  // labelselector to get the resource using labels selector
  labelSelector?: string;
  // Operation performed by the k8s probe
  // it can be create, delete, present, absent
  operation: string;
}

//CmdProbeInputs contains all the inputs required for cmd probe
export interface NewCmdProbeInputs {
  // Command need to be executed for the probe
  command: string;
  // Comparator check for the correctness of the probe output
  comparator: ComparatorInfo;
  // The source where we have to run the command
  // It will run in inline(inside experiment itself) mode if source is nil
  source?: string;
}

//CmdProbeInputs contains all the inputs required for cmd probe
export interface CmdProbeInputs {
  // Command need to be executed for the probe
  command: string;
  // Comparator check for the correctness of the probe output
  comparator: ComparatorInfo;
  // The source where we have to run the command
  // It will run in inline(inside experiment itself) mode if source is nil
  source?: SourceDetails;
}

// SourceDetails contains source details of the cmdProbe
export interface SourceDetails {
  // Image for the source pod
  image?: string;
  // HostNetwork define the hostNetwork of the external pod
  // it supports boolean values and default value is false
  hostNetwork?: boolean;
  // InheritInputs defined to inherit experiment pod attributes(ENV, volumes, and volumeMounts) into probe pod
  // it supports boolean values and default value is false
  inheritInputs?: boolean;
  // Args for the source pod
  args?: string[];
  // ENVList contains ENV passed to the source pod
  env?: kubernetes.EnvVar[];
  // Labels for the source pod
  labels?: { [key: string]: string };
  // Annotations for the source pod
  annotations?: { [key: string]: string };
  // Command for the source pod
  command?: string[];
  // ImagePullPolicy for the source pod
  imagePullPolicy?: kubernetes.PullPolicy;
  //ImagePullSecrets for runner pod
  imagePullSecrets?: kubernetes.LocalObjectReference[];
  // Privileged for the source pod
  privileged?: boolean;
  // NodeSelector for the source pod
  nodeSelector?: { [key: string]: string };
  // Volumes for the source pod
  volumes?: kubernetes.Volume;
  // VolumesMount for the source pod
  volumesMount?: kubernetes.VolumeMount;
}

//PromProbeInputs contains all the inputs required for prometheus probe
export interface PromProbeInputs {
  // Endpoint for the prometheus probe
  endpoint?: string;
  // Query to get promethus metrics
  query?: string;
  // QueryPath contains filePath, which contains prometheus query
  queryPath?: string;
  // Comparator check for the correctness of the probe output
  comparator?: ComparatorInfo;
}

// Identifier required for fetching details from the Platform APIs
export interface Identifier {
  // AccountIdentifier for account ID
  accountIdentifier?: string;
  // OrgIdentifier for organization ID
  orgIdentifier?: string;
  // ProjectIdentifier for project ID
  projectIdentifier?: string;
}

// ComparatorInfo contains the comparator details
export interface ComparatorInfo {
  // type of data
  // it can be int, float, string
  type?: string;
  // Criteria for matching data
  // it supports >=, <=, ==, >, <, != for int and float
  // it supports equal, notEqual, contains for string
  criteria: string;
  // Value contains relative value for criteria
  value: string;
}

//HTTPProbeInputs contains all the inputs required for http probe
export interface HTTPProbeInputs {
  // URL which needs to curl, to check the status
  url: string;
  // InsecureSkipVerify flag to skip certificate checks
  insecureSkipVerify?: boolean;
  // Method define the http method, it can be get or post
  method: HTTPMethod;
  // ResponseTimeout contains the http response timeout
  responseTimeout?: number;
}

// HTTPMethod define the http method details
export interface HTTPMethod {
  get?: GetMethod;
  post?: PostMethod;
}

// GetMethod define the http Get method
export interface GetMethod {
  // Criteria for matching data
  // it supports  == != operations
  criteria: string;
  // Value contains relative value for criteria
  responseCode: string;
}

// PostMethod define the http Post method
export interface PostMethod {
  // ContentType contains content type for http body data
  contentType?: string;
  // Body contains http body for post request
  body?: string;
  // BodyPath contains filePath, which contains http body
  bodyPath?: string;
  // Criteria for matching data
  // it supports  == != operations
  criteria: string;
  // Value contains relative value for criteria
  responseCode: string;
}

//RunProperty contains timeout, retry and interval for the probe
export interface RunProperty {
  //ProbeTimeout contains timeout for the probe
  probeTimeout?: string;
  // Interval contains the interval for the probe
  interval?: string;
  // Attempt contains the attempt count for the probe
  attempt?: number;
  // Retry contains the retry count for the probe
  retry?: number;
  // ProbePollingInterval contains time interval, for which continuous probe should be sleep
  // after each iteration
  probePollingInterval?: string;
  // InitialDelaySeconds time interval for which probe will wait before run
  initialDelay?: string;
  // EvaluationTimeout is the timeout window in which the SLO metrics
  evaluationTimeout?: string;
  // StopOnFailure contains flag to stop/continue experiment execution, if probe fails
  // it will stop the experiment execution, if provided true
  // it will continue the experiment execution, if provided false or not provided(default case)
  stopOnFailure?: boolean;
}

// FaultComponents contains ENV, Configmaps and Secrets
export interface FaultComponents {
  env?: kubernetes.EnvVar[];
  configMaps?: kubernetes.ConfigMap;
  secrets?: kubernetes.Secret;
  experimentAnnotations?: { [key: string]: string };
  experimentImage?: string;
  experimentImagePullSecrets?: kubernetes.LocalObjectReference[];
  nodeSelector?: { [key: string]: string };
  statusCheckTimeouts?: StatusCheckTimeout;
  resources?: kubernetes.ResourceRequirements;
  tolerations?: kubernetes.Toleration;
}

// StatusCheckTimeout contains Delay and timeouts for the status checks
export interface StatusCheckTimeout {
  delay?: number;
  timeout?: number;
}

// FaultStatuses defines information about status of individual experiments
// These fields are immutable, and are derived by kubernetes(operator)
export interface FaultStatuses {
  //Name of the chaos experiment
  name: string;
  //Name of chaos-runner pod managing this experiment
  runner: string;
  //Name of experiment pod executing the chaos
  experimentPod: string;
  //Current state of chaos experiment
  dtatus: FaultStatus;
  //Result of a completed chaos experiment
  verdict: string;
  //Time of last state change of chaos experiment
  lastUpdateTime: kubernetes.Time;
}
