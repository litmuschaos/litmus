export interface Member {
  email: string;
  firstName: string;
  invitation: string;
  joinedAt: string;
  role: string;
  userID: string;
  userName: string;
  deactivatedAt: string;
}

export interface Project {
  members: Member[];
  name: string;
  uid: string;
  id: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  removedAt: string;
}

export interface Owner {
  userID: string;
  username: string;
}

export interface MemberData {
  owner: Owner[];
  total: number;
}

export interface ProjectStats {
  name: string;
  projectID: string;
  members: MemberData;
}

export interface UserDetails {
  username: string;
  projects: Project[];
  name: string;
  email: string;
  id: string;
  companyName: string;
  updatedAt: string;
  createdAt: string;
  removedAt: string;
  isEmailVerified: string;
  role: string;
}

export interface MyHubDetail {
  id: string;
  hubName: string;
  repoBranch: string;
  repoURL: string;
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
  loggedIn: boolean;
  createdAt: string;
  updatedAt: string;
  deactivatedAt: string;
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
  myHubDetails: MyHubInput;
  projectID: string;
}

export enum MyHubType {
  BASIC = 'BASIC',
  TOKEN = 'TOKEN',
  SSH = 'SSH',
  NONE = 'NONE',
}

export interface Projects {
  getProjects: Project[];
}

export interface ProjectDetail {
  getProject: Project;
}

export interface ProjectDetailVars {
  projectID: string;
}

export enum Role {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  OWNER = 'OWNER',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
}

export enum UserStatus {
  DELETED = 'DELETED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
