export interface Chart {
  ApiVersion: string;
  Kind: string;
  Metadata: Metadata;
  Spec: Spec;
  PackageInfo: PackageInfo;
  Experiments: Chart[];
}

export interface Spec {
  DisplayName: string;
  CategoryDescription: string;
  Keywords: string[];
  Maturity: string;
  Maintainers: Maintainer[];
  MinKubeVersion: string;
  Provider: string;
  Links: Link[];
  Experiments: string[];
  ChaosExpCRDLink: string;
  Platforms: string[];
  ChaosType: string;
}

export interface Maintainer {
  Name: string;
  Email: string;
}

export interface Link {
  Name: string;
  Url: string;
}

export interface Metadata {
  Name: string;
  Version: string;
  Annotations: Annotation[];
}

export interface Annotation {
  Categories: string;
  Vendor: string;
  CreatedAt: string;
  Repository: string;
  Support: string;
  ChartDescription: string;
}

export interface PackageInfo {
  PackageName: string;
  Experiments: Experiments[];
}

export interface Experiments {
  Name: string;
  Csv: string;
  Desc: string;
}

export interface ChartsInput {
  HubName: string;
  UserName: string;
  RepoURL: string;
  RepoBranch: string;
}

export interface Charts {
  getCharts: Chart[];
}

export interface ExperimentDetail {
  getHubExperiment: Chart;
}

export interface HubDetails {
  id: string;
  HubName: string;
  RepoURL: string;
  RepoBranch: string;
  TotalExp: string;
  IsAvailable: boolean;
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
