import type { Audit, ResourceDetails } from './common';

export enum InfrastructureType {
  KUBERNETES = 'Kubernetes'
}

export enum InfrastructureUpdateStatus {
  AVAILABLE = 'AVAILABLE',
  MANDATORY = 'MANDATORY',
  NOT_REQUIRED = 'NOT_REQUIRED'
}

export enum InfrastructureInstallationType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  ALL = 'ALL'
}

export interface Infra extends Audit, ResourceDetails {
  infraID: string;
  environmentID: string;
  infraType: InfrastructureInstallationType;
  isActive: boolean;
  isInfraConfirmed: boolean;
  noOfExperiments?: number;
  noOfExperimentRuns?: number;
  lastExperimentTimestamp?: string;
  startTime: string;
  version: string;
  lastHeartbeat: string;
  infraNamespace?: string;
  infraScope?: string;
}

export enum InfraScope {
  NAMESPACE = 'namespace',
  CLUSTER = 'cluster'
}

export enum InstallationType {
  MANIFEST = 'MANIFEST'
}

export interface KubernetesChaosInfrastructure extends Omit<Infra, 'infraType'> {
  platformName: string;
  token: string;
  serviceAccount?: string;
  infraScope: InfraScope;
  installationType: InstallationType;
  k8sConnectorID: string;
  updateStatus: InfrastructureUpdateStatus;
}
