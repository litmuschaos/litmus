/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Time = string;
export type VolumeDevice = any;
export type Volume = any;
export type EnvFromSource = any;
export type EnvVarSource = any;
export type ResourceRequirements = any;
export type VolumeMount = any;
export type Probe = any;
export type Lifecycle = any;
export type TerminationMessagePolicy = any;
export type PullPolicy = any;
export type PersistentVolumeClaim = any;
export type Affinity = any;
export type PodSecurityContext = any;
export type HostPathType = any;
export type SecurityContext = any;

export interface Toleration {
  tolerationSeconds?: number;
  key?: string;
  operator?: string;
  effect?: string;
  value?: string;
}

export interface ListMeta {
  continue?: string;
  resourceVersion?: string;
  selfLink?: string;
}

export interface ObjectMeta {
  name?: string;
  generateName?: string;
  namespace?: string;
  selfLink?: string;
  uid?: string;
  resourceVersion?: string;
  generation?: number;
  creationTimestamp?: Time;
  deletionTimestamp?: Time;
  deletionGracePeriodSeconds?: number;
  labels?: { [name: string]: string };
  annotations?: { [name: string]: string };
  ownerReferences?: any[];
  initializers?: any;
  finalizers?: string[];
  clusterName?: string;
}

export interface TypeMeta {
  kind?: string;
  apiVersion?: string;
}

export interface LocalObjectReference {
  name?: string;
}

export interface ObjectReference {
  kind?: string;
  namespace?: string;
  name?: string;
  uid?: string;
  apiVersion?: string;
  resourceVersion?: string;
  fieldPath?: string;
}

export interface SecretKeySelector extends LocalObjectReference {
  key: string;
  optional: boolean;
}

export interface ContainerPort {
  name?: string;
  hostPort?: number;
  containerPort: number;
  protocol?: string;
  hostIP?: string;
}

export interface EnvVar {
  name: string;
  value?: string;
  valueFrom?: EnvVarSource;
}

export interface Container {
  name: string;
  image?: string;
  command?: string[];
  args?: string[];
  workingDir?: string;
  ports?: ContainerPort[];
  envFrom?: EnvFromSource[];
  env?: EnvVar[];
  resources?: ResourceRequirements;
  volumeMounts?: VolumeMount[];
  livenessProbe?: Probe;
  readinessProbe?: Probe;
  lifecycle?: Lifecycle;
  terminationMessagePath?: string;
  terminationMessagePolicy?: TerminationMessagePolicy;
  imagePullPolicy?: PullPolicy;
  securityContext?: SecurityContext;
  stdin?: boolean;
  stdinOnce?: boolean;
  tty?: boolean;
}

export interface WatchEvent<T> {
  object: T;
  type: 'ADDED' | 'MODIFIED' | 'DELETED' | 'ERROR';
}

export interface ConfigMap {
  data?: { [key: string]: string };
  name: string;
  mountPath: string;
}

export interface Secret {
  name: string;
  mountPath: string;
}

export interface PolicyRule {
  verbs: string[];
  apiGroups?: string[];
  resources?: string[];
  resourceNames?: string[];
  nonResourceURLs?: string[];
}

export interface HostFile {
  name: string;
  mountPath: string;
  nodePath: string;
  type?: HostPathType;
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
  env?: EnvVar[];
  // Labels for the source pod
  labels?: { [key: string]: string };
  // Annotations for the source pod
  annotations?: { [key: string]: string };
  // Command for the source pod
  command?: string[];
  // ImagePullPolicy for the source pod
  imagePullPolicy?: PullPolicy;
  //ImagePullSecrets for runner pod
  imagePullSecrets?: LocalObjectReference[];
  // Privileged for the source pod
  privileged?: boolean;
  // NodeSelector for the source pod
  nodeSelector?: { [key: string]: string };
  // Volumes for the source pod
  volumes?: Volume;
  // VolumesMount for the source pod
  volumesMount?: VolumeMount;
}
