import type { PermissionGroup } from '@models';

export interface ProjectMember {
  UserID: string;
  Username: string;
  Name: string;
  Role: PermissionGroup;
  Email: string;
  Invitation: Invitation;
  JoinedAt: string;
  DeactivatedAt: string;
}

export enum Invitation {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  DECLNED = 'Declined',
  EXITED = 'Exited'
}
