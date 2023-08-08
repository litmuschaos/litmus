import { PermissionGroup } from '@models';
import { useAppStore } from '@context';

interface UserPermissionsProps {
  permission: string;
}

export function usePermissions(props: UserPermissionsProps): boolean {
  const { permission } = props;
  const { projectRole } = useAppStore();

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
