export interface Member {
  Email: string;
  FirstName: string;
  Invitation: string;
  JoinedAt: string;
  Role: string;
  UserID: string;
  UserName: string;
  DeactivatedAt: string;
}

export interface Project {
  Members: Member[];
  Name: string;
  UID: string;
  ID: string;
  State: string;
  CreatedAt: string;
  UpdatedAt: string;
  RemovedAt: string;
}

export interface Owner {
  UserId: string;
  Username: string;
}

export interface MemberData {
  Owner: Owner[];
  Total: number;
}

export interface ProjectStats {
  Name: string;
  ProjectId: string;
  Members: MemberData;
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
  userID: string;
  role: string;
}

export interface UpdateUser {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserData {
  _id: string;
  username: string;
  email: string;
  name: string;
  logged_in: boolean;
  created_at: string;
  updated_at: string;
  deactivated_at: string;
}

export interface UpdateUserStateInput {
  uid: string;
  isDeactivate: boolean;
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

export enum Role {
  viewer = 'Viewer',
  editor = 'Editor',
  owner = 'Owner',
}

export enum UserRole {
  admin = 'admin',
  user = 'user',
}

export enum InvitationStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
}

export enum UserStatus {
  DELETED = 'deleted',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
