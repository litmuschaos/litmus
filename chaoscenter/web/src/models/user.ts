export interface UserInfo {
  ID: string;
  username: string;
  userRole: string;
  email?: string;
  fullName?: string;
}

export interface Project {
  Name: string;
  ProjectID: string;
  Members: Members;
}

export interface Members {
  Owner: Pick<UserInfo, 'ID' | 'username'>[];
  Total: number;
}

export interface ListProject {
  UpdatedAt: number;
  CreatedAt: number;
  CreatedBy: string;
  UpdatedBy: string;
  IsRemoved: boolean;
  ID: string;
  UID: string;
  Name: string;
  Members: Contributor[];
  State: string;
}

export interface Contributor {
  UserID: string;
  UserName: string;
  Name: string;
  Role: string;
  Email: string;
  Invitation: string;
  JoinedAt: string;
  DeactivatedAt: null;
}
