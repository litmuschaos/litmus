import { PermissionGroup } from '@models';
import { getUserDetails } from './userDetails';

export function isUserAllowed(permission: string): boolean {
  const { role } = getUserDetails();

  if (role) {
    if (role === PermissionGroup.OWNER) {
      return false;
    } else if (role === PermissionGroup.EDITOR) {
      if (permission === PermissionGroup.EDITOR || permission === PermissionGroup.VIEWER) {
        return false;
      }
    } else if (role === PermissionGroup.VIEWER) {
      if (permission === PermissionGroup.VIEWER) {
        return false;
      }
    }
  }
  return true;
}
