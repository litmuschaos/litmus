import { useHistory } from 'react-router-dom';
import { paths } from '@routes/RouteDefinitions';

interface UseLogoutReturn {
  forceLogout: () => void;
}

export const useLogout = (): UseLogoutReturn => {
  const history = useHistory();

  const forceLogout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('projectRole');
    localStorage.removeItem('projectID');
    localStorage.removeItem('accountID');
    localStorage.removeItem('accountRole');

    history.push(paths.toLogin());
  };

  return { forceLogout };
};
