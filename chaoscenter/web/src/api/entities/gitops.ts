export interface GitOpsConfig {
  enabled: boolean;
  branch: string;
  repoURL: string;
  authType: string;
  token: string;
  userName: string;
  password: string;
  sshPrivateKey: string;
}

export interface GitOpsConfigRequest {
  branch: string;
  repoURL: string;
  authType: string;
  token: string;
  userName: string;
  password: string;
  sshPrivateKey: string;
}

export interface GetGitOpsDetailResponse {
  getGitOpsDetails: GitOpsConfig;
}

export interface EnableGitOpsRequest {
  projectID: string;
  configurations: GitOpsConfigRequest;
}

export interface DisableGitOpsRequest {
  projectID: string;
}

export interface UpdateGitOpsRequest {
  projectID: string;
  configurations: GitOpsConfigRequest;
}
