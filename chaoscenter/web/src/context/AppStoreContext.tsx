import React, { createContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import type { UserInfo } from '@models';

export interface AppStoreContextProps {
  readonly projectID?: string;
  readonly projectRole?: string;
  readonly currentUserInfo?: UserInfo;
  readonly matchPath?: string;
  readonly renderUrl?: string;
  updateAppStore(
    data: Partial<
      Pick<AppStoreContextProps, 'projectID' | 'projectRole' | 'currentUserInfo' | 'matchPath' | 'renderUrl'>
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

export const AppStoreProvider: React.FC<AppStoreContextProps> = ({ children, ...props }) => {
  const history = useHistory();
  const [appStore, setAppStore] = React.useState<AppStoreContextProps>(props);
  const { projectID: projectIDFromParams } = useParams<{ projectID: string }>();

  React.useEffect(() => {
    if (projectIDFromParams) {
      setAppStore(prev => ({ ...prev, projectID: projectIDFromParams }));
      localStorage.setItem('projectID', projectIDFromParams);
    }
  }, [projectIDFromParams]);

  const updateAppStore = React.useCallback(
    (data: Partial<AppStoreContextProps>) => {
      setAppStore(prev => ({ ...prev, ...data }));
      if (data.projectID) {
        localStorage.setItem('projectID', data.projectID);
        history.replace(`/`);
      }
    },
    [setAppStore]
  );

  return <AppStoreContext.Provider value={{ ...appStore, updateAppStore }}>{children}</AppStoreContext.Provider>;
};
