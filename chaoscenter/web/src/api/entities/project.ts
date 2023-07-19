import type { PermissionGroup as Role } from '@models';

export interface Member {
  userID: string;
  role: Role;
  invitation: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  members: Member[];
  state: string;
  createdAt: string;
  updatedAt: string;
  removedAt: string;
}
