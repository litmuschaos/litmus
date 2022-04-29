import { MyHubType } from '../graphql/user';

export interface Chart {
  apiVersion: string;
  kind: string;
  metadata: Metadata;
  spec: Spec;
  packageInfo: PackageInfo;
}

export interface Spec {
  displayName: string;
  categoryDescription: string;
  keywords: string[];
  maturity: string;
  maintainers: Maintainer[];
  minKubeVersion: string;
  provider: string;
  links: Link[];
  experiments: string[];
  chaosExpCRDLink: string;
  platforms: string[];
  chaosType: string;
}

export interface Maintainer {
  name: string;
  email: string;
}

export interface Link {
  name: string;
  url: string;
}

export interface Metadata {
  name: string;
  version: string;
  annotations: Annotation[];
}

export interface Annotation {
  categories: string;
  vendor: string;
  createdAt: string;
  repository: string;
  support: string;
  chartDescription: string;
}

export interface PackageInfo {
  packageName: string;
  experiments: Experiments[];
}

export interface Experiments {
  name: string;
  csv: string;
  desc: string;
}

export interface ChartsInput {
  hubName: string;
  userName: string;
  repoURL: string;
  repoBranch: string;
}

export interface Charts {
  getCharts: Chart[];
}

export interface ExperimentDetail {
  getHubExperiment: Chart;
}

export interface HubDetails {
  id: string;
  hubName: string;
  repoURL: string;
  repoBranch: string;
  totalExp: string;
  isAvailable: boolean;
  authType?: MyHubType;
  isPrivate: boolean;
  token: string;
  userName: string;
  password: string;
  sshPrivateKey: string;
  sshPublicKey: string;
  lastSyncedAt: string;
}

export interface HubStatus {
  getHubStatus: HubDetails[];
}

export enum MyHubActions {
  SET_MYHUB = 'SET_MYHUBS',
}

interface MyHubActionType<T, P> {
  type: T;
  payload: P;
}

export type MyHubAction = MyHubActionType<
  typeof MyHubActions.SET_MYHUB,
  HubDetails
>;
