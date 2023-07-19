import type { PermissionGroup } from '@models';

export enum Invitation {
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  EXITED = 'Exited'
}

export interface Members {
  userID: string;
  name: string;
  username: string;
  email: string;
  role: PermissionGroup;
  invitation: Invitation;
  joinedAt: string;
}

export interface Project {
  projectID: string;
  name: string;
  members: Members[];
  UID: string;
}
