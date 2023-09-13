import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import { useAppStore } from '@context';
import { useDeepCompareEffect } from './useDeepCompareEffect';

export type Title = string | string[];

export interface UseDocumentTitleReturn {
  updateTitle: (newTitle: Title) => void;
}

export function useDocumentTitle(title: Title): UseDocumentTitleReturn {
  const { getString } = useStrings();
  const { projectID: projectIdFromParams, accountID } = useParams<{ projectID: string; accountID: string }>();
  const projectIdFromLocalStorage = localStorage.getItem('projectID');
  const { projectName, currentUserInfo } = useAppStore();

  const getStringFromTitle = (str: Title): string => (Array.isArray(str) ? str.filter(s => s).join(' | ') : str);

  const updateTitle = (newTitle: Title): void => {
    const titleArray = [getStringFromTitle(newTitle), getString('litmusChaos')];

    if (accountID && projectIdFromParams) {
      // If you're in project scoped routes, add project name to title from appStore
      let projectTitle = '';
      if (projectIdFromParams === projectIdFromLocalStorage) {
        projectTitle = projectName || projectIdFromParams;
      } else {
        projectTitle = projectIdFromParams;
      }

      titleArray.splice(1, 0, projectTitle);
    } else if (accountID && !projectIdFromParams) {
      // If you're in account scoped routes, add account ID to title
      let accountTitle = '';
      if (accountID === currentUserInfo?.ID) {
        accountTitle = currentUserInfo?.username || accountID;
      } else {
        accountTitle = accountID;
      }
      titleArray.splice(1, 0, accountTitle);
    }

    document.title = titleArray.filter(s => s).join(' | ');
  };

  useDeepCompareEffect(() => {
    updateTitle(title);

    return () => {
      // reset title on unmount
      document.title = getString('litmusChaos');
    };
  }, [title]);

  return {
    updateTitle
  };
}
