import type { Audit, ResourceDetails, UserDetails } from './common';

export enum AuthType {
  SSH = 'SSH',
  NONE = 'NONE',
  TOKEN = 'TOKEN'
}

export enum RepoType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export enum FileType {
  EXPERIMENT = 'EXPERIMENT',
  ENGINE = 'ENGINE',
  FAULT = 'FAULT',
  CSV = 'CSV'
}

export enum HubType {
  GIT = 'GIT',
  REMOTE = 'REMOTE'
}

export interface ChaosHub extends Audit, ResourceDetails {
  id: string;
  repoURL: string;
  repoBranch: string;
  projectID: string;
  name: string;
  tags?: [string];
  createdBy?: UserDetails;
  updatedBy?: UserDetails;
  description?: string;
  hubType?: HubType;
  isPrivate?: boolean;
  authType: AuthType;
  token?: string;
  userName?: string;
  password?: string;
  sshPublicKey?: string;
  sshPrivateKey?: string;
  isRemoved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastSyncedAt: string;
  isDefault: boolean;
  isAvailable: boolean;
  totalFaults: string;
  totalExperiments: string;
}

export interface PredefinedExperiment {
  experimentName: string;
  experimentCSV: string;
  experimentManifest: string;
}

export interface Chart {
  apiVersion: string;
  kind: string;
  metadata: Metadata;
  spec: Spec;
  packageInfo: PackageInformation;
}

interface Annotation {
  categories: string;
  vendor: string;
  createdAt: string;
  repository: string;
  support: string;
  chartDescription: string;
}

interface Metadata {
  name: string;
  version: string;
  annotations: Annotation;
}

interface Maintainer {
  name: string;
  email: string;
}

interface Link {
  name: string;
  url: string;
}

interface Provider {
  name: string;
}

export interface Spec {
  displayName: string;
  categoryDescription: string;
  keywords: Array<string>;
  maturity: string;
  maintainers: Array<Maintainer>;
  minKubeVersion: string;
  provider: Provider;
  links: Array<Link>;
  faults: Array<FaultList>;
  experiments: Array<string>;
  chaosExpCRDLink: string;
  platforms: Array<string>;
  chaosType?: string | null;
}

export interface FaultList {
  name: string;
  displayName: string;
  description: string;
}

interface Experiments {
  name: string;
  CSV: string;
  desc: string;
}

interface PackageInformation {
  packageName: string;
  experiments: Array<Experiments>;
}

export interface ChaosHubFilterInput {
  chaosHubName?: string;
  description?: string;
  tags?: Array<string>;
}
