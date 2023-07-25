export interface GitOpsData {
  enabled: boolean;
  projectID: string | null;
  branch: string | null;
  repoURL: string | null;
  authType: string | null;
  token: string | null;
  userName: string | null;
  password: string | null;
  sshPrivateKey: string | null;
}

export interface GetGitOpsDetailRequest {
  getGitOpsDetails: GitOpsData;
}
