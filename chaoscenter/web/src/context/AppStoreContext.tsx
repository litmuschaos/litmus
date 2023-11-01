import React, { createContext } from 'react';
import jwtDecode from 'jwt-decode';
import type { DecodedTokenType, UserInfo } from '@models';
import { getUserDetails } from '../utils/userDetails';

export interface AppStoreContextProps {
  readonly projectID?: string;
  readonly projectName?: string;
  readonly projectRole?: string;
  readonly currentUserInfo?: UserInfo;
  readonly matchPath?: string;
  readonly renderUrl?: string;
  updateAppStore(
    data: Partial<
      Pick<
        AppStoreContextProps,
        'projectID' | 'projectName' | 'projectRole' | 'currentUserInfo' | 'matchPath' | 'renderUrl'
      >
    >
  ): void;
}

export const AppStoreContext = createContext<AppStoreContextProps>({
  projectID: '',
  projectRole: '',
  currentUserInfo: {
    ID: '',
    username: '',
    userRole: ''
  },
  matchPath: '',
  renderUrl: '',
  updateAppStore: () => void 0
});

export function useAppStore(): AppStoreContextProps {
  return React.useContext(AppStoreContext);
}

export const AppStoreProvider: React.FC<AppStoreContextProps> = ({ children }) => {
  const userDetails = getUserDetails();
  const tokenDecode: DecodedTokenType | undefined = userDetails.accessToken
    ? jwtDecode(userDetails.accessToken)
    : undefined;
  const [appStore, setAppStore] = React.useState<AppStoreContextProps>({
    projectID: userDetails.projectID,
    projectRole: userDetails.projectRole,
    currentUserInfo: {
      ID: tokenDecode?.uid ?? '',
      username: tokenDecode?.username ?? '',
      userRole: tokenDecode?.role ?? ''
    },
    renderUrl: `/account/${tokenDecode?.uid}`,
    matchPath: '/account/:accountID',
    updateAppStore: () => void 0
  });
  const updateAppStore = React.useCallback(
    (data: Partial<AppStoreContextProps>) => {
      setAppStore(prev => ({ ...prev, ...data }));
    },
    [setAppStore]
  );

  return <AppStoreContext.Provider value={{ ...appStore, updateAppStore }}>{children}</AppStoreContext.Provider>;
};
