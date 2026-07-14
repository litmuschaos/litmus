import type * as kubernetes from './k8s';

// ChaosExperiment is the Schema for the chaosexperiments API
export interface ChaosExperiment {
  apiVersion?: string;
  kind?: string;
  description?: Description;
  metadata?: kubernetes.ObjectMeta;
  spec?: ChaosExperimentSpec;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status?: any;
}

export interface Description {
  message?: string;
}

// ChaosExperimentSpec defines the desired state of ChaosExperiment
// An experiment is the definition of a chaos test and is listed as an item
// in the chaos engine to be run against a given app.
export interface ChaosExperimentSpec {
  // Definition carries low-level chaos options
  definition: FaultDef;
}

// FaultDef defines information about nature of chaos & components subjected to it
export interface FaultDef {
  // Default labels of the runner pod
  labels?: { [key: string]: string };
  // Image of the chaos experiment
  image: string;
  // ImagePullPolicy of the chaos experiment container
  imagePullPolicy?: kubernetes.PullPolicy;
  //Scope specifies the service account scope (& thereby blast radius) of the experiment
  scope: string;
  // List of Permission needed for a service account to execute experiment
  permissions: kubernetes.PolicyRule[];
  // List of ENV vars passed to executor pod
  env?: kubernetes.EnvVar[];
  // Defines command to invoke experiment
  command: string[];
  // Defines arguments to runner's entrypoint command
  args: string[];
  // ConfigMaps contains a list of ConfigMaps
  configMaps?: kubernetes.ConfigMap[];
  // Secrets contains a list of Secrets
  secrets?: kubernetes.Secret[];
  // HostFileVolume defines the host directory/file to be mounted
  hostFileVolumes?: kubernetes.HostFile;
  // Annotations that needs to be provided in the pod for pod that is getting created
  experimentAnnotations: { [key: string]: string };
  // SecurityContext holds security configuration that will be applied to a container
  securityContext?: kubernetes.SecurityContext;
  // HostPID is need to be provided in the chaospod
  hostPID?: boolean;
}
