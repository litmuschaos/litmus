/* eslint-disable @typescript-eslint/no-explicit-any */
export type Toleration = any;

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
  type?: string;
}
