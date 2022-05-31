export interface SSHKey {
  privateKey: string;
  publicKey: string;
}

export interface SSHKeys {
  generateSSHKey: SSHKey;
}

export interface MyHubRequest {
  id?: string;
  hubName: string;
  repoURL: string;
  repoBranch: string;
  isPrivate: Boolean;
  authType: MyHubType;
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

export interface CreateMyHub {
  request: MyHubRequest;
}

export enum MyHubType {
  BASIC = 'BASIC',
  TOKEN = 'TOKEN',
  SSH = 'SSH',
  NONE = 'NONE',
}
