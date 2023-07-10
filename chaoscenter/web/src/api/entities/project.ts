import type { PermissionGroup } from '@models';

export enum Invitation {
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  EXITED = 'Exited'
}

export interface Members {
  UserID: string;
  Role: PermissionGroup;
  Invitation: Invitation;
  JoinedAt: string;
}

export interface Project {
  ID: string;
  Name: string;
  Members: Members[];
  UID: string;
}
