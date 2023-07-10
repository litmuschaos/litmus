import type { Invitation } from '@api/entities/project';
import type { PermissionGroup } from '@models';

export interface ProjectMember {
  UserID: string;
  Username?: string;
  Name?: string;
  Role: PermissionGroup;
  Email?: string;
  Invitation: Invitation;
  JoinedAt: string;
  DeactivatedAt?: string;
}
