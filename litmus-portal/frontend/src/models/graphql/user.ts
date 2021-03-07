export interface Member {
  user_id: string;
  user_name: string;
  role: string;
  invitation: string;
  name: string;
  email: string;
  joined_at: string;
}

export interface Project {
  members: Member[];
  name: string;
  id: string;
}

export interface UserDetails {
  username: string;
  projects: Project[];
  name: string;
  email: string;
  id: string;
  company_name: string;
  updated_at: string;
  created_at: string;
  removed_at: string;
  is_email_verified: string;
  state: string;
  role: string;
}

export interface MyHubDetail {
  id: string;
  HubName: string;
  RepoBranch: string;
  RepoURL: string;
}

export interface CurrentUserDetails {
  getUser: UserDetails;
}

export interface CurrentUserDedtailsVars {
  username: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  name: string;
  project_name: string;
}

export interface UpdateUser {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SSHKey {
  privateKey: string;
  publicKey: string;
}

export interface SSHKeys {
  generaterSSHKey: SSHKey;
}

export interface MyHubInput {
  id?: string;
  HubName: string;
  RepoURL: string;
  RepoBranch: string;
  IsPrivate: Boolean;
  AuthType: MyHubType;
  Token?: string;
  UserName?: string;
  Password?: string;
  SSHPrivateKey?: string;
  SSHPublicKey?: string;
}

export interface MyHubData {
  id: string;
  RepoURL: string;
  RepoBranch: string;
  ProjectID: string;
  HubName: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CreateMyHub {
  MyHubDetails: MyHubInput;
  projectID: string;
}

export enum MyHubType {
  basic = 'basic',
  token = 'token',
  ssh = 'ssh',
  none = 'none',
}

export interface Projects {
  listProjects: Project[];
}

export interface ProjectDetail {
  getProject: Project;
}

export interface ProjectDetailVars {
  projectID: string;
}
