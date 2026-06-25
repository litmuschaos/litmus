import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { AppStoreContext } from '@context';
import { usePermissions } from '@utils';
import { PermissionGroup } from '@models';

type WrapperProps = {
  children: React.ReactElement;
};

const updateAppStore = (): void => undefined;

const createWrapper = (projectRole?: string): React.ComponentType<WrapperProps> => {
  const Wrapper = ({ children }: WrapperProps): React.ReactElement => {
    return (
      <AppStoreContext.Provider
        value={{
          currentUserInfo: { ID: 'uid', username: 'admin', userRole: 'admin' },
          matchPath: '/account/:accountID',
          projectID: 'test-project',
          projectRole,
          renderUrl: '/account/uid',
          updateAppStore
        }}
      >
        {children}
      </AppStoreContext.Provider>
    );
  };

  return Wrapper;
};

describe('usePermissions', () => {
  test('Owner has access to all permissions (returns false = not disabled)', () => {
    const { result } = renderHook(() => usePermissions({ permission: PermissionGroup.OWNER }), {
      wrapper: createWrapper('Owner')
    });
    expect(result.current).toBe(false);
  });

  test('Executor has access to Executor and Viewer permissions', () => {
    const { result: executorPerm } = renderHook(() => usePermissions({ permission: PermissionGroup.Executor }), {
      wrapper: createWrapper('Executor')
    });
    expect(executorPerm.current).toBe(false);

    const { result: viewerPerm } = renderHook(() => usePermissions({ permission: PermissionGroup.VIEWER }), {
      wrapper: createWrapper('Executor')
    });
    expect(viewerPerm.current).toBe(false);
  });

  test('Executor cannot access Owner permissions', () => {
    const { result } = renderHook(() => usePermissions({ permission: PermissionGroup.OWNER }), {
      wrapper: createWrapper('Executor')
    });
    expect(result.current).toBe(true);
  });

  test('Viewer can only access Viewer permissions', () => {
    const { result: viewerPerm } = renderHook(() => usePermissions({ permission: PermissionGroup.VIEWER }), {
      wrapper: createWrapper('Viewer')
    });
    expect(viewerPerm.current).toBe(false);
  });

  test('Viewer cannot access Executor or Owner permissions', () => {
    const { result: executorPerm } = renderHook(() => usePermissions({ permission: PermissionGroup.Executor }), {
      wrapper: createWrapper('Viewer')
    });
    expect(executorPerm.current).toBe(true);

    const { result: ownerPerm } = renderHook(() => usePermissions({ permission: PermissionGroup.OWNER }), {
      wrapper: createWrapper('Viewer')
    });
    expect(ownerPerm.current).toBe(true);
  });

  test('No role (undefined) disables all permissions', () => {
    const { result } = renderHook(() => usePermissions({ permission: PermissionGroup.VIEWER }), {
      wrapper: createWrapper(undefined)
    });
    expect(result.current).toBe(true);
  });

  test('Empty string role disables all permissions', () => {
    const { result } = renderHook(() => usePermissions({ permission: PermissionGroup.VIEWER }), {
      wrapper: createWrapper('')
    });
    expect(result.current).toBe(true);
  });
});
