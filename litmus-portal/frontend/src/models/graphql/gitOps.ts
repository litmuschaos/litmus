export interface GitOpsData {
  Enabled: boolean;
  ProjectID: string | null;
  Branch: string | null;
  RepoURL: string | null;
  AuthType: string | null;
  Token: string | null;
  UserName: string | null;
  Password: string | null;
  SSHPrivateKey: string | null;
}

export interface GitOpsDetail {
  getGitOpsDetails: GitOpsData;
}
