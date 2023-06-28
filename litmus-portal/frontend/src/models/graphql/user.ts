export interface Member {
  Email: string;
  FirstName: string;
  Invitation: string;
  JoinedAt: string;
  Role: string;
  UserID: string;
  UserName: string;
  deactivated_at: string;
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
  UserID: string;
  Username: string;
}

export interface MemberData {
  Owner: Owner[];
  Total: number;
}

export interface ProjectStats {
  Name: string;
  ProjectID: string;
  Members: MemberData;
}

export interface UserDetails {
  Username: string;
  Projects: Project[];
  Name: string;
  Email: string;
  Id: string;
  CompanyName: string;
  UpdatedAt: string;
  CreatedAt: string;
  RemovedAt: string;
  IsEmailVerified: string;
  Role: string;
}

export interface MyHubDetail {
  id: string;
  hubName: string;
  repoBranch: string;
  repoURL: string;
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
  created_at: string;
  updated_at: string;
  deactivated_at: string;
}

export interface Projects {
  getProjects: Project[];
}

export interface ProjectDetail {
  getProject: Project;
}

export enum Role {
  VIEWER = 'Viewer',
  EDITOR = 'Editor',
  OWNER = 'Owner',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum InvitationStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
}

export enum UserStatus {
  DELETED = 'DELETED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
