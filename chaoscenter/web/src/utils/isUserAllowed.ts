import { PermissionGroup } from '@models';
import { getUserDetails } from './userDetails';

export function isUserAllowed(permission: string): boolean {
  const { projectRole } = getUserDetails();

  if (projectRole) {
    if (projectRole === PermissionGroup.OWNER) {
      return false;
    } else if (projectRole === PermissionGroup.EDITOR) {
      if (permission === PermissionGroup.EDITOR || permission === PermissionGroup.VIEWER) {
        return false;
      }
    } else if (projectRole === PermissionGroup.VIEWER) {
      if (permission === PermissionGroup.VIEWER) {
        return false;
      }
    }
  }
  return true;
}
