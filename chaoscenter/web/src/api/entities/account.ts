import type { PermissionGroup as Role } from '@models';
import type { Audit } from '.';

export interface User extends Audit {
  id: string;
  userName: string;
  password: string;
  email: string;
  name: string;
  role: Role;
  deactivatedAt: number;
}
