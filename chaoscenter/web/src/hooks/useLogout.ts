import { useHistory } from 'react-router-dom';
import { paths } from '@routes/RouteDefinitions';
import config from '@config';

interface UseLogoutReturn {
  forceLogout: () => void;
}

export const useLogout = (): UseLogoutReturn => {
  const history = useHistory();

  const forceLogout = (): void => {
    const token = localStorage.getItem('token') ?? '';
    fetch(`${config.restEndpoints?.authUri}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('projectID');
      history.push(paths.toLogin());
    });
  };

  return { forceLogout };
};
