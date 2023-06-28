export interface SSHKey {
  privateKey: string;
  publicKey: string;
}

export interface SSHKeys {
  generateSSHKey: SSHKey;
}

export enum HubType {
  git = 'GIT',
  remote = 'REMOTE',
  edit = 'EDIT',
  none = 'NONE',
}

export interface MyHubRequest {
  id?: string;
  hubName: string;
  repoURL: string;
  repoBranch: string;
  isPrivate: Boolean;
  authType: AuthType;
  token?: string;
  userName?: string;
  password?: string;
  sshPrivateKey?: string;
  sshPublicKey?: string;
  projectID: string;
}

export interface MyHubData {
  id: string;
  repoURL: string;
  repoBranch: string;
  projectID: string;
  hubName: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditHub {
  isEditing: boolean;
  hubType: string;
}

export interface CreateMyHub {
  request: MyHubRequest;
}

export interface CreateRemoteMyHub {
  request: {
    hubName: string;
    repoURL: string;
    projectID: string;
  };
}

export interface GitHub {
  HubName: string;
  GitURL: string;
  GitBranch: string;
  RemoteURL?: string;
}

export enum AuthType {
  BASIC = 'BASIC',
  TOKEN = 'TOKEN',
  SSH = 'SSH',
  NONE = 'NONE',
}

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
  provider: {
    name: string;
  };
  scenarios?: string[];
  links: Link[];
  experiments: string[];
  chaosExpCRDLink: string;
  platforms: string[];
  chaosType: string;
}

export interface ExperimentDetails {
  name: string;
  description: string;
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
  CSV: string;
  desc: string;
}

export interface ChartsInput {
  hubName: string;
  userName: string;
  repoURL: string;
  repoBranch: string;
}

export interface Charts {
  listCharts: Chart[];
}
export interface ExperimentDetail {
  getHubExperiment: Chart;
}

export interface PreDefinedScenarios {
  tags?: string[];
  workflowCSV: string;
  workflowManifest: string;
  workflowName: string;
}

export interface PreDefinedScenariosList {
  listPredefinedWorkflows: PreDefinedScenarios[];
}

export interface HubDetails {
  id: string;
  hubName: string;
  repoURL: string;
  repoBranch: string;
  totalExp: string;
  totalScenarios: string;
  isAvailable: boolean;
  authType?: AuthType;
  hubType: HubType;
  isPrivate: boolean;
  token: string;
  userName: string;
  password: string;
  sshPrivateKey: string;
  sshPublicKey: string;
  lastSyncedAt: string;
}

export interface HubStatus {
  listHubStatus: HubDetails[];
}
